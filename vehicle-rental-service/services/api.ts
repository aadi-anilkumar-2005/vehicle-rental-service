import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Vehicle, RentalShop, Booking } from "@/types";

const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];
  if (localhost) {
    return `http://${localhost}:8000/api`;
  }
  return "http://localhost:8000/api";
};

const API_BASE_URL = getBaseUrl();

export const makeAbsoluteUrl = (url?: string | null): string => {
  if (!url) return "";

  const origin = API_BASE_URL.replace(/\/api\/?$/, "");

  // If the backend returns a full URL with localhost or 127.0.0.1, replace the host
  // with our dynamic origin (which has the correct IP for the device/emulator).
  if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) {
    try {
      const urlPath = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "");
      return `${origin}${urlPath}`;
    } catch (e) {
      // ignore parsing errors
    }
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const prefix = url.startsWith("/") ? "" : "/";
  return `${origin}${prefix}${url}`;
};

export const api = {
  async getVehicles(): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/vehicles/`);
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    const data = await response.json();
    return data.map(mapBackendVehicleToFrontend);
  },

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch vehicle");
    const data = await response.json();
    return mapBackendVehicleToFrontend(data);
  },

  async getRentalShops(search?: string): Promise<RentalShop[]> {
    const url = search
      ? `${API_BASE_URL}/shops/?search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/shops/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch shops");
    const data = await response.json();
    return data.map(mapBackendShopToFrontend);
  },

  async getRentalShop(id: string): Promise<RentalShop> {
    const response = await fetch(`${API_BASE_URL}/shops/${id}/`);
    if (!response.ok) throw new Error("Failed to fetch shop");
    const data = await response.json();
    return mapBackendShopToFrontend(data);
  },

  async getShopVehicles(shopId: string): Promise<Vehicle[]> {
    const response = await fetch(`${API_BASE_URL}/vehicles/?shop=${shopId}`);
    if (!response.ok) throw new Error("Failed to fetch shop vehicles");
    const data = await response.json();
    return data.map(mapBackendVehicleToFrontend);
  },

  async createBooking(bookingData: {
    vehicle_id: string;
    booking_type: "hour" | "day";
    start_date: string;
    duration: number;
    delivery_option: "delivery";
    delivery_address?: string;
    payment_method: "card" | "upi" | "wallet";
  }): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/bookings/create/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create booking");
    }

    return await response.json();
  },

  async getBookings(): Promise<Booking[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch bookings");
    const data = await response.json();
    return data.map(mapBackendBookingToFrontend);
  },

  async getBookingDetails(id: string): Promise<Booking> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/bookings/${id}/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch booking details");
    const data = await response.json();
    return mapBackendBookingToFrontend(data);
  },

  async cancelBooking(id: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel/`, {
      method: "POST",
      headers: authHeaders(token),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.status || "Failed to cancel booking");
    }
  },

  async requestPickup(id: string, returnLocation: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${API_BASE_URL}/bookings/${id}/request_pickup/`,
      {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ return_location: returnLocation }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to request pickup");
    }
  },
};

// ── Review Types & API ────────────────────────────────────────────────────────

export interface ShopReview {
  id: string;
  username: string;
  user_initials: string;
  rating: number;
  comment: string;
  owner_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface ShopReviewsResponse {
  reviews: ShopReview[];
  user_has_reviewed: boolean;
  user_review: ShopReview | null;
  avg_rating: number;
  review_count: number;
}

export const reviewApi = {
  async getShopReviews(
    shopId: string,
    token: string,
  ): Promise<ShopReviewsResponse> {
    const response = await fetch(`${API_BASE_URL}/shops/${shopId}/reviews/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch reviews");
    return await response.json();
  },

  async submitReview(
    shopId: string,
    rating: number,
    comment: string,
    token: string,
  ): Promise<ShopReview> {
    const response = await fetch(`${API_BASE_URL}/shops/${shopId}/reviews/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, comment }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit review");
    }
    return await response.json();
  },
};

const mapBackendBookingToFrontend = (data: any): Booking => {
  return {
    id: data.id.toString(),
    vehicleId: data.vehicle.id
      ? data.vehicle.id.toString()
      : data.vehicle.toString(),
    vehicle: data.vehicle.id
      ? mapBackendVehicleToFrontend(data.vehicle)
      : ({} as any),
    shop: data.shop.id ? mapBackendShopToFrontend(data.shop) : ({} as any),
    startDate: data.start_date,
    endDate: data.end_date,
    totalPrice: parseFloat(data.total_price),
    status: data.status,
    deliveryOption: data.delivery_option,
    deliveryAddress: data.delivery_address,
    returnLocation: data.return_location,
  } as Booking;
};

const mapBackendVehicleToFrontend = (data: any): Vehicle => {
  return {
    id: data.id.toString(),
    shopId: data.shop.toString(), // or data.shop_id if DRF returns ID
    type: data.type,
    name: data.name,
    brand: data.brand,
    model: data.model,
    number: data.number,
    images: (data.images || []).map(makeAbsoluteUrl),
    pricePerHour: parseFloat(data.price_per_hour),
    pricePerDay: parseFloat(data.price_per_day),
    fuelType: data.fuel_type,
    transmission: data.transmission,
    seating: data.seating,
    isAvailable: data.is_available,
    features: data.features || [],
    vehicleNumber: data.vehicle_number,
  };
};

const mapBackendShopToFrontend = (data: any): RentalShop => {
  return {
    id: data.id.toString(),
    name: data.name,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone,
    image: makeAbsoluteUrl(data.image),
    rating: data.rating,
    reviewCount: data.review_count,
    operatingHours: data.operating_hours,
    isOpen: data.is_open,
    vehicleCount: data.vehicleCount || { cars: 0, bikes: 0 },
    // distance is usually calculated on frontend based on user location
  };
};

// ── Chat Types ─────────────────────────────────────────────────────────────────

export interface ChatConversation {
  id: string;
  shopId: string;
  shopName: string;
  partnerName: string;
  partnerRole: string;
  isOnline: boolean;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "staff" | "owner";
  text: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  /** 'me' when the logged-in user sent this, 'them' otherwise */
  sender: "me" | "them";
}

// ── Chat API ───────────────────────────────────────────────────────────────────

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Token ${token}`,
});

const mapConversation = (data: any): ChatConversation => ({
  id: data.id.toString(),
  shopId: data.shop_id.toString(),
  shopName: data.shop_name,
  partnerName: data.partner_name || "",
  partnerRole: data.partner_role || "",
  isOnline: data.is_online ?? false,
  lastMessage: data.last_message_text ?? "",
  time: data.last_message_time ?? "",
  unreadCount: data.unread_count ?? 0,
});

const mapMessage = (data: any, myUserId: string): ChatMessage => ({
  id: data.id.toString(),
  conversationId: data.conversation.toString(),
  senderId: data.sender_id.toString(),
  senderName: data.sender_name ?? "",
  senderRole: data.sender_role,
  text: data.text ?? "",
  imageUrl: data.image_url ? makeAbsoluteUrl(data.image_url) : undefined,
  isRead: data.is_read,
  createdAt: data.created_at,
  sender: data.sender_id.toString() === myUserId ? "me" : "them",
});

export const chatApi = {
  /** List all conversations for the logged-in user. */
  async getConversations(token: string): Promise<ChatConversation[]> {
    const resp = await fetch(`${API_BASE_URL}/chat/conversations/`, {
      headers: authHeaders(token),
    });
    if (!resp.ok) throw new Error("Failed to fetch conversations");
    const data = await resp.json();
    return data.map(mapConversation);
  },

  /**
   * Get an existing conversation with a shop, or create one if none exists.
   * @param shopId  The backend integer ID of the shop (as a string).
   */
  async getOrCreateConversation(
    token: string,
    shopId: string,
  ): Promise<ChatConversation> {
    const resp = await fetch(`${API_BASE_URL}/chat/conversations/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ shop_id: shopId }),
    });
    if (!resp.ok) throw new Error("Failed to get/create conversation");
    const data = await resp.json();
    return mapConversation(data);
  },

  /**
   * Get an existing conversation for a specific booking, or create one if none exists.
   * @param bookingId  The backend integer ID of the booking (as a string).
   */
  async getOrCreateBookingConversation(
    token: string,
    bookingId: string,
  ): Promise<ChatConversation> {
    const resp = await fetch(`${API_BASE_URL}/chat/conversations/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ booking_id: bookingId }),
    });
    if (!resp.ok) throw new Error("Failed to get/create booking conversation");
    const data = await resp.json();
    return mapConversation(data);
  },

  /**
   * Get all messages in a conversation.
   * @param myUserId  The logged-in user's ID (as a string) — used to set sender: 'me'|'them'.
   */
  async getMessages(
    token: string,
    conversationId: string,
    myUserId: string,
  ): Promise<ChatMessage[]> {
    const resp = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages/`,
      { headers: authHeaders(token) },
    );
    if (!resp.ok) throw new Error("Failed to fetch messages");
    const data = await resp.json();
    return data.map((m: any) => mapMessage(m, myUserId));
  },

  /** Send a new text (and/or image) message in a conversation. */
  async sendMessage(
    token: string,
    conversationId: string,
    myUserId: string,
    text: string,
    imageUrl?: string,
  ): Promise<ChatMessage> {
    const resp = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages/`,
      {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ text, image_url: imageUrl ?? null }),
      },
    );
    if (!resp.ok) throw new Error("Failed to send message");
    const data = await resp.json();
    return mapMessage(data, myUserId);
  },
};

// ── Profile Management API ───────────────────────────────────────────────────────────

export interface UserSettings {
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  booking_updates: boolean;
  payment_alerts: boolean;
  promotions: boolean;
  reminders: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "wallet";
  name: string;
  details: string;
  is_default: boolean;
  created_at: string;
}

export interface PaymentMethodCreate {
  type: "card" | "upi" | "wallet";
  name: string;
  details: string;
  card_number?: string;
  card_holder?: string;
  expiry_date?: string;
  is_default: boolean;
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  type: "home" | "work" | "favorite" | "other";
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface KYCDocument {
  full_name: string;
  date_of_birth: string;
  address: string;
  phone: string;
  email: string;
  driving_license_number?: string;
  secondary_doc_type?: string;
  secondary_doc_number?: string;
  status: "not_submitted" | "pending" | "verified" | "rejected";
  submitted_at: string;
  verified_at?: string;
  rejection_reason?: string;
}

export interface KYCDocumentCreate {
  full_name: string;
  date_of_birth: string;
  address: string;
  phone: string;
  email: string;
  driving_license_number?: string;
  driving_license_photo?: any;
  secondary_doc_type?: string;
  secondary_doc_number?: string;
  secondary_doc_photo?: any;
}

export const profileManagementApi = {
  /** Get user profile with extended info */
  async getUserProfileExtended(): Promise<
    UserProfile & { settings: UserSettings }
  > {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/update/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    const data = await response.json();
    return {
      id: data.id.toString(),
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      role: data.role,
      address: data.address || "", // Add address field
      settings: data.settings,
    };
  },

  /** Update user profile information */
  async updateUserProfile(
    profileData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/update/`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error("Failed to update user profile");
    const data = await response.json();
    return {
      id: data.id?.toString() || "1", // Handle missing id safely
      username: data.username || "",
      email: data.email,
      first_name: data.first_name,
      role: data.role || "user",
    };
  },

  /** Change user password */
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/change-password/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to change password");
    }
  },

  /** Get user notification settings */
  async getUserSettings(): Promise<UserSettings> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/settings/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch user settings");
    return await response.json();
  },

  /** Update user notification settings */
  async updateUserSettings(
    settings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/settings/`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error("Failed to update user settings");
    return await response.json();
  },

  /** Get all payment methods */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/payments/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch payment methods");
    const data = await response.json();
    return data.map((pm: any) => ({
      id: pm.id.toString(),
      type: pm.type,
      name: pm.name,
      details: pm.details,
      is_default: pm.is_default,
      created_at: pm.created_at,
    }));
  },

  /** Create new payment method */
  async createPaymentMethod(
    paymentData: PaymentMethodCreate,
  ): Promise<PaymentMethod> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/payments/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error("Failed to create payment method");
    const data = await response.json();
    return {
      id: data.id.toString(),
      type: data.type,
      name: data.name,
      details: data.details,
      is_default: data.is_default,
      created_at: data.created_at,
    };
  },

  /** Update payment method */
  async updatePaymentMethod(
    id: string,
    paymentData: Partial<PaymentMethodCreate>,
  ): Promise<PaymentMethod> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/payments/${id}/`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error("Failed to update payment method");
    const data = await response.json();
    return {
      id: data.id.toString(),
      type: data.type,
      name: data.name,
      details: data.details,
      is_default: data.is_default,
      created_at: data.created_at,
    };
  },

  /** Delete payment method */
  async deletePaymentMethod(id: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/payments/${id}/`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to delete payment method");
  },

  /** Get all saved locations */
  async getSavedLocations(): Promise<SavedLocation[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/locations/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch saved locations");
    const data = await response.json();
    return data.map((loc: any) => ({
      id: loc.id.toString(),
      name: loc.name,
      address: loc.address,
      type: loc.type,
      latitude: loc.latitude,
      longitude: loc.longitude,
      created_at: loc.created_at,
    }));
  },

  /** Create new saved location */
  async createSavedLocation(
    locationData: Omit<SavedLocation, "id" | "created_at">,
  ): Promise<SavedLocation> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/locations/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(locationData),
    });
    if (!response.ok) throw new Error("Failed to create saved location");
    const data = await response.json();
    return {
      id: data.id.toString(),
      name: data.name,
      address: data.address,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: data.created_at,
    };
  },

  /** Update saved location */
  async updateSavedLocation(
    id: string,
    locationData: Partial<SavedLocation>,
  ): Promise<SavedLocation> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/locations/${id}/`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(locationData),
    });
    if (!response.ok) throw new Error("Failed to update saved location");
    const data = await response.json();
    return {
      id: data.id.toString(),
      name: data.name,
      address: data.address,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: data.created_at,
    };
  },

  /** Delete saved location */
  async deleteSavedLocation(id: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/locations/${id}/`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to delete saved location");
  },

  /** Get KYC document status */
  async getKYCDocument(): Promise<KYCDocument> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/kyc/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch KYC document");
    return await response.json();
  },

  /** Submit KYC documents */
  async submitKYCDocument(kycData: KYCDocumentCreate): Promise<KYCDocument> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/kyc/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(kycData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to submit KYC document: ${response.status} ${errorText}`,
      );
    }
    return await response.json();
  },

  /** Submit KYC documents with files */
  async submitKYCDocumentWithFiles(kycData: FormData): Promise<KYCDocument> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/kyc/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: kycData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to submit KYC document: ${response.status} ${errorText}`,
      );
    }
    return await response.json();
  },

  /** Update KYC documents */
  async updateKYCDocument(
    kycData: Partial<KYCDocumentCreate>,
  ): Promise<KYCDocument> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/kyc/`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(kycData),
    });
    if (!response.ok) throw new Error("Failed to update KYC document");
    return await response.json();
  },
};

// ── Profile API ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  role: string;
  address?: string; // Optional address field
}

export interface UserStats {
  total_bookings: number;
  total_spent: number;
  saved_places: number;
  active_bookings: number;
  completed_bookings: number;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("auth_token");
  } catch (e) {
    return null;
  }
};

export const profileApi = {
  /** Get current user profile information */
  async getUserProfile(): Promise<UserProfile> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    const data = await response.json();
    return {
      id: data.id.toString(),
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      role: data.role,
    };
  },

  /** Get user booking statistics */
  async getUserStats(): Promise<UserStats> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/profile/stats/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch user stats");
    const data = await response.json();
    return {
      total_bookings: data.total_bookings,
      total_spent: parseFloat(data.total_spent),
      saved_places: data.saved_places,
      active_bookings: data.active_bookings,
      completed_bookings: data.completed_bookings,
    };
  },

  /** Get all payment methods */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/payments/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch payment methods");
    const data = await response.json();
    return data.map((pm: any) => ({
      id: pm.id.toString(),
      type: pm.type,
      name: pm.name,
      details: pm.details,
      is_default: pm.is_default,
      created_at: pm.created_at,
    }));
  },

  /** Get all saved locations */
  async getSavedLocations(): Promise<SavedLocation[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/locations/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch saved locations");
    const data = await response.json();
    return data.map((loc: any) => ({
      id: loc.id.toString(),
      name: loc.name,
      address: loc.address,
      type: loc.type,
      latitude: loc.latitude,
      longitude: loc.longitude,
      created_at: loc.created_at,
    }));
  },

  /** Get KYC document status for the current user */
  async getKYCDocument(): Promise<{ status: string; [key: string]: any }> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/kyc/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) {
      // If 404 or any error, KYC doesn't exist → not verified
      return { status: "not_submitted" };
    }
    return await response.json();
  },
};

// ── Notifications API ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "promo" | "alert" | "success" | "system";
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  /** Get all notifications for the current user */
  async getNotifications(): Promise<Notification[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${API_BASE_URL}/notifications/`;

    const response = await fetch(url, {
      headers: authHeaders(token),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }
    const data = await response.json();

    // Map backend data to frontend format
    const mappedData = data.map((notification: any) => ({
      id: notification.id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_read: notification.is_read,
      created_at: notification.created_at,
    }));
    return mappedData;
  },

  /** Mark a single notification as read */
  async markNotificationRead(notificationId: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${API_BASE_URL}/notifications/mark-read/${notificationId}/`,
      {
        method: "POST",
        headers: authHeaders(token),
      },
    );
    if (!response.ok) throw new Error("Failed to mark notification as read");
  },

  /** Mark all notifications as read */
  async markAllNotificationsRead(): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    // First get all unread notifications
    const notifications = await this.getNotifications();
    const unreadNotifications = notifications.filter((n) => !n.is_read);

    // Mark each as read (bulk operation)
    const promises = unreadNotifications.map((notification) =>
      this.markNotificationRead(notification.id),
    );

    await Promise.all(promises);
  },

  /** Delete a notification */
  async deleteNotification(notificationId: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${API_BASE_URL}/notifications/delete/${notificationId}/`,
      {
        method: "DELETE",
        headers: authHeaders(token),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete notification");
    }
  },
};

// ── Staff API ───────────────────────────────────────────────────────────

export interface StaffTask {
  id: string;
  type: string;
  vehicleName: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  scheduledTime: string;
  status: "pending" | "in_progress" | "completed";
  bookingId: string;
}

export interface StaffComplaint {
  id: string;
  subject: string;
  description: string;
  status: "open" | "assigned" | "resolved";
  customer_name: string;
  shop_name: string;
  booking_id: string | null;
  created_at: string;
}

export const staffApi = {
  async getAssignedTasks(): Promise<StaffTask[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/staff/tasks/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch assigned tasks");
    const tasks = await response.json();
    return tasks.map((task: any) => ({
      ...task,
      bookingId: task.booking_id ? task.booking_id.toString() : "",
    }));
  },

  async updateTaskStatus(taskId: string, status: string): Promise<StaffTask> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/staff/tasks/${taskId}/`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update task status");
    return await response.json();
  },

  async getAssignedComplaints(): Promise<StaffComplaint[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/staff-complaints/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch assigned complaints");
    const data = await response.json();
    return data.map((c: any) => ({
      id: c.id.toString(),
      subject: c.subject,
      description: c.description,
      status: c.status,
      customer_name: c.customer_name,
      shop_name: c.shop_name,
      booking_id: c.booking_id ? c.booking_id.toString() : null,
      created_at: c.created_at,
    }));
  },

  async resolveComplaint(id: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${API_BASE_URL}/staff-complaints/${id}/resolve/`,
      {
        method: "PATCH",
        headers: authHeaders(token),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to resolve complaint");
    }
  },
};

// ── Complaint API ───────────────────────────────────────────────────────────

export const complaintApi = {
  async submitComplaint(
    subject: string,
    description: string,
    shopId?: string,
    bookingId?: string,
  ): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");

    const body: Record<string, string> = { subject, description };
    if (shopId) body.shop_id = shopId;
    if (bookingId) body.booking_id = bookingId;

    const response = await fetch(`${API_BASE_URL}/complaints/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to submit complaint");
    }

    return await response.json();
  },
};

// ── Favorites API ──────────────────────────────────────────────────────────

export interface FavoriteShop {
  id: string;
  shop_id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  is_open: boolean;
}

export const favoritesApi = {
  async getFavorites(): Promise<FavoriteShop[]> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${API_BASE_URL}/favorites/`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch favorites");
    const data = await response.json();
    return data.map((f: any) => ({
      id: f.id.toString(),
      shop_id: f.shop_id.toString(),
      name: f.name,
      address: f.address,
      image: f.image,
      rating: f.rating,
      is_open: f.is_open,
    }));
  },

  async toggleFavorite(shopId: string): Promise<{ favorited: boolean }> {
    const token = await getAuthToken();
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${API_BASE_URL}/favorites/`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ shop_id: shopId }),
    });
    if (!response.ok) throw new Error("Failed to toggle favorite");
    return await response.json();
  },

  async checkFavorite(shopId: string): Promise<boolean> {
    const favs = await this.getFavorites();
    return favs.some((f) => f.shop_id === shopId);
  },
};

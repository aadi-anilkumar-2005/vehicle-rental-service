import { UserStackParamList } from "@/navigation/types";
import {
  NavigationProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { format } from "date-fns";
import {
  ArrowLeft,
  Bike,
  Calendar,
  Car,
  Clock,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, profileApi, SavedLocation } from "@/services/api";
import { Booking } from "@/types";
import { DeliveryLocationSelector } from "@/components/user/DeliveryLocationSelector";
import { formatCurrency, getImageSource } from '@/lib/utils';

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function BookingDetails() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<UserStackParamList>>();
  const insets = useSafeAreaInsets();
  const { id } = (route.params as { id: string }) || {};

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isRequestingPickup, setIsRequestingPickup] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (!id) {
        setLoading(false);
        setError("No booking ID provided");
        return;
      }

      const fetchBookingDetails = async () => {
        try {
          setLoading(true);
          const data = await api.getBookingDetails(id);
          setBooking(data);
          setError(null);

          try {
            const locs = await profileApi.getSavedLocations();
            setSavedLocations(locs);
          } catch (e) {
            console.log("Failed to load saved locations");
          }
        } catch (err: any) {
          console.error("Error fetching booking details:", err);
          setError(err.message || "Failed to load booking details");
        } finally {
          setLoading(false);
        }
      };

      fetchBookingDetails();
    }, [id]),
  );

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setIsCancelling(true);
              await api.cancelBooking(id);
              // Refetch booking
              const data = await api.getBookingDetails(id);
              setBooking(data);
              Alert.alert("Success", "Your booking has been cancelled.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to cancel booking");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handleModifyBooking = () => {
    Alert.alert(
      "Modify Booking",
      "To modify your dates or duration, please cancel this booking and create a new one.",
      [{ text: "OK" }],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Booking not found</Text>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          bg: styles.statusBgUpcoming,
          text: styles.statusTextUpcoming,
          label: "Upcoming Booking",
        };
      case "completed":
        return {
          bg: styles.statusBgCompleted,
          text: styles.statusTextCompleted,
          label: "Completed",
        };
      case "cancelled":
        return {
          bg: styles.statusBgCancelled,
          text: styles.statusTextCancelled,
          label: "Cancelled",
        };
      case "active":
        return {
          bg: styles.statusBgActive,
          text: styles.statusTextActive,
          label: "Active Rental",
        };
      case "pickup_requested":
        return {
          bg: styles.statusBgUpcoming,
          text: styles.statusTextUpcoming,
          label: "Pending Return",
        };
      default:
        return {
          bg: styles.statusBgUpcoming,
          text: styles.statusTextUpcoming,
          label: "Upcoming",
        };
    }
  };

  const statusStyle = getStatusStyles(booking.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Status banner */}
          <View style={[styles.statusBanner, statusStyle.bg]}>
            <Calendar
              size={18}
              color={statusStyle.text.color}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.statusText, statusStyle.text]}>
              {statusStyle.label}
            </Text>
          </View>

          {/* Vehicle info */}
          <View style={styles.card}>
            <View style={styles.vehicleCardContent}>
              <Image
                source={getImageSource(booking.vehicle.images[0])}
                style={styles.vehicleImage}
              />
              <View style={styles.vehicleInfo}>
                <View style={styles.vehicleTypeContainer}>
                  {booking.vehicle.type === "car" ? (
                    <Car size={14} color="#2dd4bf" />
                  ) : (
                    <Bike size={14} color="#2dd4bf" />
                  )}
                  <Text style={styles.vehicleTypeLabel}>
                    {booking.vehicle.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.vehicleName}>{booking.vehicle.name}</Text>
                <Text style={styles.vehicleModel}>{booking.vehicle.model}</Text>
                <View style={styles.tagsContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {booking.vehicle.transmission}
                    </Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {booking.vehicle.fuelType}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.scheduleContainer}>
              <View style={styles.scheduleRow}>
                <View style={styles.iconBoxPrimary}>
                  <Calendar size={20} color="#2dd4bf" />
                </View>
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.label}>Pickup Date</Text>
                  <Text style={styles.value}>
                    {format(startDate, "EEEE, MMMM d, yyyy")}
                  </Text>
                </View>
              </View>
              <View style={styles.scheduleRow}>
                <View style={styles.iconBoxPrimary}>
                  <Clock size={20} color="#2dd4bf" />
                </View>
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.label}>Pickup Time</Text>
                  <Text style={styles.value}>
                    {format(startDate, "h:mm a")}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.scheduleRow}>
                <View style={styles.iconBoxSecondary}>
                  <Calendar size={20} color="#94a3b8" />
                </View>
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.label}>Return Date</Text>
                  <Text style={styles.value}>
                    {format(endDate, "EEEE, MMMM d, yyyy")}
                  </Text>
                </View>
              </View>
              <View style={styles.scheduleRow}>
                <View style={styles.iconBoxSecondary}>
                  <Clock size={20} color="#94a3b8" />
                </View>
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.label}>Return Time</Text>
                  <Text style={styles.value}>{format(endDate, "h:mm a")}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pickup Location */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.shopContainer}>
              <Image
                source={getImageSource(booking.shop.image)}
                style={styles.shopImage}
              />
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{booking.shop.name}</Text>
                <View style={styles.addressRow}>
                  <MapPin size={14} color="#94a3b8" />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {booking.shop.address}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.outlineButton}>
                <Phone size={16} color="#2dd4bf" style={{ marginRight: 8 }} />
                <Text style={styles.outlineButtonText}>Call Shop</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.solidButtonSmall}>
                <Navigation
                  size={16}
                  color="#0f172a"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.solidButtonTextSmall}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentContainer}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Rental charges</Text>
                <Text style={styles.paymentValue}>
                  {formatCurrency(booking.totalPrice - 5)}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Service fee</Text>
                <Text style={styles.paymentValue}>{formatCurrency(5)}</Text>
              </View>
              <View style={[styles.divider, styles.paymentDivider]} />
              <View style={styles.paymentRow}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>{formatCurrency(booking.totalPrice)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          {booking.status === "upcoming" && (
            <>
              <TouchableOpacity
                style={styles.footerCancelButton}
                onPress={handleCancelBooking}
                disabled={isCancelling}
              >
                <Text style={styles.footerCancelText}>
                  {isCancelling ? "Cancelling..." : "Cancel Booking"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerModifyButton}
                onPress={handleModifyBooking}
                disabled={isCancelling}
              >
                <Text style={styles.footerModifyText}>Modify Booking</Text>
              </TouchableOpacity>
            </>
          )}

          {booking.status === "active" && (
            <View style={styles.activeFooterContent}>
              <TouchableOpacity
                style={styles.footerOutlineButton}
                onPress={() =>
                  navigation.navigate("CustomerComplaint", {
                    bookingId: booking.id,
                  })
                }
              >
                <Text style={styles.footerOutlineText}>Complaint</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerPrimaryButton}
                onPress={() => setShowPickupSelector(true)}
                disabled={isRequestingPickup}
              >
                <Text style={styles.footerPrimaryText}>
                  {isRequestingPickup ? "Requesting..." : "Request Pickup"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {booking.status === "pickup_requested" && (
            <View style={styles.activeFooterContent}>
              <TouchableOpacity
                style={styles.footerOutlineButton}
                onPress={() =>
                  navigation.navigate("CustomerComplaint", {
                    bookingId: booking.id,
                  })
                }
              >
                <Text style={styles.footerOutlineText}>Complaint</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.footerPrimaryButton, { opacity: 0.7 }]}
                disabled
              >
                <Text style={styles.footerPrimaryText}>Return Pending</Text>
              </TouchableOpacity>
            </View>
          )}

          {booking.status === "completed" && (
            <TouchableOpacity
              style={styles.footerModifyButtonFull}
              onPress={() =>
                navigation.navigate("VehicleDetails", { id: booking.vehicleId })
              }
            >
              <Text style={styles.footerModifyText}>Book Again</Text>
            </TouchableOpacity>
          )}

          {booking.status === "cancelled" && (
            <TouchableOpacity
              style={styles.footerModifyButtonFull}
              onPress={() =>
                navigation.navigate("VehicleDetails", { id: booking.vehicleId })
              }
            >
              <Text style={styles.footerModifyText}>Rebook Vehicle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {booking && (
        <DeliveryLocationSelector
          visible={showPickupSelector}
          type="delivery"
          currentAddress={booking.deliveryAddress || booking.shop.address}
          locations={savedLocations}
          onSelect={async (address) => {
            setShowPickupSelector(false);
            try {
              setIsRequestingPickup(true);
              await api.requestPickup(id, address);
              const data = await api.getBookingDetails(id);
              setBooking(data);
              Alert.alert(
                "Success",
                "Pickup has been requested. Staff will contact you shortly.",
              );
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to request pickup");
            } finally {
              setIsRequestingPickup(false);
            }
          }}
          onClose={() => setShowPickupSelector(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Dark background
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 16,
  },
  backLink: {
    marginTop: 12,
    padding: 10,
  },
  backLinkText: {
    color: "#2dd4bf",
    fontSize: 16,
    fontWeight: "600",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  notFoundText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    zIndex: 40,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainContent: {
    padding: 16,
    gap: 24,
  },
  // Status Banner
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBgUpcoming: { backgroundColor: "rgba(45, 212, 191, 0.1)" }, // Teal tint
  statusTextUpcoming: { color: "#2dd4bf" },
  statusBgCompleted: { backgroundColor: "rgba(34, 197, 94, 0.1)" }, // Green tint
  statusTextCompleted: { color: "#22c55e" },
  statusBgCancelled: { backgroundColor: "rgba(239, 68, 68, 0.1)" }, // Red tint
  statusTextCancelled: { color: "#ef4444" },
  statusBgActive: { backgroundColor: "rgba(245, 158, 11, 0.1)" }, // Orange tint
  statusTextActive: { color: "#f59e0b" },

  // Card
  card: {
    backgroundColor: "#1e293b", // Slate-800
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  vehicleCardContent: {
    flexDirection: "row",
    gap: 16,
  },
  vehicleImage: {
    height: 100,
    width: 120,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    resizeMode: "cover",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  vehicleTypeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tagText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  scheduleContainer: {
    gap: 16,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBoxPrimary: {
    backgroundColor: "rgba(45, 212, 191, 0.1)", // Teal tint
    padding: 10,
    borderRadius: 10,
  },
  iconBoxSecondary: {
    backgroundColor: "#334155", // Slate-700
    padding: 10,
    borderRadius: 10,
  },
  scheduleTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 4,
    marginLeft: 56, // Align with text
  },
  // Shop
  shopContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  shopImage: {
    height: 56,
    width: 56,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  shopInfo: {
    flex: 1,
    justifyContent: "center",
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#94a3b8",
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#2dd4bf",
  },
  outlineButtonText: {
    color: "#2dd4bf",
    fontWeight: "600",
    fontSize: 14,
  },
  solidButtonSmall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: "#2dd4bf",
  },
  solidButtonTextSmall: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 14,
  },
  // Payment
  paymentContainer: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#94a3b8",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  paymentDivider: {
    marginLeft: 0,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2dd4bf", // Teal
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  footerContent: {
    flexDirection: "row",
    gap: 16,
  },
  footerCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#2dd4bf",
    alignItems: "center",
    justifyContent: "center",
  },
  footerCancelText: {
    color: "#2dd4bf",
    fontWeight: "600",
    fontSize: 16,
  },
  footerModifyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 9999,
    backgroundColor: "#2dd4bf",
    alignItems: "center",
    justifyContent: "center",
  },
  footerModifyButtonFull: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 9999,
    backgroundColor: "#2dd4bf",
    alignItems: "center",
    justifyContent: "center",
  },
  footerModifyText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
  activeFooterContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  footerOutlineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#2dd4bf",
    alignItems: "center",
    justifyContent: "center",
  },
  footerOutlineText: {
    color: "#2dd4bf",
    fontWeight: "600",
    fontSize: 16,
  },
  footerPrimaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 9999,
    backgroundColor: "#2dd4bf",
    alignItems: "center",
    justifyContent: "center",
  },
  footerPrimaryText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
});

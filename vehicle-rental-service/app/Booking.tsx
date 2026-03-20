import { api, profileApi } from "@/services/api";
import { Vehicle, RentalShop } from "@/types";
import { UserStackParamList } from "@/navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Assuming these components handle their own modal styling,
import { DeliveryLocationSelector } from "@/components/user/DeliveryLocationSelector";

import { PaymentMethod, SavedLocation } from "@/services/api";
import { formatCurrency, getImageSource } from '@/lib/utils';

type DeliveryOption = "delivery";

export default function Booking() {
  const navigation = useNavigation();
  const router = useRouter();
  const route = useRoute<RouteProp<UserStackParamList, "Booking">>();

  const { id, type } = route.params;
  const bookingType = type === "day" ? "day" : "hour";

  // Data state
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [shop, setShop] = useState<RentalShop | null>(null);

  // Database integrations
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [duration, setDuration] = useState(bookingType === "day" ? 1 : 4);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showDeliverySelector, setShowDeliverySelector] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          if (!id) throw new Error("No vehicle ID provided");

          // Check KYC status first
          const kycData = await profileApi.getKYCDocument();
          if (kycData.status !== "verified") {
            Alert.alert(
              "KYC Verification Required",
              "You need to complete KYC verification before booking a vehicle. Please verify your identity in your profile.",
              [
                {
                  text: "Complete KYC",
                  onPress: () => router.push("/user/KYCVerification"),
                },
                { text: "Cancel", onPress: () => navigation.goBack() },
              ]
            );
            return;
          }
          setKycVerified(true);

          const vehicleData = await api.getVehicle(id);
          setVehicle(vehicleData);
          if (vehicleData.shopId) {
            const shopData = await api.getRentalShop(vehicleData.shopId);
            setShop(shopData);
          }

          // Fetch payment and address databases
          const [pmData, locData] = await Promise.all([
            profileApi.getPaymentMethods(),
            profileApi.getSavedLocations(),
          ]);

          setSavedPaymentMethods(pmData);
          setSavedLocations(locData);

          // Pre-select defaults
          const defaultPm = pmData.find((pm) => pm.is_default);
          if (defaultPm) setPaymentMethodId(defaultPm.id);
          else if (pmData.length > 0) setPaymentMethodId(pmData[0].id);

          const defaultLoc = locData.find((loc) => loc.type === "home");
          if (defaultLoc) setDeliveryAddress(defaultLoc.address);
        } catch (err) {
          console.error("Failed to fetch booking data:", err);
          setFetchError("Failed to load vehicle details");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [id]),
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (fetchError || !vehicle || !shop) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.mutedText}>
          {fetchError || "Vehicle not found"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pricePerUnit =
    bookingType === "day" ? vehicle.pricePerDay : vehicle.pricePerHour;
  const deliveryFee = deliveryOption === "delivery" ? 10 : 0;
  const serviceFee = 5;
  const totalPrice = pricePerUnit * duration + deliveryFee + serviceFee;

  const times = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "4:00 PM",
  ];

  // Calendar Logic
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarDays = [];
    // Padding for days before the 1st
    for (let i = 0; i < startingDayIndex; i++) {
      calendarDays.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    return calendarDays;
  };

  const changeMonth = (direction: -1 | 1) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const handleConfirmBooking = async () => {
    if (!deliveryAddress) {
      Alert.alert("Error", "Please set a delivery location");
      return;
    }

    try {
      // Combine date and time for start_date
      const [hours, minutes] = selectedTime.split(":");
      const [period] = selectedTime.split(" ");
      let hour24 = parseInt(hours);

      if (period === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period === "AM" && hour24 === 12) {
        hour24 = 0;
      }

      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hour24, parseInt(minutes));

      const bookingData = {
        vehicle_id: vehicle.id,
        booking_type: bookingType as "hour" | "day",
        start_date: startDateTime.toISOString(),
        duration: duration,
        delivery_option: "delivery" as const,
        delivery_address: deliveryAddress,
        payment_method:
          savedPaymentMethods.find((p) => p.id === paymentMethodId)?.type ||
          "card",
      };

      const response = await api.createBooking(bookingData);

      Alert.alert(
        "Booking confirmed!",
        `Your ${vehicle.name} is booked for ${duration} ${
          bookingType === "day"
            ? duration === 1
              ? "day"
              : "days"
            : duration === 1
              ? "hour"
              : "hours"
        } on ${selectedDate.toLocaleDateString()}`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)/bookings") }],
      );
    } catch (error) {
      Alert.alert(
        "Booking Failed",
        error instanceof Error
          ? error.message
          : "Failed to create booking. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Vehicle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vehicle summary */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Image
              source={getImageSource(vehicle.images[0])}
              style={styles.vehicleImage}
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.mutedText}>{vehicle.model}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#94a3b8" />
                <Text style={styles.locationText}>{shop.name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date selection (Calendar UI) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={20} color="#2dd4bf" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <View style={styles.calendarCard}>
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={styles.monthNavButton}
              >
                <ChevronLeft size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.monthNavButton}
              >
                <ChevronRight size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Week Days */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {generateCalendar().map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      isSelected && styles.selectedDayCell,
                      !isSelected && isToday && styles.todayDayCell,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        !isSelected && isToday && styles.todayDayText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Time selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#2dd4bf" />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
          <View style={styles.grid}>
            {times.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={[
                  styles.gridItem,
                  selectedTime === time
                    ? styles.chipActive
                    : styles.chipInactive,
                ]}
              >
                <Text
                  style={
                    selectedTime === time
                      ? styles.chipTextActive
                      : styles.chipTextInactive
                  }
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {bookingType === "day" ? (
              <CalendarIcon size={20} color="#2dd4bf" />
            ) : (
              <Clock size={20} color="#2dd4bf" />
            )}
            <Text style={styles.sectionTitle}>
              Duration ({bookingType === "day" ? "days" : "hours"})
            </Text>
          </View>
          <View style={styles.durationControl}>
            <TouchableOpacity
              onPress={() => setDuration(Math.max(1, duration - 1))}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.durationDisplay}>
              <Text style={styles.durationValue}>{duration}</Text>
              <Text style={styles.mutedText}>
                {bookingType === "day"
                  ? duration === 1
                    ? "day"
                    : "days"
                  : duration === 1
                    ? "hour"
                    : "hours"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setDuration(duration + 1)}
              style={styles.counterButton}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentContainer}>
            {savedPaymentMethods.length === 0 ? (
              <Text style={styles.mutedText}>
                No saved payment methods. A default card will be used.
              </Text>
            ) : (
              savedPaymentMethods.map((method) => {
                let Icon =
                  method.type === "card"
                    ? CreditCard
                    : method.type === "upi"
                      ? Smartphone
                      : Wallet;

                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setPaymentMethodId(method.id)}
                    style={[
                      styles.paymentOption,
                      paymentMethodId === method.id
                        ? styles.paymentOptionActive
                        : styles.paymentOptionInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.paymentIconBox,
                        paymentMethodId === method.id
                          ? styles.bgPrimary
                          : styles.bgSecondary,
                      ]}
                    >
                      <Icon
                        size={20}
                        color={
                          paymentMethodId === method.id ? "#0f172a" : "#64748b"
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentLabel}>{method.name}</Text>
                      <Text style={styles.mutedText}>
                        {method.details || method.type}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        paymentMethodId === method.id
                          ? styles.borderPrimary
                          : styles.borderGray,
                      ]}
                    >
                      {paymentMethodId === method.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Delivery Option */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={20} color="#2dd4bf" />
            <Text style={styles.sectionTitle}>Vehicle Delivery</Text>
          </View>
          <View style={[styles.outlineActive, { paddingVertical: 12, alignItems: "center" }]}>
            <Text style={styles.outlineTextActive}>
              Home Delivery (+{formatCurrency(10)})
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowDeliverySelector(true)}
            style={styles.locationSelectorBtn}
          >
            <MapPin size={20} color="#2dd4bf" />
            <Text style={styles.locationSelectorText}>
              {deliveryAddress || "Set delivery location..."}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.mutedText}>
              {formatCurrency(pricePerUnit)} × {duration}{" "}
              {bookingType === "day"
                ? duration === 1
                  ? "day"
                  : "days"
                : duration === 1
                  ? "hour"
                  : "hours"}
            </Text>
            <Text style={styles.summaryValue}>{formatCurrency(pricePerUnit * duration)}</Text>
          </View>
          {deliveryFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.mutedText}>Delivery fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.mutedText}>Service fee</Text>
            <Text style={styles.summaryValue}>{formatCurrency(serviceFee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>
            Confirm Booking • {formatCurrency(totalPrice)}
          </Text>
        </TouchableOpacity>
      </View>

      <DeliveryLocationSelector
        visible={showDeliverySelector}
        type="delivery"
        currentAddress={deliveryAddress}
        locations={savedLocations}
        onSelect={(address) => {
          setDeliveryAddress(address);
          setShowDeliverySelector(false);
        }}
        onClose={() => setShowDeliverySelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Dark background
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#0f172a", // Dark header
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#ffffff",
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#1e293b", // Slate-800
  },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: "#1e293b", // Slate-800
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: "row", gap: 16 },
  vehicleImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#334155",
  },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
  mutedText: { fontSize: 14, color: "#94a3b8" }, // Slate-400
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: { fontSize: 12, color: "#94a3b8" },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  // Calendar Styles
  calendarCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDayText: {
    color: "#94a3b8",
    width: 32,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    width: "14.28%", // 7 days in a week
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  selectedDayCell: {
    backgroundColor: "#2dd4bf", // Teal
    borderRadius: 20,
  },
  todayDayCell: {
    borderWidth: 1,
    borderColor: "#2dd4bf",
    borderRadius: 20,
  },
  dayText: {
    color: "#ffffff",
    fontSize: 14,
  },
  selectedDayText: {
    color: "#0f172a", // Dark text on teal
    fontWeight: "700",
  },
  todayDayText: {
    color: "#2dd4bf",
    fontWeight: "600",
  },
  // Time & other styles
  chipActive: {
    backgroundColor: "#2dd4bf", // Teal-400
  },
  chipInactive: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipTextActive: {
    color: "#0f172a", // Dark text on active
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextInactive: {
    color: "#94a3b8", // Slate-400
    fontWeight: "500",
    fontSize: 14,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: {
    width: "31%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  outlineActive: {
    backgroundColor: "rgba(45, 212, 191, 0.05)",
    borderWidth: 1,
    borderColor: "#2dd4bf",
    borderRadius: 12,
  },
  outlineTextActive: {
    color: "#2dd4bf",
    fontWeight: "600",
    fontSize: 14,
  },
  durationControl: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#334155", // Slate-700
    borderRadius: 12,
  },
  counterButtonText: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
  durationDisplay: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  durationValue: { fontSize: 24, fontWeight: "bold", color: "#2dd4bf" },
  paymentContainer: { gap: 12 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#1e293b",
  },
  paymentOptionActive: {
    borderColor: "#2dd4bf",
    backgroundColor: "rgba(45, 212, 191, 0.05)",
  },
  paymentOptionInactive: {
    borderColor: "#334155",
  },
  paymentIconBox: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  bgPrimary: { backgroundColor: "#2dd4bf" },
  bgSecondary: { backgroundColor: "#334155" },
  paymentLabel: { flex: 1, fontWeight: "500", color: "#ffffff" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  borderPrimary: {
    borderColor: "#2dd4bf",
    backgroundColor: "transparent",
  },
  borderGray: { borderColor: "#64748b" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2dd4bf",
  },
  locationSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    borderStyle: "dashed",
    marginTop: 12,
  },
  locationSelectorText: { marginLeft: 12, fontSize: 14, color: "#ffffff" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryValue: { fontWeight: "500", color: "#ffffff" },
  divider: { height: 1, backgroundColor: "#334155", marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#ffffff" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#2dd4bf" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#2dd4bf", // Teal-400
    paddingVertical: 16,
    borderRadius: 9999, // Pill shape
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2dd4bf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmButtonText: {
    color: "#0f172a", // Dark text
    fontSize: 18,
    fontWeight: "700",
  },
  goBackButton: {
    marginTop: 16,
    backgroundColor: "#22d3ee",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: "#0f172a",
    fontWeight: "600",
  },
});

import { UserStackParamList } from "@/navigation/types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react-native";
import React, { useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";
import { Booking } from "@/types";
import { formatCurrency, getImageSource } from '@/lib/utils';

type BookingsNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  "Bookings"
>;

export default function Bookings() {
  const navigation = useNavigation<BookingsNavigationProp>();
  const insets = useSafeAreaInsets();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchBookings();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");
  const activeBookings = bookings.filter((b) => b.status === "active");
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2dd4bf" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2dd4bf"
            />
          }
        >
          {/* Upcoming */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingBookings.length > 0 ? (
              <View>
                {upcomingBookings.map((booking) => (
                  <View key={booking.id} style={styles.card}>
                    <View style={styles.cardContent}>
                      <Image
                        source={getImageSource(booking.vehicle.images[0])}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                      />
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.vehicleName}>
                              {booking.vehicle.name}
                            </Text>
                            <View style={styles.locationContainer}>
                              <MapPin color="#94a3b8" size={14} />
                              <Text style={styles.locationText}>
                                {booking.shop.name}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[styles.statusBadge, styles.badgeUpcoming]}
                          >
                            <Text style={styles.textUpcoming}>
                              {booking.status}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.dateRow}>
                          <View style={styles.dateItem}>
                            <Calendar color="#94a3b8" size={14} />
                            <Text style={styles.dateText}>
                              {format(
                                new Date(booking.startDate),
                                "MMM d, yyyy",
                              )}
                            </Text>
                          </View>
                          <View style={styles.dateItem}>
                            <Clock color="#94a3b8" size={14} />
                            <Text style={styles.dateText}>
                              {format(new Date(booking.startDate), "h:mm a")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>
                          {formatCurrency(booking.totalPrice)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("BookingDetails", {
                            id: booking.id,
                          })
                        }
                        style={styles.detailsButton}
                      >
                        <Text style={styles.detailsButtonText}>
                          View Details
                        </Text>
                        <ChevronRight color="#2dd4bf" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Calendar
                  color="#64748b"
                  size={48}
                  style={{ opacity: 0.5, marginBottom: 12 }}
                />
                <Text style={styles.emptyStateText}>No upcoming bookings</Text>
              </View>
            )}
          </View>

          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Bookings</Text>
              <View>
                {activeBookings.map((booking) => (
                  <View
                    key={booking.id}
                    style={[styles.card, styles.activeCard]}
                  >
                    <View style={styles.cardContent}>
                      <Image
                        source={getImageSource(booking.vehicle.images[0])}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                      />
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.vehicleName}>
                              {booking.vehicle.name}
                            </Text>
                            <View style={styles.locationContainer}>
                              <MapPin color="#94a3b8" size={14} />
                              <Text style={styles.locationText}>
                                {booking.shop.name}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[styles.statusBadge, styles.badgeActive]}
                          >
                            <Text style={styles.textActive}>Active</Text>
                          </View>
                        </View>
                        <View style={styles.dateRow}>
                          <View style={styles.dateItem}>
                            <Calendar color="#94a3b8" size={14} />
                            <Text style={styles.dateText}>
                              Ends: {format(new Date(booking.endDate), "MMM d")}
                            </Text>
                          </View>
                          <View style={styles.dateItem}>
                            <Clock color="#94a3b8" size={14} />
                            <Text style={styles.dateText}>
                              {format(new Date(booking.endDate), "h:mm a")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.activeFooter}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("BookingDetails", {
                            id: booking.id,
                          })
                        }
                        style={styles.detailsButton}
                      >
                        <Text style={styles.detailsButtonText}>
                          View Details
                        </Text>
                        <ChevronRight color="#2dd4bf" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Past bookings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Bookings</Text>
            {pastBookings.length > 0 ? (
              <View>
                {pastBookings.map((booking) => (
                  <View key={booking.id} style={styles.card}>
                    <View style={styles.cardContent}>
                      <Image
                        source={getImageSource(booking.vehicle.images[0])}
                        style={[styles.vehicleImage, styles.grayscale]}
                        resizeMode="cover"
                      />
                      <View style={styles.cardBody}>
                        <View style={styles.cardHeader}>
                          <View>
                            <Text style={styles.vehicleName}>
                              {booking.vehicle.name}
                            </Text>
                            <Text style={styles.dateText}>
                              {format(
                                new Date(booking.startDate),
                                "MMM d, yyyy",
                              )}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              booking.status === "completed"
                                ? styles.badgeCompleted
                                : styles.badgeCancelled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                booking.status === "completed"
                                  ? styles.textCompleted
                                  : styles.textCancelled,
                              ]}
                            >
                              {booking.status}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.pastBookingFooter}>
                          <Text style={styles.pastPrice}>
                            {formatCurrency(booking.totalPrice)}
                          </Text>
                          <View style={styles.pastActions}>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("BookingDetails", {
                                  id: booking.id,
                                })
                              }
                            >
                              <Text style={styles.pastDetailsText}>
                                Details
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("VehicleDetails", {
                                  id: booking.vehicleId,
                                })
                              }
                            >
                              <Text style={styles.bookAgainText}>
                                Book Again
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No past bookings</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Dark background
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#334155",
    borderRadius: 8,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1e293b", // Slate-800
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  vehicleImage: {
    height: 96,
    width: 112,
    borderRadius: 12,
    backgroundColor: "#334155",
  },
  grayscale: {
    opacity: 0.7,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#94a3b8", // Slate-400
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeUpcoming: {
    backgroundColor: "rgba(45, 212, 191, 0.1)", // Teal tint
  },
  textUpcoming: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2dd4bf", // Teal-400
    textTransform: "capitalize",
  },
  badgeCompleted: {
    backgroundColor: "rgba(74, 222, 128, 0.1)", // Green tint
  },
  textCompleted: {
    color: "#4ade80", // Green-400
  },
  badgeCancelled: {
    backgroundColor: "rgba(248, 113, 113, 0.1)", // Red tint
  },
  textCancelled: {
    color: "#f87171", // Red-400
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dateRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  cardFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2dd4bf", // Teal-400
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2dd4bf",
  },
  emptyState: {
    borderRadius: 16,
    backgroundColor: "#1e293b",
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyStateText: {
    color: "#94a3b8",
  },
  pastBookingFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pastPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  pastActions: {
    flexDirection: "row",
    gap: 12,
  },
  pastDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
  },
  bookAgainText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2dd4bf",
  },
  activeCard: {
    borderColor: "#2dd4bf",
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: "rgba(45, 212, 191, 0.2)",
  },
  textActive: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2dd4bf",
    textTransform: "capitalize",
  },
  activeFooter: {
    marginTop: 12,
    alignItems: "flex-end",
  },
});

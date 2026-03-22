import { Bike, Car, Fuel, Settings2, Users } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Vehicle } from "@/types";
import { formatCurrency, getImageSource } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard = ({ vehicle, onPress }: VehicleCardProps) => {
  // Function to capitalize only the first letter
  const capitalize = (str: string) => 
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource(vehicle.images[0])}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Type Badge (Top Left) */}
        <View style={styles.typeBadgeContainer}>
          <View style={styles.typeBadge}>
            {vehicle.type === "car" ? (
              <Car size={14} color="#ffffff" />
            ) : (
              <Bike size={14} color="#ffffff" />
            )}
            <Text style={styles.typeText}>{capitalize(vehicle.type)}</Text>
          </View>
        </View>

        {/* Availability Badge (Top Right) */}
        <View style={styles.statusBadgeContainer}>
          <View
            style={[
              styles.statusBadge,
              vehicle.isAvailable ? styles.bgSuccessSubtle : styles.bgDestructiveSubtle,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                vehicle.isAvailable ? styles.textSuccess : styles.textDestructive,
              ]}
            >
              {vehicle.isAvailable ? "Available" : "Booked"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {vehicle.name}
            </Text>
            {/* Removed 'Standard' and formatted brand/number */}
            <Text style={styles.brand} numberOfLines={1}>
                {capitalize(vehicle.brand)}{vehicle.vehicleNumber ? ` • ${vehicle.vehicleNumber}` : ''}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(vehicle.pricePerHour)}</Text>
            <Text style={styles.priceUnit}>/hr</Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <Fuel size={12} color="#22D3EE" />
            <Text style={styles.specText}>{capitalize(vehicle.fuelType)}</Text>
          </View>
          <View style={styles.specBadge}>
            <Settings2 size={12} color="#22D3EE" />
            <Text style={styles.specText}>{capitalize(vehicle.transmission)}</Text>
          </View>
          {vehicle.seating && (
            <View style={styles.specBadge}>
              <Users size={12} color="#22D3EE" />
              <Text style={styles.specText}>{vehicle.seating} Seats</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16202C", 
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
  },
  imageContainer: {
    height: 170,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  typeBadgeContainer: { position: "absolute", left: 12, top: 12 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 28, 35, 0.7)", 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  statusBadgeContainer: { position: "absolute", right: 12, top: 12 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  bgSuccessSubtle: { backgroundColor: "rgba(16, 185, 129, 0.2)" },
  bgDestructiveSubtle: { backgroundColor: "rgba(239, 68, 68, 0.2)" },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  textSuccess: { color: "#10b981" },
  textDestructive: { color: "#ef4444" },
  content: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#ffffff", letterSpacing: -0.5 },
  brand: { fontSize: 13, color: "#94a3b8", marginTop: 2, fontWeight: "500" },
  priceContainer: { alignItems: "flex-end" },
  price: { fontSize: 18, fontWeight: "800", color: "#22D3EE" },
  priceUnit: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  specsRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  specBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0F1C23", 
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  specText: { fontSize: 11, fontWeight: "600", color: "#cbd5e1" },
});
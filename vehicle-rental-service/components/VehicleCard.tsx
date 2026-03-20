import { Bike, Car, Fuel, Settings2, Users } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// You'll need to define your Vehicle type interface if not available globally
// import { Vehicle } from "@/types";

import { Vehicle } from "@/types";
import { formatCurrency, getImageSource } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard = ({ vehicle, onPress }: VehicleCardProps) => {
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
              <Car size={16} color="#ffffff" />
            ) : (
              <Bike size={16} color="#ffffff" />
            )}
            <Text style={styles.typeText}>{vehicle.type}</Text>
          </View>
        </View>

        {/* Availability Badge (Top Right) */}
        <View style={styles.statusBadgeContainer}>
          <View
            style={[
              styles.statusBadge,
              vehicle.isAvailable ? styles.bgSuccess : styles.bgDestructive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                vehicle.isAvailable
                  ? styles.textSuccess
                  : styles.textDestructive,
              ]}
            >
              {vehicle.isAvailable ? "Available" : "Booked"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{vehicle.name}</Text>
            <Text style={styles.brand}>{vehicle.brand}</Text>
            {vehicle.vehicleNumber && (
              <Text style={styles.vehicleNumber}>{vehicle.vehicleNumber}</Text>
            )}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(vehicle.pricePerHour)}</Text>
            <Text style={styles.priceUnit}>/hour</Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <Fuel size={14} color="#94a3b8" />
            <Text style={styles.specText}>{vehicle.fuelType}</Text>
          </View>
          <View style={styles.specBadge}>
            <Settings2 size={14} color="#94a3b8" />
            <Text style={styles.specText}>{vehicle.transmission}</Text>
          </View>
          {vehicle.seating && (
            <View style={styles.specBadge}>
              <Users size={14} color="#94a3b8" />
              <Text style={styles.specText}>{vehicle.seating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#191d24", // Requested dark bg
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16, // Add spacing between cards
  },
  imageContainer: {
    height: 180, // Slightly taller
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
    backgroundColor: "rgba(30, 41, 59, 0.8)", // Dark transparent (slate-800/80)
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // More rounded
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
    color: "#ffffff",
  },

  statusBadgeContainer: { position: "absolute", right: 12, top: 12 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // More rounded
  },
  bgSuccess: { backgroundColor: "#10b981" }, // emerald-500
  bgDestructive: { backgroundColor: "#ef4444" }, // red-500
  statusText: { fontSize: 12, fontWeight: "600", color: "#ffffff" },
  textSuccess: { color: "#ffffff" }, // Redundant but kept for safety
  textDestructive: { color: "#ffffff" },

  content: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#ffffff" }, // White title
  brand: { fontSize: 14, color: "#94a3b8", marginBottom: 4 }, // Slate-400
  vehicleNumber: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8", // Slate-400
  },

  priceContainer: { alignItems: "flex-end" },
  price: { fontSize: 20, fontWeight: "700", color: "#22d3ee" }, // Cyan-400
  priceUnit: { fontSize: 12, color: "#94a3b8" }, // Slate-400

  specsRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  specBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2a323c", // Darker gray chip
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  specText: { fontSize: 12, fontWeight: "500", color: "#cbd5e1" }, // Slate-300
});

import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MapPin, Navigation, X, Check } from "lucide-react-native";

import { SavedLocation } from "@/services/api";

interface DeliveryLocationSelectorProps {
  visible: boolean;
  type: "delivery" | "pickup";
  currentAddress?: string;
  locations?: SavedLocation[];
  onSelect: (address: string) => void;
  onClose: () => void;
}

export const DeliveryLocationSelector = ({
  visible,
  type,
  currentAddress = "",
  locations = [],
  onSelect,
  onClose,
}: DeliveryLocationSelectorProps) => {
  const [address, setAddress] = useState(currentAddress);

  const handleCurrentLocation = () => {
    setAddress("Current Location (GPS)");
    Alert.alert("Location", "Using your current location");
  };

  const handleConfirm = () => {
    if (!address) {
      Alert.alert("Error", "Please enter or select a location");
      return;
    }
    onSelect(address);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {type === "delivery"
              ? "Set Delivery Location"
              : "Set Pickup Location"}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Mock Map */}
        <View style={styles.mapContainer}>
          <View style={styles.mapContent}>
            <MapPin size={48} color="#2dd4bf" />
            <Text style={styles.mapText}>Drag to set location</Text>
          </View>

          <TouchableOpacity
            onPress={handleCurrentLocation}
            style={styles.gpsButton}
          >
            <Navigation size={20} color="#2dd4bf" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search Input */}
          <View style={styles.inputWrapper}>
            <MapPin size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter address..."
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={setAddress}
              style={styles.input}
            />
          </View>

          {/* Saved Locations */}
          <View style={styles.savedSection}>
            <Text style={styles.sectionTitle}>Saved Locations</Text>
            {locations.length === 0 ? (
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>
                No saved locations found.
              </Text>
            ) : (
              locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  onPress={() => setAddress(loc.address)}
                  style={[
                    styles.locationItem,
                    address === loc.address
                      ? styles.locationItemActive
                      : styles.locationItemInactive,
                  ]}
                >
                  <View style={styles.locationIcon}>
                    <MapPin size={16} color="#2dd4bf" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locName}>{loc.name}</Text>
                    <Text style={styles.locAddress}>{loc.address}</Text>
                  </View>
                  {address === loc.address && (
                    <Check size={20} color="#2dd4bf" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              Confirm {type === "delivery" ? "Delivery" : "Pickup"} Location
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" }, // Dark background
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
  closeBtn: { padding: 8, backgroundColor: "#1e293b", borderRadius: 8 },
  mapContainer: {
    height: 224,
    backgroundColor: "#020617", // Slightly darker for map area
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  mapContent: { alignItems: "center" },
  mapText: { fontSize: 14, color: "#94a3b8", marginTop: 8 },
  gpsButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#334155",
  },
  content: { padding: 16, flex: 1 },
  inputWrapper: { position: "relative", marginBottom: 24 },
  inputIcon: { position: "absolute", left: 16, top: 16, zIndex: 10 },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#334155",
    fontSize: 14,
  },
  savedSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  locationItemActive: {
    borderColor: "#2dd4bf",
    backgroundColor: "rgba(45, 212, 191, 0.05)",
  },
  locationItemInactive: {
    borderColor: "#334155",
    backgroundColor: "#0f172a",
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  locName: { fontWeight: "500", color: "#ffffff", fontSize: 16 },
  locAddress: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  confirmButton: {
    marginTop: "auto",
    backgroundColor: "#2dd4bf", // Teal
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
});

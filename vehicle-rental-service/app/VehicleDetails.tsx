import { api } from "@/services/api";
import { Vehicle, RentalShop } from "@/types";
import { UserStackParamList } from "@/navigation/types";
import {
  NavigationProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import {
  ArrowLeft,
  Bike,
  Calendar,
  Car,
  Check,
  Clock,
  Fuel,
  Heart,
  Settings2,
  Share2,
  Users,
  Navigation as NavigationIcon, // Fixed name conflict
} from "lucide-react-native";
import React, { useState } from "react";
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
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { formatCurrency, getImageSource } from '@/lib/utils';

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function VehicleDetails() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<UserStackParamList>>();
  const { id } = (route.params as { id: string }) || {};
  const insets = useSafeAreaInsets();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [shop, setShop] = useState<RentalShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pricingType, setPricingType] = useState<"hour" | "day">("hour");

  // Helper to capitalize first letter only
  const capitalize = (str: string) => 
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  useFocusEffect(
    React.useCallback(() => {
      const fetchDetails = async () => {
        try {
          if (!id) throw new Error("No vehicle ID provided");
          const vehicleData = await api.getVehicle(id);
          setVehicle(vehicleData);
          if (vehicleData.shopId) {
            const shopData = await api.getRentalShop(vehicleData.shopId);
            setShop(shopData);
          }
        } catch (err) {
          console.error("Failed to fetch vehicle details:", err);
          setError("Failed to load vehicle details");
          Toast.show({ type: "error", text1: "Error", text2: "Could not load details" });
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }, [id]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (error || !vehicle || !shop) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>{error || "Vehicle not found"}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={16} color="#0F1C23" style={{marginRight: 8}} />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <Image source={getImageSource(vehicle.images[activeImageIndex])} style={styles.mainImage} resizeMode="cover" />
          <View style={styles.gradientOverlay} />

          <View style={[styles.headerActionsContainer, { paddingTop: insets.top + 10 }]}>
            <View style={styles.headerActionsContent}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                <ArrowLeft size={22} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.headerRightActions}>
                <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.iconButton}>
                  <Heart size={20} color={isFavorite ? "#ef4444" : "#ffffff"} fill={isFavorite ? "#ef4444" : "transparent"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Share2 size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {vehicle.images.length > 1 && (
            <View style={styles.indicatorsContainer}>
              {vehicle.images.map((_, index) => (
                <View key={index} style={[styles.indicator, index === activeImageIndex ? styles.indicatorActive : styles.indicatorInactive]} />
              ))}
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSectionContainer}>
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={[styles.subtleBadge, vehicle.isAvailable ? styles.bgSuccessSubtle : styles.bgDestructiveSubtle]}>
                <Text style={[styles.subtleBadgeText, vehicle.isAvailable ? styles.textSuccess : styles.textDestructive]}>
                  {vehicle.isAvailable ? "Available" : "Booked"}
                </Text>
              </View>
              <View style={styles.typeSubtleBadge}>
                 {vehicle.type === "car" ? <Car size={12} color="#22D3EE" /> : <Bike size={12} color="#22D3EE" />}
                 <Text style={styles.typeSubtleBadgeText}>{capitalize(vehicle.type)}</Text>
              </View>
            </View>

            <Text style={styles.vehicleTitle} numberOfLines={1}>{vehicle.name}</Text>
            {/* REMOVED "STANDARD" HERE */}
            <Text style={styles.vehicleModel}>{capitalize(vehicle.brand)} • {vehicle.vehicleNumber || capitalize(vehicle.type)}</Text>

            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Fuel size={20} color="#22d3ee" />
                <Text style={styles.specValue}>{capitalize(vehicle.fuelType)}</Text>
                <Text style={styles.specLabel}>Fuel</Text>
              </View>
              <View style={styles.specItem}>
                <Settings2 size={20} color="#22d3ee" />
                <Text style={styles.specValue}>{capitalize(vehicle.transmission)}</Text>
                <Text style={styles.specLabel}>Gearbox</Text>
              </View>
              <View style={styles.specItem}>
                <Users size={20} color="#22d3ee" />
                <Text style={styles.specValue}>{vehicle.seating} Seats</Text>
                <Text style={styles.specLabel}>Capacity</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresList}>
                {vehicle.features.map((feature) => (
                  <View key={feature} style={styles.featureBadge}>
                    <Check size={14} color="#22d3ee" />
                    <Text style={styles.featureText}>{capitalize(feature)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.shopInfoContainer}>
              <Text style={styles.shopLabel}>Pick up location</Text>
              <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
              <Text style={styles.shopAddress}>{shop.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Pricing Plan</Text>
          <View style={styles.pricingOptionsContainer}>
            <TouchableOpacity onPress={() => setPricingType("hour")} 
              style={[styles.pricingOption, pricingType === "hour" ? styles.pricingOptionActive : styles.pricingOptionInactive]}>
              <Clock size={20} color={pricingType === "hour" ? "#22d3ee" : "#94a3b8"} />
              <Text style={[styles.pricingPrice, pricingType === "hour" ? styles.textPrimary : styles.textForeground]}>
                {formatCurrency(vehicle.pricePerHour)}
              </Text>
              <Text style={styles.pricingPeriod}>per hour</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPricingType("day")} 
              style={[styles.pricingOption, pricingType === "day" ? styles.pricingOptionActive : styles.pricingOptionInactive]}>
              <Calendar size={20} color={pricingType === "day" ? "#22d3ee" : "#94a3b8"} />
              <Text style={[styles.pricingPrice, pricingType === "day" ? styles.textPrimary : styles.textForeground]}>
                {formatCurrency(vehicle.pricePerDay)}
              </Text>
              <Text style={styles.pricingPeriod}>per day</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FIXED FOOTER ALIGNMENT */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.footerLabel}>{pricingType === "hour" ? "Rate / hour" : "Rate / day"}</Text>
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerPriceSymbol}>₹</Text>
              <Text style={styles.footerPriceValue}>
                {pricingType === "hour" ? vehicle.pricePerHour : vehicle.pricePerDay}
              </Text>
              <Text style={styles.footerPriceUnit}>
                {pricingType === "hour" ? "/hr" : "/day"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.bookButton, !vehicle.isAvailable && styles.bookButtonDisabled]}
            disabled={!vehicle.isAvailable}
            onPress={() => navigation.navigate("Booking", { id: vehicle.id, type: pricingType })}
          >
            <Text style={styles.bookButtonText} numberOfLines={1}>
              {vehicle.isAvailable ? "Book Now" : "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1C23" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F1C23" },
  notFoundContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F1C23" },
  notFoundText: { color: "#94a3b8", fontSize: 16, marginBottom: 20 },
  backButton: { backgroundColor: "#22d3ee", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  backButtonText: { color: "#0F1C23", fontWeight: "800" },
  scrollContent: { paddingBottom: 130 },
  imageGalleryContainer: { height: 350, position: "relative" },
  mainImage: { width: "100%", height: "100%" },
  gradientOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100, backgroundColor: "rgba(15, 28, 35, 0.4)" },
  headerActionsContainer: { position: "absolute", left: 0, right: 0, zIndex: 20 },
  headerActionsContent: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 },
  iconButton: { backgroundColor: "rgba(15, 28, 35, 0.6)", padding: 10, borderRadius: 14, borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.2)" },
  headerRightActions: { flexDirection: "row", gap: 10 },
  indicatorsContainer: { position: "absolute", bottom: 50, width: "100%", flexDirection: "row", justifyContent: "center", gap: 6 },
  indicator: { height: 4, borderRadius: 2 },
  indicatorActive: { width: 20, backgroundColor: "#22d3ee" },
  indicatorInactive: { width: 6, backgroundColor: "rgba(255, 255, 255, 0.4)" },
  infoSectionContainer: { paddingHorizontal: 20, marginTop: -40 },
  card: { backgroundColor: "#16202C", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "#1E293B" },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  subtleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bgSuccessSubtle: { backgroundColor: "rgba(34, 211, 238, 0.1)" },
  bgDestructiveSubtle: { backgroundColor: "rgba(239, 68, 68, 0.1)" },
  subtleBadgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  textSuccess: { color: "#22d3ee" },
  textDestructive: { color: "#ef4444" },
  typeSubtleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0F1C23', paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1E293B' },
  typeSubtleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  vehicleTitle: { fontSize: 26, fontWeight: "800", color: "#ffffff", letterSpacing: -0.5 },
  vehicleModel: { fontSize: 15, color: "#94a3b8", marginTop: 2, fontWeight: "500" },
  specsGrid: { marginTop: 24, flexDirection: "row", gap: 10 },
  specItem: { flex: 1, backgroundColor: "#0F1C23", paddingVertical: 16, borderRadius: 18, alignItems: "center", borderWidth: 1, borderColor: "#1E293B" },
  specValue: { fontSize: 13, fontWeight: "700", color: "#ffffff", marginTop: 8 },
  specLabel: { fontSize: 10, color: "#64748b", textTransform: 'uppercase', marginTop: 2, fontWeight: '600' },
  featuresContainer: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#ffffff", marginBottom: 16, letterSpacing: -0.3 },
  featuresList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featureBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#0F1C23", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#1E293B" },
  featureText: { fontSize: 13, fontWeight: "600", color: "#cbd5e1" },
  shopInfoContainer: { marginTop: 32, backgroundColor: "#0F1C23", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#1E293B" },
  shopLabel: { fontSize: 10, color: "#64748b", fontWeight: "800", textTransform: 'uppercase' },
  shopName: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginTop: 4 },
  shopAddress: { fontSize: 13, color: "#94a3b8", marginTop: 2, lineHeight: 18 },
  pricingSection: { padding: 20 },
  pricingOptionsContainer: { flexDirection: "row", gap: 12 },
  pricingOption: { flex: 1, backgroundColor: "#16202C", borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 2 },
  pricingOptionActive: { borderColor: "#22d3ee", backgroundColor: "rgba(34, 211, 238, 0.03)" },
  pricingOptionInactive: { borderColor: "#1E293B" },
  pricingPrice: { fontSize: 20, fontWeight: "800", marginTop: 10 },
  textPrimary: { color: "#22d3ee" },
  textForeground: { color: "#ffffff" },
  pricingPeriod: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#111827", paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#1E293B" },
  footerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceContainer: { flexDirection: "column" },
  footerLabel: { fontSize: 11, color: "#64748b", fontWeight: "700", textTransform: 'uppercase' },
  footerPriceRow: { flexDirection: "row", alignItems: "baseline" },
  footerPriceSymbol: { fontSize: 18, fontWeight: "800", color: "#22d3ee", marginRight: 2 },
  footerPriceValue: { fontSize: 26, fontWeight: "900", color: "#22d3ee" },
  footerPriceUnit: { fontSize: 14, fontWeight: "700", color: "#22d3ee", marginLeft: 1 },
  bookButton: { flex: 1, backgroundColor: "#22d3ee", borderRadius: 16, paddingVertical: 16, marginLeft: 24, alignItems: "center", justifyContent: "center" },
  bookButtonDisabled: { backgroundColor: "#1E293B" },
  bookButtonText: { color: "#0F1C23", fontSize: 16, fontWeight: "800" },
});
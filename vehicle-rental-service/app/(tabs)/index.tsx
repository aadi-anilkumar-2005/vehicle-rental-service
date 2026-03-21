import { MapView } from "@/components/MapView";
import { ShopCard } from "@/components/ShopCard";
import { api } from "@/services/api";
import { RentalShop } from "@/types";
import { UserStackParamList } from "@/navigation/types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { Bell, MapPin, MessageCircle, Send } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  "Tabs"
>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const router = useRouter();
  const [location, setLocation] = useState("Current Location");
  const [activeFilter, setActiveFilter] = useState<"all" | "car" | "bike">(
    "all",
  );
  const insets = useSafeAreaInsets();

  const [shops, setShops] = useState<RentalShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const NEARBY_RADIUS_KM = 5;

  const calculateDistanceKm = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = toRad(lat2 - lat1);
    const deltaLng = toRad(lng2 - lng1);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const getReadableAddress = async (latitude: number, longitude: number) => {
    try {
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (!reverse?.length) return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      const item = reverse[0];
      const parts = [item.name, item.street, item.city || item.subregion, item.region]
        .filter(Boolean)
        .slice(0, 3);
      return parts.length
        ? parts.join(", ")
        : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch {
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchShops = async () => {
        try {
          const data = await api.getRentalShops();
          // Mock distance calculation for now
          const shopsWithDistance = data.map((shop) => ({
            ...shop,
            distance: parseFloat((Math.random() * 5).toFixed(1)), // Random 0-5km
          }));
          setShops(shopsWithDistance);
        } catch (error) {
          console.error("Failed to fetch shops:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load rental shops",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchShops();
    }, []),
  );

  useEffect(() => {
    handleCurrentLocation();
  }, []);

  const handleCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Location permission is required to show nearby rentals.",
        });
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setUserLocation(nextLocation);

      const readable = await getReadableAddress(
        nextLocation.latitude,
        nextLocation.longitude,
      );
      setLocation(readable);

      Toast.show({
        type: "success",
        text1: "Location updated",
      });
    } catch (error) {
      console.error("Failed to get current location:", error);
      Toast.show({
        type: "error",
        text1: "Location error",
        text2: "Could not fetch current location.",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleShopClick = (shopId: string) => {
    navigation.navigate("ShopDetails", { id: shopId });
  };

  const handleSearchLocation = async () => {
    const query = location.trim();
    if (!query) return;

    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        Toast.show({
          type: "error",
          text1: "No results",
          text2: "Location not found.",
        });
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        Toast.show({
          type: "error",
          text1: "Invalid location",
        });
        return;
      }

      setUserLocation({ latitude: lat, longitude: lng });
      setLocation(data[0].display_name || query);
    } catch (error) {
      console.error("Location search failed:", error);
      Toast.show({
        type: "error",
        text1: "Search failed",
        text2: "Unable to search this location right now.",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const typeFilteredShops = shops.filter((shop) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "car") return shop.vehicleCount.cars > 0;
    if (activeFilter === "bike") return shop.vehicleCount.bikes > 0;
    return true;
  });

  const nearbyFilteredShops = typeFilteredShops.filter((shop) => {
    if (!userLocation) return true;
    if (shop.latitude == null || shop.longitude == null) return false;
    const distance = calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      shop.latitude,
      shop.longitude,
    );
    return distance <= NEARBY_RADIUS_KM;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-[#0F1C23] justify-center items-center">
        <ActivityIndicator size="large" color="#22D3EE" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0F1C23]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <MapPin color="#94A3B8" size={14} />
            <Text className="text-sm text-slate-400">Your Location</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="relative rounded-full bg-[#1E293B] p-3 border border-slate-700"
            onPress={handleCurrentLocation}
            disabled={locationLoading}
          >
            <MapPin color="#22D3EE" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            className="relative rounded-full bg-[#1E293B] p-3 border border-slate-700"
            onPress={() => router.push("/chat" as any)}
          >
            <MessageCircle color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            className="relative rounded-full bg-[#1E293B] p-3 border border-slate-700"
            onPress={() => router.push(`/user/Notifications` as any)}
          >
            <Bell color="#FFFFFF" size={20} />
            <View className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-[#F97316] border border-[#1E293B]" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-4 gap-6">
          {/* Search Bar */}
          <View className="flex-row items-center bg-[#16202C] rounded-2xl border border-slate-800 h-14 px-4 gap-3">
            <MapPin color="#22D3EE" size={20} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              className="flex-1 text-white text-base"
              placeholder="Search location"
              placeholderTextColor="#64748B"
              onSubmitEditing={handleSearchLocation}
              returnKeyType="search"
            />
            <TouchableOpacity
              className="bg-[#1E293B] p-3 rounded-full border border-slate-700"
              onPress={handleSearchLocation}
              disabled={locationLoading}
            >
              <Send color="#22D3EE" size={18} />
            </TouchableOpacity>
          </View>

          {/* Map Widget */}
          <MapView
            shops={nearbyFilteredShops}
            userLocation={userLocation}
            onShopClick={handleShopClick}
          />

          {/* Filters */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setActiveFilter("all")}
              className={`px-6 py-2.5 rounded-full ${activeFilter === "all" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}
            >
              <Text
                className={`font-semibold ${activeFilter === "all" ? "text-[#0F1C23]" : "text-slate-400"}`}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveFilter("car")}
              className={`px-6 py-2.5 rounded-full flex-row items-center gap-2 ${activeFilter === "car" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}
            >
              <Text
                className={`font-semibold ${activeFilter === "car" ? "text-[#0F1C23]" : "text-slate-400"}`}
              >
                Cars
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveFilter("bike")}
              className={`px-6 py-2.5 rounded-full flex-row items-center gap-2 ${activeFilter === "bike" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}
            >
              <Text
                className={`font-semibold ${activeFilter === "bike" ? "text-[#0F1C23]" : "text-slate-400"}`}
              >
                Bikes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Shop List */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-white">
                Nearby Rentals
              </Text>
              <Text className="text-sm text-slate-400">
                {nearbyFilteredShops.length} shops
              </Text>
            </View>

            {nearbyFilteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onClick={() => handleShopClick(shop.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { MapView } from "@/components/MapView";
import { ShopCard } from "@/components/ShopCard";
import { api } from "@/services/api";
import { RentalShop } from "@/types";
import { UserStackParamList } from "@/navigation/types";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
// Added Car and Bike for the side-facing icons in filters
import { Bell, MapPin, MessageCircle, Send, CarFront, Car, Bike } from "lucide-react-native"; 
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
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
          const shopsWithDistance = data.map((shop) => ({
            ...shop,
            distance: parseFloat((Math.random() * 5).toFixed(1)), 
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
    } catch (error) {
      console.error("Failed to get current location:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleShopClick = (shopId: string) => {
    navigation.navigate("ShopDetails", { id: shopId });
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
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-xl bg-[#22D3EE] items-center justify-center shadow-lg shadow-cyan-500/50">
            <CarFront color="#0F1C23" size={20} strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-[#22D3EE] text-xl font-bold tracking-tight">
              Rent<Text className="text-white">X</Text>plore
            </Text>
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
          
          {/* Static Location Bar */}
          <View className="flex-row items-center bg-[#16202C] rounded-2xl border border-slate-800 h-14 px-4 gap-3">
            <MapPin color="#22D3EE" size={20} />
            <View className="flex-1">
                <Text 
                    className="text-white text-base" 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                >
                    {locationLoading ? "Updating location..." : location}
                </Text>
            </View>
          </View>

          {/* Map Widget */}
          <MapView
            shops={nearbyFilteredShops}
            userLocation={userLocation}
            onShopClick={handleShopClick}
          />

          {/* Filters - Updated with Side-Facing Icons */}
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
              className={`px-5 py-2.5 rounded-full flex-row items-center gap-2 ${activeFilter === "car" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}
            >
              <Car color={activeFilter === "car" ? "#0F1C23" : "#94A3B8"} size={18} />
              <Text
                className={`font-semibold ${activeFilter === "car" ? "text-[#0F1C23]" : "text-slate-400"}`}
              >
                Cars
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveFilter("bike")}
              className={`px-5 py-2.5 rounded-full flex-row items-center gap-2 ${activeFilter === "bike" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}
            >
              <Bike color={activeFilter === "bike" ? "#0F1C23" : "#94A3B8"} size={18} />
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
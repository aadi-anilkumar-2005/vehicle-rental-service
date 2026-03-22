import { getImageSource } from '@/lib/utils';
import { VehicleCard } from "@/components/VehicleCard";
import { api, chatApi, favoritesApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { RentalShop, Vehicle } from "@/types";
import { UserStackParamList } from "@/navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bike,
  Car,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Navigation,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  Platform,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type ShopDetailsRouteProp = RouteProp<UserStackParamList, "ShopDetails">;
type ShopDetailsNavigationProp = NativeStackNavigationProp<
  UserStackParamList,
  "ShopDetails"
>;

export default function ShopDetails() {
  const router = useRouter();
  const route = useRoute<ShopDetailsRouteProp>();
  const navigation = useNavigation<ShopDetailsNavigationProp>();
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [shop, setShop] = useState<RentalShop | null>(null);
  const [shopVehicles, setShopVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<"all" | "car" | "bike">("all");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchShopDetails = async () => {
        try {
          setLoading(true);
          const [shopData, vehiclesData] = await Promise.all([
            api.getRentalShop(id),
            api.getShopVehicles(id),
          ]);
          setShop(shopData);
          setShopVehicles(vehiclesData);
          try {
            const faved = await favoritesApi.checkFavorite(id);
            setIsFavorited(faved);
          } catch {}
        } catch (err) {
          console.error("Failed to fetch shop details:", err);
          setError("Failed to load shop details");
          Toast.show({ type: "error", text1: "Error", text2: "Could not load shop details" });
        } finally {
          setLoading(false);
        }
      };
      if (id) fetchShopDetails();
    }, [id]),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0F1C23]">
        <ActivityIndicator size="large" color="#22D3EE" />
      </View>
    );
  }

  if (error || !shop) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0F1C23]">
        <Text className="text-slate-400 mb-4">Shop not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-[#22D3EE] px-4 py-2 rounded-lg">
          <Text className="font-bold text-[#0F1C23]">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredVehicles = shopVehicles.filter((v) => {
    if (activeFilter === "all") return true;
    return v.type === activeFilter;
  });

  const handleCall = () => {
    if (!shop?.phone) return;
    Linking.openURL(`tel:${shop.phone}`);
  };

  const handleShare = async () => {
    if (!shop) return;
    await Share.share({
      message: `Check out ${shop.name} on RentXplore!\n📍 ${shop.address}`,
    });
  };

  const handleDirections = () => {
    if (!shop?.latitude || !shop?.longitude) return;
    router.push({
      pathname: "/ShopNavigation" as any,
      params: { lat: shop.latitude.toString(), lng: shop.longitude.toString(), name: shop.name },
    });
  };

  const handleToggleFavorite = async () => {
    if (favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const result = await favoritesApi.toggleFavorite(id);
      setIsFavorited(result.favorited);
    } catch {
      Toast.show({ type: "error", text1: "Failed to update favorites" });
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0F1C23]">
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image source={getImageSource(shop.image)} className="w-full h-72" resizeMode="cover" />
          <View className="absolute left-0 right-0 flex-row justify-between items-center px-4" style={{ top: insets.top + 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-[#1E293B]/80 p-3 rounded-full">
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={handleToggleFavorite} disabled={favoriteLoading} className="bg-[#1E293B]/80 p-3 rounded-full">
                <Heart size={20} color={isFavorited ? "#ef4444" : "#fff"} fill={isFavorited ? "#ef4444" : "transparent"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} className="bg-[#1E293B]/80 p-3 rounded-full">
                <Share2 color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="-mt-10 bg-[#0F1C23] rounded-t-[32px] px-6 pt-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white flex-1 mr-4" numberOfLines={1}>{shop.name}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ShopReviews", { shopId: id, shopName: shop.name })}>
              <View className="bg-[#1E293B] px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-slate-700">
                <Star fill="#F59E0B" color="#F59E0B" size={14} />
                <Text className="font-bold text-white">{shop.rating?.toFixed(1) || "0.0"}</Text>
                <Text className="text-xs text-slate-400">({shop.reviewCount})</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Location - Multiline allowed for full visibility */}
          <View className="mb-4 flex-row items-start gap-2">
            <MapPin color="#22D3EE" size={18} style={{ marginTop: 2 }} />
            <Text className="text-slate-400 text-base flex-1 leading-6">{shop.address}</Text>
          </View>

          {/* Timing Row - Added space above */}
          <View className="mb-8 flex-row items-center gap-6">
            <View className="flex-row items-center gap-2">
              <View className={`w-2.5 h-2.5 rounded-full ${shop.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className={`${shop.isOpen ? 'text-green-500' : 'text-red-500'} font-semibold`}>
                {shop.isOpen ? "Open Now" : "Closed"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock color="#94A3B8" size={16} />
              <Text className="text-slate-400 font-medium">{shop.operatingHours || "8:00 AM - 10:00 PM"}</Text>
            </View>
          </View>

          <View className="mb-10">
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity onPress={handleCall} className="flex-1 flex-row items-center justify-center gap-2 bg-[#22D3EE] h-14 rounded-2xl">
                <Phone color="#0F1C23" size={18} />
                <Text className="font-bold text-[#0F1C23] text-sm" numberOfLines={1}>Call Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDirections} className="flex-1 flex-row items-center justify-center gap-2 border border-[#22D3EE] h-14 rounded-2xl">
                <Navigation color="#22D3EE" size={18} />
                <Text className="font-bold text-[#22D3EE] text-sm" numberOfLines={1}>Get Directions</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 bg-[#1E293B] h-14 rounded-2xl border border-slate-700"
              onPress={async () => {
                const conv = await chatApi.getOrCreateConversation(token || "", shop.id);
                router.push({ pathname: "/chat/[id]", params: { id: conv.id, partnerName: conv.partnerName, partnerRole: conv.partnerRole, isOnline: String(conv.isOnline), shopName: conv.shopName }});
              }}
            >
              <MessageCircle color="#FFFFFF" size={18} />
              <Text className="font-bold text-white text-sm" numberOfLines={1}>Message Shop</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-white" numberOfLines={1}>Available Vehicles</Text>
            <Text className="text-slate-400 text-xs font-bold bg-[#1E293B] px-2 py-1 rounded-md">{filteredVehicles.length} UNITS</Text>
          </View>

          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity onPress={() => setActiveFilter("all")} className={`w-12 h-10 rounded-full items-center justify-center ${activeFilter === "all" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}>
              <Text className={`font-bold ${activeFilter === "all" ? "text-[#0F1C23]" : "text-slate-400"}`}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveFilter("car")} className={`flex-1 h-10 rounded-full flex-row items-center justify-center gap-2 ${activeFilter === "car" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}>
              <Car color={activeFilter === "car" ? "#0F1C23" : "#94A3B8"} size={18} />
              <Text className={`font-bold ${activeFilter === "car" ? "text-[#0F1C23]" : "text-slate-400"}`} numberOfLines={1}>Cars</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveFilter("bike")} className={`flex-1 h-10 rounded-full flex-row items-center justify-center gap-2 ${activeFilter === "bike" ? "bg-[#22D3EE]" : "bg-[#1E293B] border border-slate-700"}`}>
              <Bike color={activeFilter === "bike" ? "#0F1C23" : "#94A3B8"} size={18} />
              <Text className={`font-bold ${activeFilter === "bike" ? "text-[#0F1C23]" : "text-slate-400"}`} numberOfLines={1}>Bikes</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-y-4">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} onPress={() => navigation.navigate("VehicleDetails", { id: vehicle.id })} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
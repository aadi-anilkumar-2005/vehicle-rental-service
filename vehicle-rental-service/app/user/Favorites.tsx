import { getImageSource } from '@/lib/utils';
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserStackParamList } from "@/navigation/types";
import { favoritesApi, FavoriteShop } from "@/services/api";
import { ArrowLeft, Heart, MapPin, Star } from "lucide-react-native";
import Toast from "react-native-toast-message";

export default function Favorites() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [favorites, setFavorites] = useState<FavoriteShop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesApi.getFavorites();
      setFavorites(data);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to load favorites" });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, []),
  );

  const handleRemove = async (shopId: string) => {
    try {
      await favoritesApi.toggleFavorite(shopId);
      setFavorites((prev) => prev.filter((f) => f.shop_id !== shopId));
      Toast.show({ type: "success", text1: "Removed from favorites" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to remove favorite" });
    }
  };

  const renderItem = ({ item }: { item: FavoriteShop }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("ShopDetails", { id: item.shop_id })}
    >
      <Image source={getImageSource(item.image)} style={styles.image} />
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.name}
          </Text>
          {/* Open / Closed badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: item.is_open ? "#16a34a22" : "#dc262622" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.is_open ? "#22c55e" : "#ef4444" },
              ]}
            >
              {item.is_open ? "Open" : "Closed"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={13} color="#94a3b8" />
          <Text style={styles.address} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.ratingBox}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item.shop_id)}
          >
            <Heart size={16} fill="#ef4444" color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2dd4bf" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Heart size={56} color="#334155" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the ♥ on a shop to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backBtn: { padding: 6, marginRight: 12 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  heartIconContainer: { padding: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#cbd5e1",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
  },
  image: { width: 100, height: 100, resizeMode: "cover" },
  cardBody: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shopName: { flex: 1, fontSize: 16, fontWeight: "700", color: "#ffffff" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  address: { flex: 1, fontSize: 12, color: "#94a3b8" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, fontWeight: "600", color: "#f59e0b" },
  removeBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(239,68,68,0.12)",
  },
});

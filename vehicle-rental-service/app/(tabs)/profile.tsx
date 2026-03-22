import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
  User,
  Bell,
  Clock,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  profileApi,
  favoritesApi,
  UserProfile,
  UserStats,
} from "@/services/api";
import { formatCurrency } from '@/lib/utils';

// Reordered Menu Items as per your request
const accountItems = [
  { icon: User, label: "Edit Profile", path: "EditProfile" },
  { icon: FileText, label: "KYC Verification", path: "KYCVerification" },
  { icon: Bell, label: "Notifications", path: "Notifications" },
];

const activityItems = [
  { icon: Clock, label: "Booking History", path: "BookingHistory" },
  { icon: MapPin, label: "Saved Locations", path: "SavedLocations" },
  { icon: Heart, label: "Favorites", path: "Favorites" },
  { icon: CreditCard, label: "Payment Methods", path: "PaymentMethods" },
];

const supportItems = [
  { icon: Settings, label: "App Settings", path: "Settings" },
  { icon: Shield, label: "Privacy & Security", path: "PrivacySecurity" },
  { icon: HelpCircle, label: "Help & Support", path: "HelpSupport" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadProfileData = async () => {
        try {
          setLoading(true);
          const [profileData, statsData] = await Promise.all([
            profileApi.getUserProfile(),
            profileApi.getUserStats(),
          ]);
          setUserProfile(profileData);
          setUserStats(statsData);
          try {
            const favs = await favoritesApi.getFavorites();
            setFavoritesCount(favs.length);
          } catch {}
        } catch (err) {
          Toast.show({ type: "error", text1: "Failed to load profile data" });
        } finally {
          setLoading(false);
        }
      };
      if (user) loadProfileData();
    }, [user]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/Login");
  };

  const renderMenuSection = (title: string, items: typeof accountItems) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuList}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => router.push(`/user/${item.path}` as any)}
            style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
          >
            <View style={styles.menuIconContainer}>
              <item.icon color="#22D3EE" size={18} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <ChevronRight color="#475569" size={18} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22D3EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}>
        
        {/* Profile Header - Settings Badge Removed */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(userProfile?.first_name || userProfile?.username || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{userProfile?.first_name || userProfile?.username}</Text>
          <Text style={styles.profileEmail}>{userProfile?.email}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats?.total_bookings || 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder]}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(userStats?.total_spent || 0)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>

        {/* Categorized Menus with New Order */}
        <View style={styles.menuContainer}>
            {renderMenuSection("Account Settings", accountItems)}
            {renderMenuSection("Personal Activity", activityItems)}
            {renderMenuSection("Support", supportItems)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0 • RentXplore</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1C23" },
  scrollContent: { paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1C23' },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatarContainer: { marginBottom: 16 },
  avatar: { 
    height: 100, width: 100, borderRadius: 50, 
    backgroundColor: "#22D3EE", alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: '#1E293B'
  },
  avatarText: { fontSize: 40, fontWeight: "800", color: "#0F1C23" },
  profileName: { fontSize: 24, fontWeight: "800", color: "#ffffff" },
  profileEmail: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  
  statsRow: { 
    flexDirection: "row", backgroundColor: "#16202C", 
    marginHorizontal: 20, borderRadius: 24, paddingVertical: 20,
    borderWidth: 1, borderColor: '#1E293B'
  },
  statItem: { flex: 1, alignItems: "center" },
  statItemBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#1E293B' },
  statValue: { fontSize: 18, fontWeight: "800", color: "#22D3EE" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: '600' },

  menuContainer: { marginTop: 32, paddingHorizontal: 20 },
  menuSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#64748b", textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  menuList: { backgroundColor: "#16202C", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: '#1E293B' },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconContainer: { height: 36, width: 36, borderRadius: 10, backgroundColor: "#0F1C23", alignItems: "center", justifyContent: "center", marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#ffffff" },

  logoutButton: { 
    flexDirection: "row", alignItems: "center", justifyContent: "center", 
    marginHorizontal: 20, marginTop: 12, paddingVertical: 18, borderRadius: 24, 
    backgroundColor: "rgba(239, 68, 68, 0.1)", borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)", gap: 10 
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#ef4444" },
  versionText: { textAlign: "center", color: "#475569", marginTop: 32, fontSize: 12, fontWeight: '600' },
});
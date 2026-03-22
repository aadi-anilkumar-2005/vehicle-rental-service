import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Car,
  Clock,
  CreditCard,
  Gift,
  Mail,
  MessageSquare,
} from "lucide-react-native";
import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { profileManagementApi, UserSettings } from "@/services/api";

export default function Settings() {
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings>({
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    booking_updates: true,
    payment_alerts: true,
    promotions: true,
    reminders: true,
  });

  const [loading, setLoading] = useState(false);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadSettings = async () => {
        try {
          setLoading(true);
          const data = await profileManagementApi.getUserSettings();
          setSettings(data);
        } catch (error) {
          console.error("Failed to load settings:", error);
        } finally {
          setLoading(false);
        }
      };
      loadSettings();
    }, []),
  );

  const toggleSetting = async (key: keyof UserSettings) => {
    if (processingKey === key) return;
    const newValue = !settings[key];
    try {
      setProcessingKey(key);
      await profileManagementApi.updateUserSettings({ [key]: newValue });
      setSettings((prev) => ({ ...prev, [key]: newValue }));
      Toast.show({
        type: "success",
        text1: "Settings Updated",
        text2: `${key.replace(/_/g, " ")} updated successfully`,
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Update Failed" });
    } finally {
      setTimeout(() => setProcessingKey(null), 300);
    }
  };

  const renderSettingItem = (
    label: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon: any,
    iconColor: string,
    settingKey: keyof UserSettings
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          {React.createElement(icon, { size: 20, color: iconColor })}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription} numberOfLines={1}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={processingKey === settingKey}
        trackColor={{ false: "#334155", true: "#22D3EE" }}
        thumbColor="#ffffff"
        ios_backgroundColor="#334155"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header - Professional Fixed Style */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Settings</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Notification Channels Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Channels</Text>
            <View style={styles.card}>
              {renderSettingItem(
                "Push Notifications",
                "Alerts on your mobile device",
                settings.push_notifications,
                () => toggleSetting("push_notifications"),
                Bell,
                "#22D3EE",
                "push_notifications"
              )}
              <View style={styles.divider} />
              {renderSettingItem(
                "Email Notifications",
                "Receive updates via inbox",
                settings.email_notifications,
                () => toggleSetting("email_notifications"),
                Mail,
                "#A855F7",
                "email_notifications"
              )}
              <View style={styles.divider} />
              {renderSettingItem(
                "SMS Notifications",
                "Direct text message alerts",
                settings.sms_notifications,
                () => toggleSetting("sms_notifications"),
                MessageSquare,
                "#22C55E",
                "sms_notifications"
              )}
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Preferences</Text>
            <View style={styles.card}>
              {renderSettingItem(
                "Booking Updates",
                "Confirmations and status changes",
                settings.booking_updates,
                () => toggleSetting("booking_updates"),
                Car,
                "#22D3EE",
                "booking_updates"
              )}
              <View style={styles.divider} />
              {renderSettingItem(
                "Payment Alerts",
                "Invoices and transaction receipts",
                settings.payment_alerts,
                () => toggleSetting("payment_alerts"),
                CreditCard,
                "#22C55E",
                "payment_alerts"
              )}
              <View style={styles.divider} />
              {renderSettingItem(
                "Promotions",
                "Discounts and special offers",
                settings.promotions,
                () => toggleSetting("promotions"),
                Gift,
                "#F472B6",
                "promotions"
              )}
              <View style={styles.divider} />
              {renderSettingItem(
                "Ride Reminders",
                "Pick-up and return schedules",
                settings.reminders,
                () => toggleSetting("reminders"),
                Clock,
                "#F97316",
                "reminders"
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22D3EE" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1C23" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: "#1E293B",
    borderRadius: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#ffffff" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#16202C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  divider: { height: 1, backgroundColor: "#1E293B", marginHorizontal: 16 },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  settingDescription: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 28, 35, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
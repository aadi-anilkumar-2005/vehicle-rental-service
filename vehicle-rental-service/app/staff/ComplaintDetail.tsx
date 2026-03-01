import { useRouter, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { staffApi } from "@/services/api";

const COLORS = {
  background: "#111318",
  card: "#1A1F26",
  primary: "#2DD4BF",
  secondary: "#FB923C",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "#2C3340",
};

const statusColor = (s: string) => {
  if (s === "resolved") return "#22C55E";
  if (s === "assigned") return "#F59E0B";
  return COLORS.primary;
};

export default function ComplaintDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    subject: string;
    description: string;
    status: string;
    customer_name: string;
    shop_name: string;
    booking_id?: string;
    created_at: string;
  }>();

  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(params.status === "resolved");

  const handleResolve = async () => {
    if (resolved || resolving) return;
    setResolving(true);
    try {
      await staffApi.resolveComplaint(params.id);
      setResolved(true);
      Toast.show({
        type: "success",
        text1: "Complaint Resolved",
        text2: "The complaint has been marked as resolved.",
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.message || "Failed to resolve complaint.",
      });
    } finally {
      setResolving(false);
    }
  };

  const formattedDate = params.created_at
    ? new Date(params.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const currentStatus = resolved ? "resolved" : params.status;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-5 py-4 border-b"
        style={{ borderColor: COLORS.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1">
          Complaint Details
        </Text>
        {/* Status badge */}
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor(currentStatus)}20` }}
        >
          <Text
            className="text-xs font-bold capitalize"
            style={{ color: statusColor(currentStatus) }}
          >
            {currentStatus}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
      >
        {/* Complaint ID & Subject */}
        <View
          className="p-5 rounded-2xl mb-4"
          style={{ backgroundColor: COLORS.card }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <AlertCircle size={18} color="#EF4444" />
            <Text
              className="text-xs font-semibold"
              style={{ color: "#EF4444" }}
            >
              #CPL-{params.id?.padStart(4, "0")}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-white mb-2">
            {params.subject}
          </Text>

          {/* Description */}
          <View
            className="flex-row items-start gap-2 mt-2"
            style={{
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingTop: 14,
            }}
          >
            <FileText
              size={16}
              color={COLORS.textMuted}
              style={{ marginTop: 2 }}
            />
            <Text
              className="text-sm leading-relaxed flex-1"
              style={{ color: COLORS.textMuted }}
            >
              {params.description}
            </Text>
          </View>
        </View>

        {/* Meta info card */}
        <View
          className="p-5 rounded-2xl mb-4"
          style={{ backgroundColor: COLORS.card }}
        >
          <Text
            className="text-xs font-bold text-gray-500 uppercase mb-4"
            style={{ letterSpacing: 1 }}
          >
            Details
          </Text>

          {/* Customer */}
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <User size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                Customer
              </Text>
              <Text className="text-sm font-semibold text-white">
                {params.customer_name}
              </Text>
            </View>
          </View>

          {/* Shop */}
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <MapPin size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                Shop
              </Text>
              <Text className="text-sm font-semibold text-white">
                {params.shop_name}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View className="flex-row items-center gap-3">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: `${COLORS.primary}20` }}
            >
              <Calendar size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                Submitted
              </Text>
              <Text className="text-sm font-semibold text-white">
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Booking ref if any */}
          {params.booking_id && (
            <View
              className="mt-4 pt-4 flex-row items-center"
              style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}
            >
              <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                Related Booking:{" "}
              </Text>
              <Text
                className="text-xs font-semibold"
                style={{ color: COLORS.primary }}
              >
                #BKG-{params.booking_id.padStart(4, "0")}
              </Text>
            </View>
          )}
        </View>

        {/* Resolve Button */}
        {resolved ? (
          <View
            className="flex-row items-center justify-center py-4 rounded-2xl gap-2"
            style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
          >
            <CheckCircle2 size={20} color="#22C55E" />
            <Text className="font-bold" style={{ color: "#22C55E" }}>
              Complaint Resolved
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="items-center justify-center py-4 rounded-2xl"
            style={{
              backgroundColor: resolving
                ? `${COLORS.primary}80`
                : COLORS.primary,
            }}
            onPress={handleResolve}
            disabled={resolving}
          >
            {resolving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="font-bold text-black text-base">
                Mark as Resolved
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

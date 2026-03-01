import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  Phone,
  Truck,
  User,
  AlertCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { staffApi, StaffTask, StaffComplaint } from "@/services/api";
import { chatApi } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme Colors derived from the screenshot
const COLORS = {
  background: "#111318", // Very dark background
  card: "#1A1F26", // Slightly lighter card bg
  primary: "#2DD4BF", // Teal/Aqua color for actions
  secondary: "#FB923C", // Orange for pending/pickup
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "#2C3340",
};

const stats = [
  {
    label: "Assigned Today",
    value: "5",
    icon: Package,
    color: COLORS.primary,
  },
  {
    label: "Completed",
    value: "3",
    icon: CheckCircle,
    color: "#22C55E", // Green
  },
  {
    label: "Pending",
    value: "2",
    icon: Clock,
    color: COLORS.secondary,
  },
];

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [deliveryTasks, setDeliveryTasks] = useState<StaffTask[]>([]);
  const [pickupTasks, setPickupTasks] = useState<StaffTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [complaints, setComplaints] = useState<StaffComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const [data, complaintsData] = await Promise.all([
        staffApi.getAssignedTasks(),
        staffApi.getAssignedComplaints(),
      ]);
      const active = data.filter((t) => t.status !== "completed");
      setCompletedCount(data.filter((t) => t.status === "completed").length);
      setDeliveryTasks(active.filter((t) => t.type === "delivery"));
      setPickupTasks(active.filter((t) => t.type === "pickup"));
      setComplaints(complaintsData.filter((c) => c.status !== "resolved"));
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch tasks",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load tasks on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const currentStats = [
    {
      label: "Assigned Today",
      value: (
        deliveryTasks.length +
        pickupTasks.length +
        completedCount
      ).toString(),
      icon: Package,
      color: COLORS.primary,
    },
    {
      label: "Completed",
      value: completedCount.toString(),
      icon: CheckCircle,
      color: "#22C55E", // Green
    },
    {
      label: "Pending",
      value: (deliveryTasks.length + pickupTasks.length).toString(),
      icon: Clock,
      color: COLORS.secondary,
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/Login");
  };

  const handleCall = (phone: string, customer: string) => {
    Toast.show({
      type: "info",
      text1: "Calling Customer",
      text2: `Dialing ${customer} at ${phone}...`,
    });
  };

  const handleNavigate = (address: string) => {
    Toast.show({
      type: "info",
      text1: "Opening Navigation",
      text2: `Navigating to ${address}`,
    });
  };

  const markAsDelivered = async (taskId: string) => {
    try {
      await staffApi.updateTaskStatus(taskId, "completed");
      setDeliveryTasks((prev) => prev.filter((t) => t.id !== taskId));
      setCompletedCount((c) => c + 1);
      Toast.show({
        type: "success",
        text1: "Vehicle Delivered",
        text2: "Task completed successfully!",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark as delivered",
      });
    }
  };

  const markAsPickedUp = async (taskId: string) => {
    try {
      await staffApi.updateTaskStatus(taskId, "completed");
      setPickupTasks((prev) => prev.filter((t) => t.id !== taskId));
      setCompletedCount((c) => c + 1);
      Toast.show({
        type: "success",
        text1: "Vehicle Picked Up",
        text2: "Task completed successfully!",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark as picked up",
      });
    }
  };

  const TaskCard = ({
    task,
    isDelivery,
  }: {
    task: StaffTask;
    isDelivery: boolean;
  }) => (
    <View
      className="p-5 rounded-2xl mb-4"
      style={{ backgroundColor: COLORS.card }}
    >
      {/* Header: Icon/Badge + Time */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          {/* Badge */}
          <View
            className={`flex-row items-center px-3 py-1 rounded-full ${
              isDelivery ? "bg-[#2DD4BF]/10" : "bg-orange-500/10"
            }`}
          >
            {isDelivery ? (
              <Truck
                size={14}
                color={COLORS.primary}
                style={{ marginRight: 6 }}
              />
            ) : (
              <Package
                size={14}
                color={COLORS.secondary}
                style={{ marginRight: 6 }}
              />
            )}
            <Text
              className={`text-xs font-semibold ${
                isDelivery ? "text-[#2DD4BF]" : "text-orange-500"
              }`}
            >
              {isDelivery ? "Delivery" : "Pickup"}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-400">{task.scheduledTime}</Text>
      </View>

      {/* Main Content */}
      <View className="mb-4">
        <Text className="text-xl font-bold text-white mb-1">
          {task.vehicleName}
        </Text>
        <Text className="text-sm text-gray-400">
          {task.customerName || "Unknown Customer"}
        </Text>
      </View>

      {/* Address */}
      <View className="flex-row items-start gap-2 mb-5">
        <MapPin size={16} color="#6B7280" style={{ marginTop: 2 }} />
        <Text className="text-sm text-gray-400 flex-1">
          {task.address || "No address provided (Self Pickup)"}
        </Text>
      </View>

      {/* Chat Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center py-3 mb-4 rounded-full border"
        style={{ borderColor: COLORS.primary }}
        onPress={async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            const conv = await chatApi.getOrCreateBookingConversation(
              token || "",
              task.bookingId.toString(),
            );
            router.push({
              pathname: "/chat/[id]",
              params: {
                id: conv.id,
                partnerName: conv.partnerName,
                partnerRole: conv.partnerRole,
                isOnline: String(conv.isOnline),
                shopName: conv.shopName,
              },
            });
          } catch (e) {
            Toast.show({
              type: "error",
              text1: "Chat Error",
              text2: "Could not open conversation",
            });
          }
        }}
      >
        <MessageSquare
          size={16}
          color={COLORS.primary}
          style={{ marginRight: 6 }}
        />
        <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
          Chat with Customer
        </Text>
      </TouchableOpacity>

      {/* Action Buttons - Styled exactly like the screenshot */}
      <View className="flex-row gap-3">
        {/* Call Button (Outlined) */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 rounded-full border"
          style={{ borderColor: COLORS.primary }}
          onPress={() =>
            handleCall(
              task.customerPhone || "0000000000",
              task.customerName || "Customer",
            )
          }
        >
          <Phone size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Call</Text>
        </TouchableOpacity>

        {/* Navigate Button (Outlined) */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center py-3 rounded-full border"
          style={{ borderColor: COLORS.primary }}
          onPress={() => handleNavigate(task.address || "")}
        >
          <Navigation
            size={16}
            color={COLORS.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
            Navigate
          </Text>
        </TouchableOpacity>

        {/* Complete Button (Solid) */}
        <TouchableOpacity
          className="flex-1 items-center justify-center py-3 rounded-full"
          style={{ backgroundColor: COLORS.primary }}
          onPress={() =>
            isDelivery ? markAsDelivered(task.id) : markAsPickedUp(task.id)
          }
        >
          <Text className="text-black font-bold">
            {isDelivery ? "Delivered" : "Picked Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const complaintStatusColor = (s: string) => {
    if (s === "assigned") return "#F59E0B";
    if (s === "resolved") return "#22C55E";
    return COLORS.primary;
  };

  const ComplaintCard = ({ complaint }: { complaint: StaffComplaint }) => (
    <View
      className="p-5 rounded-2xl mb-4"
      style={{ backgroundColor: COLORS.card }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="flex-row items-center gap-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
        >
          <AlertCircle size={13} color="#EF4444" style={{ marginRight: 4 }} />
          <Text className="text-xs font-semibold" style={{ color: "#EF4444" }}>
            Complaint
          </Text>
        </View>
        <View
          className="px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${complaintStatusColor(complaint.status)}20`,
          }}
        >
          <Text
            className="text-xs font-semibold capitalize"
            style={{ color: complaintStatusColor(complaint.status) }}
          >
            {complaint.status}
          </Text>
        </View>
      </View>

      {/* Subject */}
      <Text className="text-lg font-bold text-white mb-1">
        {complaint.subject}
      </Text>
      <Text className="text-sm text-gray-400 mb-3" numberOfLines={2}>
        {complaint.description}
      </Text>

      {/* Meta */}
      <View className="flex-row items-center gap-2 mb-1">
        <User size={13} color="#6B7280" />
        <Text className="text-xs text-gray-400">{complaint.customer_name}</Text>
      </View>
      <View className="flex-row items-center gap-2 mb-4">
        <MapPin size={13} color="#6B7280" />
        <Text className="text-xs text-gray-400">{complaint.shop_name}</Text>
      </View>

      {/* View Details Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center py-3 rounded-full"
        style={{ backgroundColor: COLORS.primary }}
        onPress={() =>
          router.push({
            pathname: "/staff/ComplaintDetail",
            params: {
              id: complaint.id,
              subject: complaint.subject,
              description: complaint.description,
              status: complaint.status,
              customer_name: complaint.customer_name,
              shop_name: complaint.shop_name,
              booking_id: complaint.booking_id ?? "",
              created_at: complaint.created_at,
            },
          })
        }
      >
        <Text className="font-bold text-black">View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-6">
          <View className="flex-row items-center gap-3">
            <View>
              <Text className="text-xl font-bold text-white">
                Staff Dashboard
              </Text>
              <Text className="text-sm text-gray-400">
                {user?.name || "Mike Staff"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              onPress={() => router.push("/staff/StaffProfile")}
            >
              <User size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="ml-4">
              <Text className="text-white font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Stats Row */}
          <View className="flex-row gap-3 mb-8">
            {currentStats.map((stat, index) => (
              <View
                key={index}
                className="flex-1 pt-6 pb-4 items-center justify-between rounded-2xl border"
                style={{
                  backgroundColor: COLORS.card,
                  borderColor: COLORS.border,
                }}
              >
                <stat.icon
                  size={24}
                  color={stat.color}
                  style={{ marginBottom: 8 }}
                />
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">
                    {stat.value}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {stat.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Delivery Tasks Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Truck size={18} color={COLORS.primary} />
                <Text className="text-lg font-bold text-white">
                  Delivery Tasks
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/staff/AssignedTasks")}
                className="flex-row items-center"
              >
                <Text style={{ color: COLORS.primary }} className="mr-1">
                  View All
                </Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {deliveryTasks.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No pending deliveries
              </Text>
            ) : (
              deliveryTasks.map((task) => (
                <TaskCard key={task.id} task={task} isDelivery={true} />
              ))
            )}
          </View>

          {/* Pickup Tasks Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Package size={18} color={COLORS.secondary} />
                <Text className="text-lg font-bold text-white">
                  Pickup Tasks
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/staff/AssignedTasks")}
                className="flex-row items-center"
              >
                <Text style={{ color: COLORS.primary }} className="mr-1">
                  View All
                </Text>
                <ChevronRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {pickupTasks.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No pending pickups
              </Text>
            ) : (
              pickupTasks.map((task) => (
                <TaskCard key={task.id} task={task} isDelivery={false} />
              ))
            )}
          </View>

          {/* Complaints Section */}
          {complaints.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <AlertCircle size={18} color="#EF4444" />
                  <Text className="text-lg font-bold text-white">
                    Assigned Complaints
                  </Text>
                </View>
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: "#EF4444" }}
                  >
                    {complaints.length}
                  </Text>
                </View>
              </View>
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </View>
          )}

          {/* Map Section */}
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: "#153d38" }} // Dark greenish map bg from screenshot
          >
            <TouchableOpacity
              activeOpacity={0.9}
              className="h-48 items-center justify-center"
              onPress={() => router.push("/staff/AssignedTasks")}
            >
              <MapPin
                size={32}
                color={COLORS.primary}
                style={{ marginBottom: 10 }}
              />
              <Text className="text-base font-bold text-white">
                Task Locations Map
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Tap to view full map
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

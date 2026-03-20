import { getImageSource } from '@/lib/utils';
import { chatApi, ChatMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Image as ImageIcon, Send } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const POLL_INTERVAL_MS = 5000;

export default function ChatDetail() {
  const { id, shopName, partnerName, partnerRole, isOnline } =
    useLocalSearchParams<{
      id: string;
      shopName?: string;
      partnerName?: string;
      partnerRole?: string;
      isOnline?: string;
    }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return { token: token ?? "", userId: user?.id?.toString() ?? "" };
  }, [user]);

  // ── Load messages ──────────────────────────────────────────────────────────

  const fetchMessages = useCallback(
    async (showSpinner = false) => {
      if (!id) return;
      if (showSpinner) setLoading(true);
      try {
        const { token, userId } = await getAuth();
        const data = await chatApi.getMessages(token, id, userId);
        setMessages(data);
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [id, getAuth],
  );

  useEffect(() => {
    fetchMessages(true);

    // Poll every 5 s for new messages
    pollRef.current = setInterval(() => fetchMessages(false), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages / keyboard show
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () =>
      flatListRef.current?.scrollToEnd({ animated: true }),
    );
    setTimeout(
      () => flatListRef.current?.scrollToEnd({ animated: false }),
      100,
    );
    return () => sub.remove();
  }, [messages]);

  // ── Send text ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !id) return;
    setSending(true);
    setInputText("");
    try {
      const { token, userId } = await getAuth();
      const newMsg = await chatApi.sendMessage(token, id, userId, text);
      setMessages((prev) => [...prev, newMsg]);
    } catch (e) {
      console.error("Failed to send message:", e);
      setInputText(text); // restore on failure
    } finally {
      setSending(false);
    }
  }, [inputText, id, getAuth]);

  // ── Send image ─────────────────────────────────────────────────────────────

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    if (!id) return;
    setSending(true);
    try {
      const { token, userId } = await getAuth();
      // Send image URI as image_url (works as local preview on the same device;
      // a real upload would store it on S3/Cloudinary and send the public URL)
      const newMsg = await chatApi.sendMessage(token, id, userId, "", imageUri);
      setMessages((prev) => [...prev, newMsg]);
    } catch (e) {
      console.error("Failed to send image:", e);
    } finally {
      setSending(false);
    }
  }, [id, getAuth]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const pRole = partnerRole || "";
  const pName = partnerName && partnerName !== "Unknown" ? partnerName : "";
  const onlineStatus = String(isOnline) === "true";

  let headerTitle = pName;
  let headerSubtitle = "";
  let showSubtitle = true;

  if (pRole === "Staff" || pRole === "Rental Shop") {
    // If Customer (User) viewing Staff/Shop
    headerTitle = pName;
    headerSubtitle = shopName ? `${shopName} • ` : "";
  } else if (pRole === "User" || pRole === "Customer") {
    // If Staff viewing Customer (User)
    headerTitle = pName;
    showSubtitle = false;
  } else {
    // Fallback if role is empty
    headerTitle = pName;
    headerSubtitle = shopName ? `${shopName} • ` : "";
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F1C23",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0F1C23" }}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#0F1C23] border-b border-slate-800"
      >
        <View className="flex-row items-center px-4 py-3 h-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <View className="flex-1 mr-2">
            <Text
              className="font-bold text-white text-lg capitalize"
              numberOfLines={1}
            >
              {headerTitle}
            </Text>
            <View
              className="flex-row items-center mt-0.5"
              style={{ flexWrap: "nowrap" }}
            >
              {showSubtitle && (
                <Text className="text-xs text-slate-500 font-medium tracking-wide">
                  {headerSubtitle}
                </Text>
              )}
              {onlineStatus ? (
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-[11px] text-green-500 font-medium">
                    Online
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5" />
                  <Text className="text-[11px] text-slate-500 font-medium">
                    Offline
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Messages + Input */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 20,
            gap: 16,
          }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Text className="text-slate-500 text-sm">
                No messages yet. Say hi! 👋
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                item.sender === "me"
                  ? "bg-[#00A884] self-end"
                  : "bg-[#1E293B] self-start"
              }`}
            >
              {item.imageUrl ? (
                <TouchableOpacity
                  onPress={() => setSelectedImage(item.imageUrl!)}
                >
                  <Image
                    source={getImageSource(item.imageUrl)}
                    style={{ width: 200, height: 200, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : (
                <Text className="text-white text-base">{item.text}</Text>
              )}
              <Text className="text-[10px] text-slate-300 text-right mt-1">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
        />

        {/* Input */}
        <View
          className="flex-row items-end p-4 bg-[#0F1C23] border-t border-slate-800 gap-3"
          style={{
            paddingBottom:
              Platform.OS === "ios" ? Math.max(insets.bottom, 10) : 10,
          }}
        >
          <TouchableOpacity
            onPress={pickImage}
            disabled={sending}
            className="w-[50px] h-[50px] bg-[#1E293B] rounded-full items-center justify-center"
          >
            <ImageIcon color="#94A3B8" size={24} />
          </TouchableOpacity>

          <View className="flex-1 bg-[#1E293B] rounded-2xl px-4 py-3 min-h-[50px] justify-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#64748B"
              className="text-white text-base max-h-32 pt-0 pb-0"
              multiline
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || inputText.trim().length === 0}
            className={`w-[50px] h-[50px] rounded-full items-center justify-center ${
              sending || inputText.trim().length === 0
                ? "bg-slate-700"
                : "bg-[#00A884]"
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send color="#FFFFFF" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Full-screen image viewer */}
      <Modal
        visible={!!selectedImage}
        transparent
        onRequestClose={() => setSelectedImage(null)}
        animationType="fade"
      >
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: insets.top + 10,
              right: 20,
              zIndex: 10,
              padding: 10,
            }}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
              ✕
            </Text>
          </TouchableOpacity>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {selectedImage && (
              <Image
                source={getImageSource(selectedImage)}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

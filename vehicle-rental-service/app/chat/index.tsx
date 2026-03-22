import { chatApi, ChatConversation } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, MessageSquare, Search, ChevronRight } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const POLL_INTERVAL_MS = 8000;

export default function ChatList() {
  const router = useRouter();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        setError("You must be logged in to view chats.");
        return;
      }
      const data = await chatApi.getConversations(token);
      setConversations(data);
      setError(null);
    } catch (e) {
      console.error("Failed to load conversations:", e);
      if (!silent) setError("Could not load conversations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations(false);
      pollRef.current = setInterval(() => fetchConversations(true), POLL_INTERVAL_MS);
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [fetchConversations]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations(false);
  }, [fetchConversations]);

  return (
    <SafeAreaView className="flex-1 bg-[#0F1C23]">
      <StatusBar barStyle="light-content" />
      
      {/* Professional Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-800 bg-[#0F1C23]">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-[#1E293B] rounded-xl">
            <ArrowLeft color="#FFFFFF" size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">Messages</Text>
            <Text className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">RentXplore Chat</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 bg-[#1E293B] rounded-xl">
          <Search color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22D3EE" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-400 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchConversations(false)}
            className="mt-6 bg-[#22D3EE] px-8 py-3 rounded-2xl"
          >
            <Text className="text-[#0F1C23] font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-[#16202C] p-6 rounded-full mb-4">
            <MessageSquare color="#22D3EE" size={40} />
          </View>
          <Text className="text-white text-lg font-bold text-center">No Messages Yet</Text>
          <Text className="text-slate-400 text-center mt-2 leading-5">
            When you message a rental shop about a vehicle, your conversations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center p-4 mb-3 bg-[#16202C] rounded-3xl border border-slate-800"
              onPress={() => {
                setConversations((prev) =>
                  prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
                );
                router.push({
                  pathname: "/chat/[id]",
                  params: {
                    id: item.id,
                    shopName: item.shopName,
                    partnerName: item.partnerName,
                    partnerRole: item.partnerRole,
                    isOnline: String(item.isOnline),
                  },
                });
              }}
            >
              {/* Avatar Simulation */}
              <View className="w-12 h-12 rounded-2xl bg-[#1E293B] items-center justify-center mr-4 border border-slate-700">
                <Text className="text-cyan-400 font-bold text-lg">
                  {item.shopName.charAt(0).toUpperCase()}
                </Text>
                {item.isOnline && (
                  <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0F1C23] items-center justify-center">
                     <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-white text-base" numberOfLines={1}>
                    {item.shopName}
                  </Text>
                  <Text className="text-[10px] font-bold text-slate-500 uppercase">
                    {item.time}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text
                    numberOfLines={1}
                    className={`text-sm flex-1 mr-4 ${
                      item.unreadCount > 0 ? "text-slate-200 font-semibold" : "text-slate-500"
                    }`}
                  >
                    {item.lastMessage || "Start a conversation"}
                  </Text>

                  {item.unreadCount > 0 ? (
                    <View className="bg-[#22D3EE] rounded-lg px-2 py-0.5">
                      <Text className="text-[#0F1C23] text-[10px] font-black">
                        {item.unreadCount}
                      </Text>
                    </View>
                  ) : (
                    <ChevronRight size={14} color="#334155" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
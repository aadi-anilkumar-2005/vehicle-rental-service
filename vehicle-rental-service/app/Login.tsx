import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  CarFront,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      result.role === "staff"
        ? router.replace("/staff")
        : router.replace("/(tabs)");
    } else {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: result.error || "Login failed",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F1C23]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center py-10">

            {/* HEADER SECTION */}
            <View className="items-center mb-10 w-full">
              <View className="h-20 w-20 rounded-3xl bg-[#22D3EE] items-center justify-center mb-6 shadow-lg shadow-cyan-500/50">
                {/* LOGO UPDATED HERE */}
                <CarFront color="#0F1C23" size={40} strokeWidth={2.5} />
              </View>

              {/* App Name Synced */}
              <Text className="text-[#22D3EE] text-5xl font-bold mb-1 text-center">
                Rent<Text className="text-white">X</Text>plore
              </Text>

              {/* Welcome Back in one line */}
              <Text
                className="text-white text-3xl font-semibold text-center w-full"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Welcome Back
              </Text>

              <Text className="text-slate-400 text-sm mt-2 text-center">
                Sign in to your account
              </Text>
            </View>

            {/* FORM SECTION */}
            <View className="gap-y-4">

              {/* Email Field */}
              <View className="relative w-full h-14 justify-center">
                <View className="absolute left-4 z-10">
                  <Mail color="#94A3B8" size={20} />
                </View>
                <Input
                  placeholder="Email Address"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-full rounded-2xl"
                />
              </View>

              {/* Password Field */}
              <View className="relative w-full h-14 justify-center">
                <View className="absolute left-4 z-10">
                  <Lock color="#94A3B8" size={20} />
                </View>
                <Input
                  secureTextEntry={!showPassword}
                  placeholder="Password"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  className="pl-12 pr-12 bg-[#16202C] border-slate-700/50 text-white h-full rounded-2xl"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 z-10"
                >
                  {showPassword ? (
                    <EyeOff color="#94A3B8" size={20} />
                  ) : (
                    <Eye color="#94A3B8" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Button */}
              <TouchableOpacity
                onPress={handleLogin}
                className="mt-4 bg-[#22D3EE] h-14 rounded-full items-center justify-center flex-row gap-2"
              >
                <Text className="text-[#0F1C23] text-lg font-bold">
                  Sign In
                </Text>
                <ArrowRight color="#0F1C23" size={20} />
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <View className="flex-row justify-center mt-12">
              <Text className="text-slate-400">
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/Signup")}>
                <Text className="text-[#22D3EE] font-bold ml-1">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
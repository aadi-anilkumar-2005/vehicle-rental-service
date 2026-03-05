import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeftRight,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Login successful!",
      });

      if (result.role === "staff") {
        router.replace("/staff");
      } else {
        router.replace("/(tabs)");
      }
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
  <View className="flex-1 px-6 justify-center">

    {/* HEADER */}
    <View className="items-center mb-12">
      <View className="h-20 w-20 rounded-3xl bg-[#22D3EE] items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
        <ArrowLeftRight color="#0F1C23" size={32} strokeWidth={2.5} />
      </View>

   <Text
  numberOfLines={1}
  className="text-white text-3xl font-bold text-center"
>
  Welcome Back
</Text>

      <Text className="text-slate-400 text-base mt-2 text-center">
        Sign in to your account
      </Text>
    </View>

    {/* FORM */}
    <View className="space-y-5">

      {/* EMAIL */}
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Mail color="#94A3B8" size={20} />
        </View>

        <Input
          placeholder="Email address"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-14 rounded-2xl"
        />
      </View>

      {/* PASSWORD */}
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Lock color="#94A3B8" size={20} />
        </View>

        <Input
          secureTextEntry={!showPassword}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          className="pl-12 pr-12 bg-[#16202C] border-slate-700/50 text-white h-14 rounded-2xl"
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          {showPassword ? (
            <EyeOff color="#94A3B8" size={20} />
          ) : (
            <Eye color="#94A3B8" size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        onPress={handleLogin}
        className="mt-6 bg-[#22D3EE] h-14 rounded-full items-center justify-center flex-row gap-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
      >
        <Text className="text-[#0F1C23] text-lg font-bold">
          Sign In
        </Text>
        <ArrowRight color="#0F1C23" size={20} />
      </TouchableOpacity>
    </View>

    {/* FOOTER */}
    <View className="flex-row justify-center mt-10">
      <Text className="text-slate-400">
        Don't have an account? 
      </Text>

      <TouchableOpacity onPress={() => router.push("/Signup")}>
        <Text className="text-[#22D3EE] font-bold ml-1">
          Sign up
        </Text>
      </TouchableOpacity>
    </View>

  </View>
</SafeAreaView>
  );
};

export default Login;
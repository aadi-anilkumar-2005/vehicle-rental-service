import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AuthStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowLeftRight,
  ArrowRight,
  Chrome,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type SignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Signup"
>;

export default function Signup() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Get register from useAuth
  const { register } = useAuth();

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all required fields",
      });
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone,
    );

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Account created successfully!",
      });
      navigation.navigate("Login");
    } else {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: result.error || "Something went wrong",
      });
    }
  };

  const handleGoogleSignup = () => {
    Toast.show({
      type: "info",
      text1: "Info",
      text2: "Google Signup not implemented in demo",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F1C23]">
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="mb-8 items-center">
          <View className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <ArrowLeftRight color="#0F1C23" size={32} strokeWidth={2.5} />
          </View>
   <Text
  numberOfLines={1}
  className="text-white text-3xl font-bold text-center"
>
  Create Account
</Text>
          <Text className="text-slate-400 text-base text-center">
            Start your journey with us today
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <View className="absolute left-4 top-[18px] z-10">
              <User color="#94A3B8" size={20} />
            </View>
            <Input
              placeholder="Full name"
              placeholderTextColor="#64748B"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-14 rounded-2xl focus:border-[#22D3EE]"
            />
          </View>

          <View>
            <View className="absolute left-4 top-[18px] z-10">
              <Mail color="#94A3B8" size={20} />
            </View>
            <Input
              placeholder="Email address"
              placeholderTextColor="#64748B"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-14 rounded-2xl focus:border-[#22D3EE]"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <View className="absolute left-4 top-[18px] z-10">
              <Phone color="#94A3B8" size={20} />
            </View>
            <Input
              placeholder="Phone number (optional)"
              placeholderTextColor="#64748B"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-14 rounded-2xl focus:border-[#22D3EE]"
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <View className="absolute left-4 top-[18px] z-10">
              <Lock color="#94A3B8" size={20} />
            </View>
            <Input
              secureTextEntry={!showPassword}
              placeholder="Create password"
              placeholderTextColor="#64748B"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              className="pl-12 pr-12 bg-[#16202C] border-slate-700/50 text-white h-14 rounded-2xl focus:border-[#22D3EE]"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[18px] z-10"
            >
              {showPassword ? (
                <EyeOff color="#94A3B8" size={20} />
              ) : (
                <Eye color="#94A3B8" size={20} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            className="w-full mt-4 bg-[#22D3EE] h-14 rounded-full items-center justify-center flex-row gap-2 active:opacity-90 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          >
            <Text numberOfLines={1} className="text-[#0F1C23] text-lg font-bold">
              Create Account
            </Text>
            <ArrowRight color="#0F1C23" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View className="mt-8 px-4">
          <Text className="text-center text-xs text-slate-500 leading-5">
            By signing up, you agree to our{" "}
            <Text className="text-[#22D3EE]">Terms of Service</Text> and{" "}
            <Text className="text-[#22D3EE]">Privacy Policy</Text>
          </Text>
        </View>

        {/* Login link */}
        <View className="mt-6 flex-row justify-center items-center">
          <Text className="text-slate-400">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="font-bold text-[#22D3EE]">Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

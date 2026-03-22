import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AuthStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CarFront,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
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
          <View className="flex-1 px-8 justify-center py-10">

            {/* HEADER */}
            <View className="items-center mb-10 w-full">
              <View className="h-20 w-20 rounded-3xl bg-[#22D3EE] items-center justify-center mb-6 shadow-lg shadow-cyan-500/50">
                {/* LOGO UPDATED HERE */}
                <CarFront color="#0F1C23" size={40} strokeWidth={2.5} />
              </View>

              {/* App Name Synced */}
              <Text className="text-[#22D3EE] text-5xl font-bold mb-1 text-center">
                Rent<Text className="text-white">X</Text>plore
              </Text>

              {/* HEADER TEXT */}
              <Text
                className="text-white text-3xl font-semibold text-center w-full"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Create Account
              </Text>

              <Text className="text-slate-400 text-sm mt-2 text-center">
                Start your journey with us today
              </Text>
            </View>

            {/* FORM */}
            <View className="gap-y-4">

              {/* Full Name */}
              <View className="relative w-full h-14 justify-center">
                <View className="absolute left-4 z-10">
                  <User color="#94A3B8" size={20} />
                </View>
                <Input
                  placeholder="Full Name"
                  placeholderTextColor="#64748B"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-full rounded-2xl"
                />
              </View>

              {/* Email */}
              <View className="relative w-full h-14 justify-center">
                <View className="absolute left-4 z-10">
                  <Mail color="#94A3B8" size={20} />
                </View>
                <Input
                  placeholder="Email Address"
                  placeholderTextColor="#64748B"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-full rounded-2xl"
                />
              </View>

              {/* Phone */}
              <View className="relative w-full h-14 justify-center">
                <View className="absolute left-4 z-10">
                  <Phone color="#94A3B8" size={20} />
                </View>
                <Input
                  placeholder="Phone Number"
                  placeholderTextColor="#64748B"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  keyboardType="phone-pad"
                  className="pl-12 bg-[#16202C] border-slate-700/50 text-white h-full rounded-2xl"
                />
              </View>

              {/* Password */}
              <View className="relative w-full h-14 justify-center">
                <View className="absolute left-4 z-10">
                  <Lock color="#94A3B8" size={20} />
                </View>
                <Input
                  secureTextEntry={!showPassword}
                  placeholder="Create Password"
                  placeholderTextColor="#64748B"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
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

              {/* BUTTON TEXT */}
              <TouchableOpacity
                onPress={handleSignup}
                activeOpacity={0.8}
                className="mt-4 bg-[#22D3EE] h-14 rounded-full items-center justify-center flex-row gap-2"
              >
                <Text
                  className="text-[#0F1C23] text-lg font-bold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Create Account
                </Text>
                <ArrowRight color="#0F1C23" size={20} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-10">
              <Text className="text-slate-400">
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-[#22D3EE] font-bold ml-1">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
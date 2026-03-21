import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  Eye,
  EyeOff,
} from "lucide-react-native";
import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { profileManagementApi } from "@/services/api";

export default function EditProfile() {
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State to track visibility for each password field independently
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load profile data on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const loadProfileData = async () => {
        try {
          setLoading(true);
          const data = await profileManagementApi.getUserProfileExtended();
          setProfileData({
            name: data.first_name || "",
            email: data.email || "",
            address: data.address || "",
          });
        } catch (error) {
          console.error("Failed to load profile:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load profile data",
          });
        } finally {
          setLoading(false);
        }
      };

      loadProfileData();
    }, []),
  );

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await profileManagementApi.updateUserProfile({
        first_name: profileData.name,
        email: profileData.email,
        address: profileData.address,
      });

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter your current password." });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "New passwords do not match." });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Toast.show({ type: "error", text1: "Error", text2: "Password must be at least 6 characters." });
      return;
    }

    try {
      setLoading(true);
      await profileManagementApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      Toast.show({
        type: "success",
        text1: "Password Changed",
        text2: "Your password has been updated successfully.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      Toast.show({ type: "error", text1: "Error", text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Helper to render consistent input fields with visibility toggle
  const renderInput = (
    label: string,
    icon: React.ReactNode,
    value: string,
    fieldKey: string,
    isPassword = false,
    editable = true,
    onChangeText: (text: string) => void,
    isPasswordVisible?: boolean,
    onToggleVisibility?: () => void
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View 
        style={[
          styles.inputWrapper, 
          focusedField === fieldKey && styles.inputFocused,
          !editable && styles.inputDisabled
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        {isPassword && (
          <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeButton}>
            {isPasswordVisible ? (
              <EyeOff size={18} color="#94a3b8" />
            ) : (
              <Eye size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2dd4bf" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profileData.name
                      ? profileData.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                      : "JD"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => Toast.show({ type: "info", text1: "Change Photo", text2: "Coming soon" })}
                >
                  <Camera size={14} color="#0f172a" />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarHint}>Tap to change photo</Text>
            </View>

            {/* Personal Information Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                  <Text style={styles.editLink}>{isEditing ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                {renderInput("Full Name", <User size={14} color="#94a3b8" />, profileData.name, "name", false, isEditing, (text) => handleProfileChange("name", text))}
                {renderInput("Email Address", <Mail size={14} color="#94a3b8" />, profileData.email, "email", false, isEditing, (text) => handleProfileChange("email", text))}
                {renderInput("Address", <MapPin size={14} color="#94a3b8" />, profileData.address, "address", false, isEditing, (text) => handleProfileChange("address", text))}
              </View>

              {isEditing && (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Change Password Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Lock size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.cardTitle}>Change Password</Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                {renderInput(
                  "Current Password", 
                  null, 
                  passwordData.currentPassword, 
                  "currentPassword", 
                  true, 
                  true, 
                  (text) => handlePasswordChange("currentPassword", text),
                  showPasswords.currentPassword,
                  () => togglePasswordVisibility("currentPassword")
                )}
                {renderInput(
                  "New Password", 
                  null, 
                  passwordData.newPassword, 
                  "newPassword", 
                  true, 
                  true, 
                  (text) => handlePasswordChange("newPassword", text),
                  showPasswords.newPassword,
                  () => togglePasswordVisibility("newPassword")
                )}
                {renderInput(
                  "Confirm New Password", 
                  null, 
                  passwordData.confirmPassword, 
                  "confirmPassword", 
                  true, 
                  true, 
                  (text) => handlePasswordChange("confirmPassword", text),
                  showPasswords.confirmPassword,
                  () => togglePasswordVisibility("confirmPassword")
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                  <Text style={styles.saveButtonText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 32, marginTop: 10 },
  avatarContainer: { position: "relative" },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#0f172a", borderWidth: 2, borderColor: "#1e293b", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#2dd4bf" },
  cameraButton: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#2dd4bf", padding: 8, borderRadius: 20, borderWidth: 2, borderColor: "#0f172a" },
  avatarHint: { color: "#64748b", marginTop: 12, fontSize: 14 },
  card: { backgroundColor: "#1e293b", borderRadius: 16, borderWidth: 1, borderColor: "#334155", padding: 16, marginBottom: 24 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#ffffff" },
  editLink: { color: "#ffffff", fontSize: 14, fontWeight: "500" },
  formContainer: { gap: 16 },
  inputGroup: { gap: 8 },
  labelContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#ffffff",
    fontSize: 16,
  },
  eyeButton: {
    paddingRight: 16,
    paddingLeft: 10,
    justifyContent: "center",
  },
  inputFocused: { borderColor: "#2dd4bf" },
  inputDisabled: { opacity: 0.7 },
  saveButton: { backgroundColor: "#2dd4bf", paddingVertical: 16, borderRadius: 9999, alignItems: "center", marginTop: 8 },
  saveButtonText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center", zIndex: 10 },
  loadingText: { color: "#ffffff", fontSize: 16, marginTop: 8 },
});
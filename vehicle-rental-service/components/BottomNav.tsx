import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Calendar, Home, Search, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const BottomNav = (props: Partial<BottomTabBarProps>) => {
  const nativeNavigation = useNavigation();
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();

  const getRouteConfig = (routeName: string) => {
    switch (routeName) {
      case "index":
      case "Home":
        return { icon: Home, label: "Home" };
      case "explore":
      case "Explore":
        return { icon: Search, label: "Explore" };
      case "bookings":
      case "Bookings":
        return { icon: Calendar, label: "Bookings" };
      case "profile":
      case "Profile":
        return { icon: User, label: "Profile" };
      default:
        return { icon: Home, label: "Home" };
    }
  };

  // Standalone navigation mode
  if (!state) {
    const navItems = [
      { name: "index", label: "Home", icon: Home },
      { name: "explore", label: "Explore", icon: Search },
      { name: "bookings", label: "Bookings", icon: Calendar },
      { name: "profile", label: "Profile", icon: User },
    ];

    return (
      <View style={[styles.navContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.navContent}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => nativeNavigation.navigate(item.name as never)}
              style={styles.navItem}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <item.icon size={24} color="#94a3b8" strokeWidth={2} />
              </View>

              <Text style={[styles.label, styles.labelInactive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Tab navigator mode
  return (
    <View style={[styles.navContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.navContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors![route.key];
          const config = getRouteConfig(route.name);
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation!.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation!.dispatch(
                CommonActions.navigate({
                  name: route.name,
                  merge: true,
                })
              );
            }
          };

          const onLongPress = () => {
            navigation!.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.navItem}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isFocused && styles.iconWrapperActive,
                ]}
              >
                <config.icon
                  size={24}
                  color={isFocused ? "#0f172a" : "#94a3b8"}
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 12,
  },

  navContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24, // perfect circle
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  iconWrapperActive: {
    width: 48,
    height: 48,
    borderRadius: 24, // circle
    backgroundColor: "#2dd4bf",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2dd4bf",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },

  label: {
    fontSize: 12,
    marginTop: 2,
  },

  labelActive: {
    color: "#2dd4bf",
    fontWeight: "600",
  },

  labelInactive: {
    color: "#94a3b8",
    fontWeight: "500",
  },
});
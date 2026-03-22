import { getImageSource } from '@/lib/utils';
import { cn } from "@/lib/utils";
import { RentalShop } from "@/types";
import { Bike, Car, ChevronRight, MapPin, Star } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ShopCardProps {
  shop: RentalShop;
  onClick: () => void;
}

export const ShopCard = ({ shop, onClick }: ShopCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onClick}
      className="overflow-hidden rounded-3xl bg-[#16202C] mb-4 border border-slate-800"
    >
      <View className="relative h-48">
        <Image
          source={getImageSource(shop.image)}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <View className="absolute top-3 right-3 flex-row items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-md">
          <Star color="#eab308" fill="#eab308" size={12} />
          <Text className="text-xs font-bold text-white">
            {shop.rating?.toFixed(1) || "0.0"}
          </Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <Text 
              className="text-lg font-bold text-white mb-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shop.name}
            </Text>
            <View className="flex-row items-center gap-1">
              <MapPin color="#94A3B8" size={14} />
              <Text className="text-xs text-slate-400" numberOfLines={1}>
                {shop.distance} km away
              </Text>
            </View>
          </View>
          
          <View
            className={cn(
              "rounded-full px-2 py-0.5 border",
              shop.isOpen
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20",
            )}
          >
            <Text
              className={cn(
                "text-[10px] font-medium",
                shop.isOpen ? "text-green-500" : "text-red-500",
              )}
            >
              {shop.isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-800">
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1.5 rounded-lg bg-[#0F1C23] px-2.5 py-1.5 border border-slate-800">
              <Car color="#22D3EE" size={14} />
              <Text className="text-xs font-medium text-slate-300">
                {shop.vehicleCount.cars}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-lg bg-[#0F1C23] px-2.5 py-1.5 border border-slate-800">
              <Bike color="#22D3EE" size={14} />
              <Text className="text-xs font-medium text-slate-300">
                {shop.vehicleCount.bikes}
              </Text>
            </View>
          </View>

          {/* View Vehicles Section - Forced to One Line */}
          <View className="flex-row items-center gap-1 ml-2">
            <Text 
              className="text-xs font-bold text-[#22D3EE]"
              numberOfLines={1}
            >
              View Vehicles
            </Text>
            <ChevronRight color="#22D3EE" size={14} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
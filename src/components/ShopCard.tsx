import { Star, Clock, MapPin, ChevronRight, Car, Bike } from "lucide-react";
import { RentalShop } from "@/types";
import { cn } from "@/lib/utils";

interface ShopCardProps {
  shop: RentalShop;
  onClick: () => void;
}

export const ShopCard = ({ shop, onClick }: ShopCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary-foreground">{shop.name}</h3>
            <div className="flex items-center gap-1 text-sm text-primary-foreground/80">
              <MapPin className="h-3.5 w-3.5" />
              <span>{shop.distance} km away</span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-card/90 px-2 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-sm font-semibold">{shop.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{shop.operatingHours}</span>
          </div>
          <div
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              shop.isOpen
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {shop.isOpen ? "Open" : "Closed"}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{shop.vehicleCount.cars}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5">
              <Bike className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{shop.vehicleCount.bikes}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            View Vehicles
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

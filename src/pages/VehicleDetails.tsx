import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  Car,
  Bike,
  Fuel,
  Settings2,
  Users,
  Check,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { vehicles, rentalShops } from "@/data/mockData";
import { cn } from "@/lib/utils";

export const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const vehicle = vehicles.find((v) => v.id === id);
  const shop = vehicle ? rentalShops.find((s) => s.id === vehicle.shopId) : null;

  if (!vehicle || !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Image Gallery */}
      <div className="relative h-72">
        <img
          src={vehicle.images[activeImageIndex]}
          alt={vehicle.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Header actions */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-card/80 p-3 backdrop-blur-sm transition-colors hover:bg-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="rounded-xl bg-card/80 p-3 backdrop-blur-sm transition-colors hover:bg-card"
            >
              <Heart
                className={cn("h-5 w-5", isFavorite && "fill-destructive text-destructive")}
              />
            </button>
            <button className="rounded-xl bg-card/80 p-3 backdrop-blur-sm transition-colors hover:bg-card">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image indicators */}
        {vehicle.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {vehicle.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === activeImageIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-card/60 hover:bg-card"
                )}
              />
            ))}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute left-4 top-16">
          <div className="flex items-center gap-1.5 rounded-lg bg-card/90 px-3 py-2 backdrop-blur-sm">
            {vehicle.type === "car" ? (
              <Car className="h-4 w-4 text-primary" />
            ) : (
              <Bike className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium capitalize">{vehicle.type}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <div
                className={cn(
                  "mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold",
                  vehicle.isAvailable
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {vehicle.isAvailable ? "Available" : "Currently Booked"}
              </div>
              <h1 className="text-2xl font-bold text-foreground">{vehicle.name}</h1>
              <p className="text-muted-foreground">{vehicle.model}</p>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Fuel className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-foreground">{vehicle.fuelType}</p>
              <p className="text-xs text-muted-foreground">Fuel</p>
            </div>
            <div className="rounded-xl bg-secondary p-4 text-center">
              <Settings2 className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-foreground">{vehicle.transmission}</p>
              <p className="text-xs text-muted-foreground">Transmission</p>
            </div>
            {vehicle.seating && (
              <div className="rounded-xl bg-secondary p-4 text-center">
                <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-foreground">{vehicle.seating} Seats</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-6">
            <h3 className="mb-3 font-semibold text-foreground">Features</h3>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2"
                >
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-primary">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shop info */}
          <div className="mt-6 rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Available at</p>
            <p className="font-semibold text-foreground">{shop.name}</p>
            <p className="text-sm text-muted-foreground">{shop.address}</p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="px-4 py-6">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="mb-4 font-semibold text-foreground">Pricing</h3>
          <div className="flex gap-4">
            <div className="flex-1 rounded-xl border-2 border-primary bg-primary/5 p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold text-primary">${vehicle.pricePerHour}</p>
              <p className="text-sm text-muted-foreground">per hour</p>
            </div>
            <div className="flex-1 rounded-xl border border-border p-4 text-center">
              <Calendar className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">${vehicle.pricePerDay}</p>
              <p className="text-sm text-muted-foreground">per day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold text-primary">${vehicle.pricePerHour}/hr</p>
          </div>
          <Button
            className="flex-1"
            size="lg"
            disabled={!vehicle.isAvailable}
            onClick={() => navigate(`/booking/${vehicle.id}`)}
          >
            {vehicle.isAvailable ? "Book Now" : "Not Available"}
          </Button>
        </div>
      </div>
    </div>
  );
};

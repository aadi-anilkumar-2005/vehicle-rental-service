import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, MapPin, Phone, Share2 } from "lucide-react";
import { VehicleFilter } from "@/components/VehicleFilter";
import { VehicleCard } from "@/components/VehicleCard";
import { BottomNav } from "@/components/BottomNav";
import { rentalShops, vehicles } from "@/data/mockData";

export const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<"all" | "car" | "bike">("all");

  const shop = rentalShops.find((s) => s.id === id);
  const shopVehicles = vehicles.filter((v) => v.shopId === id);

  const filteredVehicles = shopVehicles.filter((vehicle) => {
    if (activeFilter === "all") return true;
    return vehicle.type === activeFilter;
  });

  if (!shop) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Shop not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        <img
          src={shop.image}
          alt={shop.name}
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
          <button className="rounded-xl bg-card/80 p-3 backdrop-blur-sm transition-colors hover:bg-card">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Shop Info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{shop.name}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{shop.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-warning/10 px-3 py-2">
              <Star className="h-5 w-5 fill-warning text-warning" />
              <span className="font-bold text-foreground">{shop.rating}</span>
              <span className="text-sm text-muted-foreground">({shop.reviewCount})</span>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`h-2.5 w-2.5 rounded-full ${shop.isOpen ? 'bg-success' : 'bg-destructive'}`} />
              <span className={shop.isOpen ? 'text-success' : 'text-destructive'}>
                {shop.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{shop.operatingHours}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="flex-1 gradient-primary rounded-xl py-3 text-center font-semibold text-primary-foreground shadow-button transition-opacity hover:opacity-90">
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Call Shop
              </div>
            </button>
            <button className="flex-1 rounded-xl border-2 border-primary py-3 text-center font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Available Vehicles</h2>
          <span className="text-sm text-muted-foreground">
            {filteredVehicles.length} vehicles
          </span>
        </div>

        <div className="mb-4">
          <VehicleFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {filteredVehicles.length > 0 ? (
          <div className="grid gap-4">
            {filteredVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-8 text-center shadow-card">
            <p className="text-muted-foreground">No vehicles available in this category</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

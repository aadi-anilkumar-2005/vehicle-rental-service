import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MapPin } from "lucide-react";
import { LocationSearch } from "@/components/LocationSearch";
import { VehicleFilter } from "@/components/VehicleFilter";
import { MapView } from "@/components/MapView";
import { ShopCard } from "@/components/ShopCard";
import { BottomNav } from "@/components/BottomNav";
import { rentalShops } from "@/data/mockData";
import { toast } from "sonner";

export const Home = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Current Location");
  const [activeFilter, setActiveFilter] = useState<"all" | "car" | "bike">("all");

  const handleCurrentLocation = () => {
    setLocation("Current Location");
    toast.success("Location updated");
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  const filteredShops = rentalShops.filter((shop) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "car") return shop.vehicleCount.cars > 0;
    if (activeFilter === "bike") return shop.vehicleCount.bikes > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Your Location</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">{location}</h2>
          </div>
          <button className="relative rounded-xl bg-secondary p-3 transition-colors hover:bg-secondary/80">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Search */}
        <div className="mb-6 animate-fade-in">
          <LocationSearch
            value={location}
            onChange={setLocation}
            onCurrentLocation={handleCurrentLocation}
          />
        </div>

        {/* Map */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <MapView shops={filteredShops} onShopClick={handleShopClick} />
        </div>

        {/* Filter */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <VehicleFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Section title */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Nearby Rentals</h2>
          <span className="text-sm text-muted-foreground">
            {filteredShops.length} shops
          </span>
        </div>

        {/* Shop list */}
        <div className="space-y-4">
          {filteredShops.map((shop, index) => (
            <div
              key={shop.id}
              className="animate-slide-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <ShopCard shop={shop} onClick={() => handleShopClick(shop.id)} />
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

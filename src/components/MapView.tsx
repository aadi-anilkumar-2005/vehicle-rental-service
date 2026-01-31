import { MapPin } from "lucide-react";
import { RentalShop } from "@/types";

interface MapViewProps {
  shops: RentalShop[];
  onShopClick: (shopId: string) => void;
}

export const MapView = ({ shops, onShopClick }: MapViewProps) => {
  return (
    <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-secondary to-primary/10">
      {/* Map placeholder with stylized design */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Roads */}
        <div className="absolute left-1/4 top-0 h-full w-2 bg-muted-foreground/20" />
        <div className="absolute left-0 top-1/2 h-2 w-full bg-muted-foreground/20" />
        <div className="absolute right-1/3 top-0 h-full w-1.5 rotate-12 bg-muted-foreground/15" />
        
        {/* Current location indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-4 animate-ping rounded-full bg-primary/30" />
            <div className="relative h-4 w-4 rounded-full border-4 border-card bg-primary shadow-lg" />
          </div>
        </div>
        
        {/* Shop markers */}
        {shops.slice(0, 4).map((shop, index) => {
          const positions = [
            { top: "25%", left: "30%" },
            { top: "35%", left: "65%" },
            { top: "60%", left: "25%" },
            { top: "70%", left: "70%" },
          ];
          return (
            <button
              key={shop.id}
              onClick={() => onShopClick(shop.id)}
              className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
              style={positions[index]}
            >
              <div className="gradient-accent flex h-8 w-8 items-center justify-center rounded-full shadow-lg">
                <MapPin className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 gradient-accent" />
            </button>
          );
        })}
      </div>
      
      {/* Overlay text */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {shops.length} rental shops nearby
          </p>
          <p className="text-xs text-muted-foreground">
            Tap markers to view details
          </p>
        </div>
      </div>
    </div>
  );
};

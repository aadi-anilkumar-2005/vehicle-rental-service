import { useState } from "react";
import { MapPin, Navigation, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface DeliveryLocationSelectorProps {
  type: 'delivery' | 'pickup';
  currentAddress?: string;
  onSelect: (address: string) => void;
  onClose: () => void;
}

const savedLocations = [
  { id: "1", name: "Home", address: "123 Main Street, Apt 4B" },
  { id: "2", name: "Work", address: "456 Business Park, Suite 200" },
  { id: "3", name: "Gym", address: "789 Fitness Lane" },
];

export const DeliveryLocationSelector = ({ 
  type, 
  currentAddress = "", 
  onSelect, 
  onClose 
}: DeliveryLocationSelectorProps) => {
  const [address, setAddress] = useState(currentAddress);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleCurrentLocation = () => {
    setUseCurrentLocation(true);
    setAddress("Current Location (GPS)");
    toast.success("Using your current location");
  };

  const handleConfirm = () => {
    if (!address) {
      toast.error("Please enter or select a location");
      return;
    }
    onSelect(address);
    toast.success(`${type === 'delivery' ? 'Delivery' : 'Pickup'} location set`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">
            {type === 'delivery' ? 'Set Delivery Location' : 'Set Pickup Location'}
          </h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Mock Map */}
      <div className="h-56 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <MapPin className="h-12 w-12 text-primary mx-auto animate-bounce" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-sm" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Drag to set location</p>
          </div>
        </div>
        
        {/* Current Location Button */}
        <button 
          onClick={handleCurrentLocation}
          className="absolute bottom-4 right-4 bg-card rounded-xl p-3 shadow-lg border border-border"
        >
          <Navigation className="h-5 w-5 text-primary" />
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Enter address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-12 h-14 rounded-2xl"
          />
        </div>

        {/* Saved Locations */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Saved Locations</h3>
          <div className="space-y-2">
            {savedLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setAddress(loc.address)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  address === loc.address 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">{loc.name}</p>
                  <p className="text-sm text-muted-foreground">{loc.address}</p>
                </div>
                {address === loc.address && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <Button onClick={handleConfirm} className="w-full" size="lg">
          Confirm {type === 'delivery' ? 'Delivery' : 'Pickup'} Location
        </Button>
      </div>
    </div>
  );
};

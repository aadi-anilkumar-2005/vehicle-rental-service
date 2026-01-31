import { MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onCurrentLocation?: () => void;
}

export const LocationSearch = ({ value, onChange, onCurrentLocation }: LocationSearchProps) => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
        <MapPin className="h-5 w-5" />
      </div>
      <Input
        type="text"
        placeholder="Search location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-2xl border-2 border-border bg-card pl-12 pr-14 text-base shadow-card transition-all focus:border-primary focus:shadow-lg"
      />
      <button
        onClick={onCurrentLocation}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-primary/10 p-2.5 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
      >
        <Navigation className="h-5 w-5" />
      </button>
    </div>
  );
};

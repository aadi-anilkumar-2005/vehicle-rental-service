import { Car, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "car" | "bike";

interface VehicleFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const VehicleFilter = ({ activeFilter, onFilterChange }: VehicleFilterProps) => {
  const filters: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: "all", label: "All", icon: null },
    { type: "car", label: "Cars", icon: <Car className="h-4 w-4" /> },
    { type: "bike", label: "Bikes", icon: <Bike className="h-4 w-4" /> },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.type}
          onClick={() => onFilterChange(filter.type)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
            activeFilter === filter.type
              ? "gradient-primary text-primary-foreground shadow-button"
              : "bg-card text-muted-foreground shadow-sm hover:bg-secondary"
          )}
        >
          {filter.icon}
          {filter.label}
        </button>
      ))}
    </div>
  );
};

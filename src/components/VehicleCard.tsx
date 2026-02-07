import { Car, Bike, Fuel, Users, Settings2 } from "lucide-react";
import { Vehicle } from "@/types";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={vehicle.images[0]}
          alt={vehicle.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute left-3 top-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-card/90 px-2.5 py-1.5 backdrop-blur-sm">
            {vehicle.type === "car" ? (
              <Car className="h-4 w-4 text-primary" />
            ) : (
              <Bike className="h-4 w-4 text-primary" />
            )}
            <span className="text-xs font-medium capitalize">{vehicle.type}</span>
          </div>
        </div>
        <div className="absolute right-3 top-3">
          <div
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-semibold backdrop-blur-sm",
              vehicle.isAvailable
                ? "bg-success/90 text-success-foreground"
                : "bg-destructive/90 text-destructive-foreground"
            )}
          >
            {vehicle.isAvailable ? "Available" : "Booked"}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground">{vehicle.brand}</p>
            {vehicle.vehicleNumber && (
              <p className="text-xs font-medium text-primary">{vehicle.vehicleNumber}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">${vehicle.pricePerHour}</div>
            <div className="text-xs text-muted-foreground">/hour</div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5">
            <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{vehicle.transmission}</span>
          </div>
          {vehicle.seating && (
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{vehicle.seating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

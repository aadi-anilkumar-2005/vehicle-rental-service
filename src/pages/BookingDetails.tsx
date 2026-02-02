import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Phone, Navigation, Car, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookings } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Booking not found</p>
      </div>
    );
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            onTouchEnd={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            className="rounded-xl bg-secondary p-2.5 transition-colors hover:bg-secondary/80 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Booking Details</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Status banner */}
        <div
          className={cn(
            "rounded-2xl p-4 text-center animate-slide-up",
            booking.status === "upcoming" && "bg-primary/10",
            booking.status === "completed" && "bg-success/10",
            booking.status === "cancelled" && "bg-destructive/10",
            booking.status === "active" && "bg-warning/10"
          )}
        >
          <span
            className={cn(
              "text-lg font-semibold capitalize",
              booking.status === "upcoming" && "text-primary",
              booking.status === "completed" && "text-success",
              booking.status === "cancelled" && "text-destructive",
              booking.status === "active" && "text-warning"
            )}
          >
            {booking.status === "upcoming" ? "🗓️ Upcoming Booking" : 
             booking.status === "completed" ? "✅ Completed" :
             booking.status === "active" ? "🚗 Active Rental" : "❌ Cancelled"}
          </span>
        </div>

        {/* Vehicle info */}
        <div className="rounded-2xl bg-card p-4 shadow-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex gap-4">
            <img
              src={booking.vehicle.images[0]}
              alt={booking.vehicle.name}
              className="h-28 w-36 rounded-xl object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {booking.vehicle.type === "car" ? (
                  <Car className="h-4 w-4 text-primary" />
                ) : (
                  <Bike className="h-4 w-4 text-primary" />
                )}
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {booking.vehicle.type}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{booking.vehicle.name}</h2>
              <p className="text-sm text-muted-foreground">{booking.vehicle.model}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                  {booking.vehicle.transmission}
                </span>
                <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                  {booking.vehicle.fuelType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup Date</p>
                <p className="font-semibold text-foreground">
                  {format(startDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup Time</p>
                <p className="font-semibold text-foreground">{format(startDate, "h:mm a")}</p>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-secondary p-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Return Date</p>
                <p className="font-semibold text-foreground">
                  {format(endDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-secondary p-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Return Time</p>
                <p className="font-semibold text-foreground">{format(endDate, "h:mm a")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Pickup Location</h3>
          <div className="flex gap-4">
            <img
              src={booking.shop.image}
              alt={booking.shop.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{booking.shop.name}</h4>
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{booking.shop.address}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Call Shop
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Navigation className="mr-2 h-4 w-4" />
              Directions
            </Button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Payment Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rental charges</span>
              <span className="font-medium text-foreground">${booking.totalPrice - 5}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span className="font-medium text-foreground">$5</span>
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total Paid</span>
              <span className="font-bold text-primary">${booking.totalPrice}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md flex gap-3">
          {booking.status === "upcoming" && (
            <>
              <Button variant="outline" className="flex-1">
                Cancel Booking
              </Button>
              <Button className="flex-1">
                Modify Booking
              </Button>
            </>
          )}
          {booking.status === "completed" && (
            <Button 
              className="w-full" 
              onClick={() => navigate(`/vehicle/${booking.vehicleId}`)}
            >
              Book Again
            </Button>
          )}
          {booking.status === "cancelled" && (
            <Button 
              className="w-full" 
              onClick={() => navigate(`/vehicle/${booking.vehicleId}`)}
            >
              Rebook Vehicle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

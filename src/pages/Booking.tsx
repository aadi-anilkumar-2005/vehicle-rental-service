import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Wallet, Smartphone, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vehicles, rentalShops } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DeliveryLocationSelector } from "@/components/user/DeliveryLocationSelector";

type PaymentMethod = "card" | "upi" | "wallet";
type DeliveryOption = "self" | "delivery";
type PickupOption = "self" | "pickup";

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingType = searchParams.get("type") === "day" ? "day" : "hour";
  
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [duration, setDuration] = useState(bookingType === "day" ? 1 : 4);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  
  // New delivery/pickup states
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("self");
  const [pickupOption, setPickupOption] = useState<PickupOption>("self");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [showDeliverySelector, setShowDeliverySelector] = useState(false);
  const [showPickupSelector, setShowPickupSelector] = useState(false);

  const vehicle = vehicles.find((v) => v.id === id);
  const shop = vehicle ? rentalShops.find((s) => s.id === vehicle.shopId) : null;

  if (!vehicle || !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    );
  }

  const pricePerUnit = bookingType === "day" ? vehicle.pricePerDay : vehicle.pricePerHour;
  const deliveryFee = deliveryOption === "delivery" ? 10 : 0;
  const pickupFee = pickupOption === "pickup" ? 10 : 0;
  const serviceFee = 5;
  const totalPrice = (pricePerUnit * duration) + deliveryFee + pickupFee + serviceFee;

  const dates = ["Today", "Tomorrow", "Wed, 5 Feb", "Thu, 6 Feb"];
  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

  const handleConfirmBooking = () => {
    if (deliveryOption === "delivery" && !deliveryAddress) {
      toast.error("Please set a delivery location");
      return;
    }
    if (pickupOption === "pickup" && !pickupAddress) {
      toast.error("Please set a pickup location");
      return;
    }
    toast.success("Booking confirmed successfully!", {
      description: `Your ${vehicle.name} is booked for ${duration} ${bookingType === "day" ? (duration === 1 ? "day" : "days") : (duration === 1 ? "hour" : "hours")}`,
    });
    navigate("/bookings");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-secondary p-2.5 transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Book Vehicle</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Vehicle summary */}
        <div className="rounded-2xl bg-card p-4 shadow-card animate-slide-up">
          <div className="flex gap-4">
            <img
              src={vehicle.images[0]}
              alt={vehicle.name}
              className="h-24 w-32 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h2 className="font-bold text-foreground">{vehicle.name}</h2>
              <p className="text-sm text-muted-foreground">{vehicle.model}</p>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{shop.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date selection */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Date</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setSelectedDate(date);
                }}
                className={cn(
                  "whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition-all cursor-pointer select-none active:scale-95",
                  selectedDate === date
                    ? "gradient-primary text-primary-foreground shadow-button"
                    : "bg-card text-muted-foreground shadow-sm hover:bg-secondary"
                )}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Time selection */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Select Time</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {times.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setSelectedTime(time);
                }}
                className={cn(
                  "rounded-xl py-3 text-sm font-medium transition-all cursor-pointer select-none active:scale-95",
                  selectedTime === time
                    ? "gradient-primary text-primary-foreground shadow-button"
                    : "bg-card text-muted-foreground shadow-sm hover:bg-secondary"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="mb-3 flex items-center gap-2">
            {bookingType === "day" ? (
              <Calendar className="h-5 w-5 text-primary" />
            ) : (
              <Clock className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-semibold text-foreground">
              Duration ({bookingType === "day" ? "days" : "hours"})
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDuration(Math.max(1, duration - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl font-bold transition-colors hover:bg-secondary/80 active:scale-95"
            >
              −
            </button>
            <div className="flex-1 rounded-xl bg-card py-3 text-center shadow-card">
              <span className="text-2xl font-bold text-primary">{duration}</span>
              <span className="ml-1 text-muted-foreground">
                {bookingType === "day" ? (duration === 1 ? "day" : "days") : (duration === 1 ? "hour" : "hours")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDuration(duration + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl font-bold transition-colors hover:bg-secondary/80 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Payment method */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="mb-3 font-semibold text-foreground">Payment Method</h3>
          <div className="space-y-2">
            {[
              { id: "card" as const, icon: CreditCard, label: "Credit / Debit Card" },
              { id: "upi" as const, icon: Smartphone, label: "UPI Payment" },
              { id: "wallet" as const, icon: Wallet, label: "Digital Wallet" },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border-2 p-4 transition-all",
                  paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-3",
                    paymentMethod === method.id
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <method.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-foreground">{method.label}</span>
                <div
                  className={cn(
                    "ml-auto h-5 w-5 rounded-full border-2 transition-all",
                    paymentMethod === method.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {paymentMethod === method.id && (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Option */}
        <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <div className="mb-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Vehicle Delivery</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setDeliveryOption("self")}
              className={cn(
                "rounded-xl py-3 px-4 text-sm font-medium transition-all border-2",
                deliveryOption === "self"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              Self Pickup
            </button>
            <button
              type="button"
              onClick={() => {
                setDeliveryOption("delivery");
                if (!deliveryAddress) setShowDeliverySelector(true);
              }}
              className={cn(
                "rounded-xl py-3 px-4 text-sm font-medium transition-all border-2",
                deliveryOption === "delivery"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              Home Delivery (+$10)
            </button>
          </div>
          {deliveryOption === "delivery" && (
            <button
              onClick={() => setShowDeliverySelector(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all"
            >
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm text-left flex-1">
                {deliveryAddress || "Set delivery location..."}
              </span>
            </button>
          )}
        </div>

        {/* Pickup Option */}
        <div className="animate-slide-up" style={{ animationDelay: "0.55s" }}>
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Vehicle Return</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setPickupOption("self")}
              className={cn(
                "rounded-xl py-3 px-4 text-sm font-medium transition-all border-2",
                pickupOption === "self"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              Return to Shop
            </button>
            <button
              type="button"
              onClick={() => {
                setPickupOption("pickup");
                if (!pickupAddress) setShowPickupSelector(true);
              }}
              className={cn(
                "rounded-xl py-3 px-4 text-sm font-medium transition-all border-2",
                pickupOption === "pickup"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              Schedule Pickup (+$10)
            </button>
          </div>
          {pickupOption === "pickup" && (
            <button
              onClick={() => setShowPickupSelector(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all"
            >
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm text-left flex-1">
                {pickupAddress || "Set pickup location..."}
              </span>
            </button>
          )}
        </div>

        {/* Price summary */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.6s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ${pricePerUnit} × {duration} {bookingType === "day" ? (duration === 1 ? "day" : "days") : (duration === 1 ? "hour" : "hours")}
              </span>
              <span className="font-medium text-foreground">${pricePerUnit * duration}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-medium text-foreground">${deliveryFee}</span>
              </div>
            )}
            {pickupFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup fee</span>
                <span className="font-medium text-foreground">${pickupFee}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span className="font-medium text-foreground">${serviceFee}</span>
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-primary">${totalPrice}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <Button className="w-full" size="lg" onClick={handleConfirmBooking}>
            Confirm Booking • ${totalPrice}
          </Button>
        </div>
      </div>

      {/* Location Selectors */}
      {showDeliverySelector && (
        <DeliveryLocationSelector
          type="delivery"
          currentAddress={deliveryAddress}
          onSelect={(address) => {
            setDeliveryAddress(address);
            setShowDeliverySelector(false);
          }}
          onClose={() => setShowDeliverySelector(false)}
        />
      )}
      {showPickupSelector && (
        <DeliveryLocationSelector
          type="pickup"
          currentAddress={pickupAddress}
          onSelect={(address) => {
            setPickupAddress(address);
            setShowPickupSelector(false);
          }}
          onClose={() => setShowPickupSelector(false)}
        />
      )}
    </div>
  );
};

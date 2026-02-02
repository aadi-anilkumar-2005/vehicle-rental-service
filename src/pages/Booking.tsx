import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Wallet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vehicles, rentalShops } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PaymentMethod = "card" | "upi" | "wallet";

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [duration, setDuration] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const vehicle = vehicles.find((v) => v.id === id);
  const shop = vehicle ? rentalShops.find((s) => s.id === vehicle.shopId) : null;

  if (!vehicle || !shop) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    );
  }

  const totalPrice = vehicle.pricePerHour * duration;

  const dates = ["Today", "Tomorrow", "Wed, 5 Feb", "Thu, 6 Feb"];
  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

  const handleConfirmBooking = () => {
    toast.success("Booking confirmed successfully!", {
      description: `Your ${vehicle.name} is booked for ${duration} hours`,
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
          <h3 className="mb-3 font-semibold text-foreground">Duration (hours)</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDuration(Math.max(1, duration - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl font-bold transition-colors hover:bg-secondary/80"
            >
              −
            </button>
            <div className="flex-1 rounded-xl bg-card py-3 text-center shadow-card">
              <span className="text-2xl font-bold text-primary">{duration}</span>
              <span className="ml-1 text-muted-foreground">hours</span>
            </div>
            <button
              onClick={() => setDuration(duration + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xl font-bold transition-colors hover:bg-secondary/80"
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

        {/* Price summary */}
        <div className="rounded-2xl bg-card p-5 shadow-card animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <h3 className="mb-4 font-semibold text-foreground">Booking Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ${vehicle.pricePerHour} × {duration} hours
              </span>
              <span className="font-medium text-foreground">${totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span className="font-medium text-foreground">$5</span>
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-primary">${totalPrice + 5}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <Button className="w-full" size="lg" onClick={handleConfirmBooking}>
            Confirm Booking • ${totalPrice + 5}
          </Button>
        </div>
      </div>
    </div>
  );
};

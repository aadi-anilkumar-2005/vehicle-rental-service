import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { bookings } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Bookings = () => {
  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming</h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-card p-4 shadow-card animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-4">
                    <img
                      src={booking.vehicle.images[0]}
                      alt={booking.vehicle.name}
                      className="h-24 w-28 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">{booking.vehicle.name}</h3>
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{booking.shop.name}</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary capitalize">
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(booking.startDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(new Date(booking.startDate), "h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-primary">${booking.totalPrice}</p>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-8 text-center shadow-card">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No upcoming bookings</p>
            </div>
          )}
        </section>

        {/* Past bookings */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Past Bookings</h2>
          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-card p-4 shadow-card opacity-75 animate-slide-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="flex gap-4">
                    <img
                      src={booking.vehicle.images[0]}
                      alt={booking.vehicle.name}
                      className="h-20 w-24 rounded-xl object-cover grayscale"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">{booking.vehicle.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.startDate), "MMM d, yyyy")}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            booking.status === "completed"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-semibold text-foreground">${booking.totalPrice}</p>
                        <button className="text-sm font-medium text-primary hover:underline">
                          Book Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-8 text-center shadow-card">
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

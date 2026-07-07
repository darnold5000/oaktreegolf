"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvailableTeeTimesProps {
  slots: {
    time: string;
    label: string;
    spotsRemaining?: number;
  }[];
  selectedTime?: string;
  onSelect: (time: string) => void;
  loading?: boolean;
}

export function AvailableTeeTimes({
  slots,
  selectedTime,
  onSelect,
  loading,
}: AvailableTeeTimesProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading available tee times...</p>;
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="font-medium">No tee times available for this date.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try another date or call the pro shop at{" "}
          <a href="tel:+13178396205" className="text-primary underline">
            317-839-6205
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((slot) => (
        <Button
          key={slot.time}
          type="button"
          variant={selectedTime === slot.time ? "default" : "outline"}
          className={cn("h-auto min-h-12 flex-col py-2 text-base", selectedTime === slot.time && "ring-2 ring-primary/30")}
          onClick={() => onSelect(slot.time)}
        >
          <span>{slot.label.split(" — ")[0]}</span>
          {slot.spotsRemaining !== undefined && (
            <span className="text-xs font-normal opacity-80">
              {slot.spotsRemaining === 1 ? "1 spot left" : `${slot.spotsRemaining} spots left`}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}

export function BookingSuccess({
  booking,
}: {
  booking: {
    customer_name: string;
    booking_date: string;
    tee_time: string;
    players: number;
  };
}) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
        ✓
      </div>
      <h1 className="font-heading text-2xl font-semibold">You&apos;re booked!</h1>
      <p className="mt-2 text-muted-foreground">
        A confirmation email has been sent to your inbox.
      </p>
      <div className="mt-6 rounded-lg bg-muted/50 p-4 text-left text-sm">
        <p>
          <strong>Name:</strong> {booking.customer_name}
        </p>
        <p>
          <strong>Date:</strong> {booking.booking_date}
        </p>
        <p>
          <strong>Time:</strong> {booking.tee_time.slice(0, 5)}
        </p>
        <p>
          <strong>Players:</strong> {booking.players}
        </p>
        <p className="mt-3 font-medium text-primary">Payment is due at the course.</p>
      </div>
      <Button asChild className="mt-6">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}

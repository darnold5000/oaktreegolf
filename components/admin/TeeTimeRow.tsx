"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Booking, TeeSheetSlot } from "@/lib/types/database";

function sourceLabel(source: string): string {
  return source.replace("_", " ");
}

function statusBadge(slot: TeeSheetSlot) {
  if (slot.type === "blocked") {
    return <Badge variant="secondary">Blocked</Badge>;
  }
  if (slot.type === "full") {
    return <Badge variant="destructive">Full</Badge>;
  }
  if (slot.type === "partial") {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-900">
        {slot.spotsRemaining} open
      </Badge>
    );
  }
  return <Badge variant="outline">Open</Badge>;
}

function BookingLine({
  booking,
  onCancel,
  onCheckIn,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  onCheckIn: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 py-2 first:border-t-0 first:pt-0">
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium leading-tight">
          {booking.customer_name} · {booking.players}p
          {booking.customer_phone ? ` · ${booking.customer_phone}` : ""}
        </p>
        <p className="text-xs capitalize text-muted-foreground">
          {sourceLabel(booking.source)} · {booking.status.replace("_", " ")}
          {booking.cart_preference !== "unknown" ? ` · ${booking.cart_preference}` : ""}
        </p>
        {booking.notes ? (
          <p className="mt-0.5 truncate text-xs italic text-muted-foreground">{booking.notes}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        <Button size="sm" variant="outline" asChild className="h-9 min-w-[4.5rem]">
          <Link href={`/admin/bookings/${booking.id}/edit`}>Edit</Link>
        </Button>
        {booking.status === "reserved" && (
          <Button
            size="sm"
            variant="secondary"
            className="h-9 min-w-[4.5rem]"
            onClick={() => onCheckIn(booking.id)}
          >
            Check In
          </Button>
        )}
        {booking.status !== "cancelled" && (
          <Button
            size="sm"
            variant="destructive"
            className="h-9 min-w-[4.5rem]"
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function TeeTimeRow({
  slot,
  cancelledBookings = [],
  onBook,
  onAddPlayers,
  onCancel,
  onCheckIn,
}: {
  slot: TeeSheetSlot;
  cancelledBookings?: Booking[];
  onBook: (time: string) => void;
  onAddPlayers: (time: string, spotsRemaining: number) => void;
  onCancel: (id: string) => void;
  onCheckIn: (id: string) => void;
}) {
  const capacityLabel =
    slot.type === "blocked"
      ? "—"
      : `${slot.bookedPlayers}/${slot.maxPlayers}`;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-3 py-2",
        slot.type === "blocked" && "bg-muted/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="flex w-[5.5rem] shrink-0 items-center gap-2">
          <span className="text-base font-semibold tabular-nums">{slot.label}</span>
        </div>

        <div className="flex w-16 shrink-0 items-center">
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {capacityLabel}
          </span>
        </div>

        <div className="min-w-[5.5rem] shrink-0">{statusBadge(slot)}</div>

        <div className="min-w-0 flex-1">
          {slot.type === "blocked" && slot.block && (
            <p className="text-sm">
              <span className="font-medium">{slot.block.reason}</span>
              {slot.block.public_note ? (
                <span className="text-muted-foreground"> — {slot.block.public_note}</span>
              ) : null}
            </p>
          )}

          {slot.type !== "blocked" && slot.bookings.length === 0 && (
            <p className="text-sm text-muted-foreground">No bookings</p>
          )}

          {slot.bookings.map((booking) => (
            <BookingLine
              key={booking.id}
              booking={booking}
              onCancel={onCancel}
              onCheckIn={onCheckIn}
            />
          ))}

          {cancelledBookings.map((booking) => (
            <div
              key={booking.id}
              className="border-t border-dashed py-1.5 text-xs text-muted-foreground line-through"
            >
              {booking.customer_name} · {booking.players}p · cancelled
            </div>
          ))}
        </div>

        {slot.type !== "blocked" && (
          <div className="flex shrink-0 gap-1.5">
            {slot.type === "open" && (
              <Button size="sm" className="h-9 min-w-[4.5rem]" onClick={() => onBook(slot.time)}>
                Book
              </Button>
            )}
            {slot.type === "partial" && (
              <Button
                size="sm"
                variant="secondary"
                className="h-9"
                onClick={() => onAddPlayers(slot.time, slot.spotsRemaining)}
              >
                Add Players
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminTeeSheet({
  slots,
  allBookings,
  showCancelled,
  onBook,
  onAddPlayers,
  onCancel,
  onCheckIn,
}: {
  slots: TeeSheetSlot[];
  allBookings: Booking[];
  showCancelled: boolean;
  onBook: (time: string) => void;
  onAddPlayers: (time: string, spotsRemaining: number) => void;
  onCancel: (id: string) => void;
  onCheckIn: (id: string) => void;
}) {
  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Course is closed or no tee times configured for this date.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {slots.map((slot) => {
        const cancelled = showCancelled
          ? allBookings.filter(
              (b) =>
                b.tee_time.slice(0, 8) === slot.time.slice(0, 8) && b.status === "cancelled",
            )
          : [];

        return (
          <TeeTimeRow
            key={slot.time}
            slot={slot}
            cancelledBookings={cancelled}
            onBook={onBook}
            onAddPlayers={onAddPlayers}
            onCancel={onCancel}
            onCheckIn={onCheckIn}
          />
        );
      })}
    </div>
  );
}

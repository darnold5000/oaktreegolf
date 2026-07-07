"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Booking, TeeSheetSlot } from "@/lib/types/database";

export type TeeSheetDensity = "compact" | "comfortable";

function sourceLabel(source: string): string {
  switch (source) {
    case "walk_in":
      return "Walk-in";
    case "online":
      return "Online";
    case "phone":
      return "Phone";
    case "staff":
      return "Staff";
    case "league":
      return "League";
    default:
      return source.replace("_", " ");
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "checked_in":
      return "Checked In";
    case "no_show":
      return "No Show";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function cartLabel(cart: string): string | null {
  if (cart === "cart") return "Cart";
  if (cart === "walking") return "Walking";
  return null;
}

function playersLabel(count: number): string {
  return count === 1 ? "1 player" : `${count} players`;
}

function availabilityBadge(slot: TeeSheetSlot) {
  if (slot.type === "blocked") {
    return <Badge variant="secondary">Blocked</Badge>;
  }
  if (slot.type === "full") {
    return <Badge variant="destructive">Full</Badge>;
  }
  if (slot.type === "open") {
    return (
      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
        Open
      </Badge>
    );
  }
  const spots = slot.spotsRemaining;
  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-900">
      {spots === 1 ? "1 spot open" : `${spots} spots open`}
    </Badge>
  );
}

function bookingMetaLine(booking: Booking): string {
  const parts = [playersLabel(booking.players)];
  const cart = cartLabel(booking.cart_preference);
  if (cart) parts.push(cart);
  if (booking.customer_phone) parts.push("Phone");
  if (booking.customer_email) parts.push("Email");
  parts.push(sourceLabel(booking.source));
  parts.push(statusLabel(booking.status));
  return parts.join(" · ");
}

function BookingLine({
  booking,
  density,
  onCancel,
  onCheckIn,
}: {
  booking: Booking;
  density: TeeSheetDensity;
  onCancel: (id: string) => void;
  onCheckIn: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const compact = density === "compact";
  const hasContact = !!(booking.customer_phone || booking.customer_email);

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-2 rounded-md bg-muted/30",
        compact ? "px-2 py-1.5" : "px-2.5 py-2",
      )}
    >
      <div className="min-w-0 flex-1">
        <button
          type="button"
          className={cn(
            "text-left",
            hasContact && "cursor-pointer",
            !hasContact && "cursor-default",
          )}
          onClick={() => hasContact && setExpanded((v) => !v)}
          disabled={!hasContact}
        >
          <p className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}>
            {booking.customer_name}
          </p>
          <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {bookingMetaLine(booking)}
          </p>
        </button>
        {expanded && hasContact && (
          <div className={cn("mt-1 space-y-0.5 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {booking.customer_phone ? <p>{booking.customer_phone}</p> : null}
            {booking.customer_email ? <p>{booking.customer_email}</p> : null}
          </div>
        )}
        {booking.notes ? (
          <p className={cn("mt-0.5 italic text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {booking.notes}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        <Button size="sm" variant="outline" asChild className={cn(compact ? "h-7 px-2 text-xs" : "h-8")}>
          <Link href={`/admin/bookings/${booking.id}/edit`}>Edit</Link>
        </Button>
        {booking.status === "reserved" && (
          <Button
            size="sm"
            variant="secondary"
            className={cn(compact ? "h-7 px-2 text-xs" : "h-8")}
            onClick={() => onCheckIn(booking.id)}
          >
            Check In
          </Button>
        )}
        {booking.status !== "cancelled" && (
          <Button
            size="sm"
            variant="destructive"
            className={cn(compact ? "h-7 px-2 text-xs" : "h-8")}
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
  density = "compact",
  onBook,
  onAddPlayers,
  onCancel,
  onCheckIn,
}: {
  slot: TeeSheetSlot;
  cancelledBookings?: Booking[];
  density?: TeeSheetDensity;
  onBook: (time: string) => void;
  onAddPlayers: (time: string, spotsRemaining: number) => void;
  onCancel: (id: string) => void;
  onCheckIn: (id: string) => void;
}) {
  const compact = density === "compact";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        compact ? "px-2.5 py-2" : "px-3 py-3",
        slot.type === "blocked" && "bg-muted/40",
      )}
    >
      <div className="grid grid-cols-[minmax(5.5rem,6.5rem)_1fr_auto] items-start gap-3">
        {/* Left: time, capacity, availability */}
        <div className="space-y-1">
          <p className={cn("font-semibold tabular-nums leading-none", compact ? "text-lg" : "text-xl")}>
            {slot.label}
          </p>
          {slot.type !== "blocked" ? (
            <>
              <Badge variant="outline" className="tabular-nums font-normal">
                {slot.bookedPlayers}/{slot.maxPlayers} players
              </Badge>
              <div>{availabilityBadge(slot)}</div>
            </>
          ) : (
            <Badge variant="secondary">Blocked</Badge>
          )}
        </div>

        {/* Middle: bookings */}
        <div className={cn("min-w-0 space-y-1", compact ? "space-y-1" : "space-y-1.5")}>
          {slot.type === "blocked" && slot.block && (
            <p className={cn("text-muted-foreground", compact ? "text-sm" : "text-base")}>
              <span className="font-medium text-foreground">{slot.block.reason}</span>
              {slot.block.public_note ? ` — ${slot.block.public_note}` : null}
            </p>
          )}

          {slot.type !== "blocked" && slot.bookings.length === 0 && (
            <p className={cn("text-muted-foreground", compact ? "text-sm" : "text-base")}>No bookings</p>
          )}

          {slot.bookings.map((booking) => (
            <BookingLine
              key={booking.id}
              booking={booking}
              density={density}
              onCancel={onCancel}
              onCheckIn={onCheckIn}
            />
          ))}

          {cancelledBookings.map((booking) => (
            <div
              key={booking.id}
              className={cn(
                "rounded-md border border-dashed px-2 py-1 text-muted-foreground line-through",
                compact ? "text-xs" : "text-sm",
              )}
            >
              <span className="font-medium">{booking.customer_name}</span>
              <span className="mx-1">·</span>
              {playersLabel(booking.players)}
              <span className="mx-1">·</span>
              Cancelled
            </div>
          ))}
        </div>

        {/* Right: single primary slot action */}
        <div className="flex w-[6.5rem] shrink-0 justify-end pt-0.5">
          {slot.type === "open" && (
            <Button
              size="sm"
              className={cn("w-full", compact ? "h-8" : "h-9")}
              onClick={() => onBook(slot.time)}
            >
              Book
            </Button>
          )}
          {slot.type === "partial" && (
            <Button
              size="sm"
              variant="secondary"
              className={cn("w-full", compact ? "h-8" : "h-9")}
              onClick={() => onAddPlayers(slot.time, slot.spotsRemaining)}
            >
              Add Players
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminTeeSheet({
  slots,
  allBookings,
  showCancelled,
  density = "compact",
  onBook,
  onAddPlayers,
  onCancel,
  onCheckIn,
}: {
  slots: TeeSheetSlot[];
  allBookings: Booking[];
  showCancelled: boolean;
  density?: TeeSheetDensity;
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
    <div className={cn(density === "compact" ? "space-y-1" : "space-y-2")}>
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
            density={density}
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

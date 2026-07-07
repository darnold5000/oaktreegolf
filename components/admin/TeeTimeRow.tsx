"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TeeSheetSlot } from "@/lib/types/database";

function sourceLabel(source?: string): string {
  if (!source) return "";
  return source.replace("_", " ");
}

export function TeeTimeRow({
  slot,
  onBook,
  onEdit,
  onCancel,
  onCheckIn,
}: {
  slot: TeeSheetSlot;
  onBook?: (time: string) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onCheckIn?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-[100px] items-center gap-3">
        <span className="text-lg font-semibold tabular-nums">{slot.label}</span>
        {slot.type === "open" && <Badge variant="outline">Open</Badge>}
        {slot.type === "blocked" && <Badge variant="secondary">Blocked</Badge>}
        {slot.type === "booking" && <Badge>Booked</Badge>}
      </div>

      <div className="flex-1 text-sm">
        {slot.type === "booking" && slot.booking && (
          <>
            <p className="font-medium">
              {slot.booking.customer_name} · {slot.booking.players} players
            </p>
            <p className="text-muted-foreground capitalize">
              {sourceLabel(slot.booking.source)} · {slot.booking.status.replace("_", " ")}
            </p>
            {slot.booking.notes && (
              <p className="mt-1 text-muted-foreground italic">{slot.booking.notes}</p>
            )}
          </>
        )}
        {slot.type === "blocked" && slot.block && (
          <>
            <p className="font-medium">{slot.block.reason}</p>
            {slot.block.public_note && (
              <p className="text-muted-foreground">{slot.block.public_note}</p>
            )}
          </>
        )}
        {slot.type === "open" && <p className="text-muted-foreground">Available</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {slot.type === "open" && onBook && (
          <Button size="lg" onClick={() => onBook(slot.time)}>
            Book
          </Button>
        )}
        {slot.type === "booking" && slot.booking && (
          <>
            {slot.booking.status === "reserved" && onCheckIn && (
              <Button size="lg" variant="secondary" onClick={() => onCheckIn(slot.booking!.id)}>
                Check In
              </Button>
            )}
            {onEdit && (
              <Button size="lg" variant="outline" asChild>
                <Link href={`/admin/bookings/${slot.booking.id}/edit`}>Edit</Link>
              </Button>
            )}
            {onCancel && slot.booking.status !== "cancelled" && (
              <Button size="lg" variant="destructive" onClick={() => onCancel(slot.booking!.id)}>
                Cancel
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function AdminTeeSheet({
  slots,
  onBook,
  onCancel,
  onCheckIn,
}: {
  slots: TeeSheetSlot[];
  onBook: (time: string) => void;
  onCancel: (id: string) => void;
  onCheckIn: (id: string) => void;
}) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Course is closed or no tee times configured for this date.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <TeeTimeRow
          key={slot.time}
          slot={slot}
          onBook={onBook}
          onCancel={onCancel}
          onCheckIn={onCheckIn}
        />
      ))}
    </div>
  );
}

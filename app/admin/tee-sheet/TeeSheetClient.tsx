"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTeeSheet } from "@/components/admin/TeeTimeRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slotMatchesFilter, slotMatchesSearch } from "@/lib/availability";
import type { Booking, CourseStatus, Profile, TeeSheetFilter, TeeSheetSlot } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const FILTERS: { id: TeeSheetFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "partial", label: "Partial" },
  { id: "full", label: "Full" },
  { id: "checked_in", label: "Checked In" },
  { id: "cancelled", label: "Cancelled" },
];

export default function TeeSheetPage({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<TeeSheetSlot[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<CourseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TeeSheetFilter>("all");
  const [search, setSearch] = useState("");

  async function loadSheet(nextDate = date) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tee-sheet?date=${nextDate}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSlots(data.slots ?? []);
      setAllBookings(data.bookings ?? []);
      setStatus(data.status ?? null);
    } catch {
      toast.error("Could not load tee sheet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredSlots = useMemo(() => {
    return slots.filter(
      (slot) => slotMatchesFilter(slot, filter, allBookings) && slotMatchesSearch(slot, search, allBookings),
    );
  }, [slots, filter, search, allBookings]);

  async function handleCancel(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not cancel booking.");
      return;
    }
    toast.success("Booking cancelled.");
    loadSheet();
  }

  async function handleCheckIn(id: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "checked_in" }),
    });
    if (!res.ok) {
      toast.error("Could not check in.");
      return;
    }
    toast.success("Checked in.");
    loadSheet();
  }

  function goNewBooking(time: string, addPlayers = false, spotsRemaining?: number) {
    const params = new URLSearchParams({ date, time });
    if (addPlayers) {
      params.set("add", "1");
      if (spotsRemaining !== undefined) {
        params.set("remaining", String(spotsRemaining));
      }
    }
    router.push(`/admin/bookings/new?${params.toString()}`);
  }

  return (
    <AdminShell profile={profile}>
      <div className="sticky top-[7.5rem] z-30 -mx-4 mb-4 border-b bg-background/95 px-4 py-3 backdrop-blur sm:-mx-0 sm:rounded-lg sm:border sm:px-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="sheet-date" className="text-xs">
              Date
            </Label>
            <Input
              id="sheet-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-auto"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}>
            Today
          </Button>
          <Button size="sm" className="h-9" asChild>
            <a href={`/admin/bookings/new?date=${date}`}>Quick Add</a>
          </Button>
          <Button size="sm" variant="secondary" className="h-9" asChild>
            <a href={`/admin/blocks?date=${date}`}>Block Time</a>
          </Button>
          <div className="min-w-[12rem] flex-1 space-y-1">
            <Label htmlFor="sheet-search" className="text-xs">
              Search
            </Label>
            <Input
              id="sheet-search"
              placeholder="Name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "default" : "outline"}
              className={cn("h-8", filter === f.id && "pointer-events-none")}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {status && (
        <div className="mb-4 rounded-lg border bg-card px-3 py-2 text-sm">
          <span className="font-medium">Course:</span> {status.course_status}
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="font-medium">Range:</span> {status.range_status}
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="font-medium">Carts:</span> {status.cart_status}
          {status.announcement ? (
            <p className="mt-1 text-muted-foreground">{status.announcement}</p>
          ) : null}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading tee sheet...</p>
      ) : filteredSlots.length === 0 ? (
        <p className="text-muted-foreground">No tee times match this filter.</p>
      ) : (
        <AdminTeeSheet
          slots={filteredSlots}
          allBookings={allBookings}
          showCancelled={filter === "cancelled" || filter === "all"}
          onBook={(time) => goNewBooking(time)}
          onAddPlayers={(time, spots) => goNewBooking(time, true, spots)}
          onCancel={handleCancel}
          onCheckIn={handleCheckIn}
        />
      )}
    </AdminShell>
  );
}

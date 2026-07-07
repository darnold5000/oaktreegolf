"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTeeSheet, type TeeSheetDensity } from "@/components/admin/TeeTimeRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slotMatchesFilter, slotMatchesSearch } from "@/lib/availability";
import type { Booking, CourseSettings, CourseStatus, Profile, TeeSheetFilter, TeeSheetSlot } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const FILTERS: { id: TeeSheetFilter; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "empty", label: "Empty" },
  { id: "partial", label: "Partial" },
  { id: "full", label: "Full" },
  { id: "checked_in", label: "Checked In" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

const DENSITY_STORAGE_KEY = "oak-tree-tee-sheet-density";

function loadDensity(): TeeSheetDensity {
  if (typeof window === "undefined") return "compact";
  const stored = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return stored === "comfortable" ? "comfortable" : "compact";
}

export default function TeeSheetPage({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<TeeSheetSlot[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<CourseSettings | null>(null);
  const [status, setStatus] = useState<CourseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TeeSheetFilter>("available");
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<TeeSheetDensity>("compact");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setDensity(loadDensity());
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  function handleDensityChange(next: TeeSheetDensity) {
    setDensity(next);
    window.localStorage.setItem(DENSITY_STORAGE_KEY, next);
  }

  async function loadSheet(nextDate = date) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tee-sheet?date=${nextDate}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSlots(data.slots ?? []);
      setAllBookings(data.bookings ?? []);
      setSettings(data.settings ?? null);
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
    const filterContext =
      settings && filter === "available"
        ? { sheetDate: date, timezone: settings.timezone, now }
        : undefined;

    return slots.filter(
      (slot) =>
        slotMatchesFilter(slot, filter, allBookings, filterContext) &&
        slotMatchesSearch(slot, search, allBookings),
    );
  }, [slots, filter, search, allBookings, settings, date, now]);

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
          <div className="space-y-1">
            <Label className="text-xs">View</Label>
            <div className="flex rounded-md border p-0.5">
              <Button
                type="button"
                size="sm"
                variant={density === "compact" ? "default" : "ghost"}
                className="h-8 rounded-sm px-3"
                onClick={() => handleDensityChange("compact")}
              >
                Compact
              </Button>
              <Button
                type="button"
                size="sm"
                variant={density === "comfortable" ? "default" : "ghost"}
                className="h-8 rounded-sm px-3"
                onClick={() => handleDensityChange("comfortable")}
              >
                Comfortable
              </Button>
            </div>
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
          density={density}
          onBook={(time) => goNewBooking(time)}
          onAddPlayers={(time, spots) => goNewBooking(time, true, spots)}
          onCancel={handleCancel}
          onCheckIn={handleCheckIn}
        />
      )}
    </AdminShell>
  );
}

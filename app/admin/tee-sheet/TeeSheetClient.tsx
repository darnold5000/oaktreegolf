"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTeeSheet } from "@/components/admin/TeeTimeRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CourseStatus, Profile, TeeSheetSlot } from "@/lib/types/database";

export default function TeeSheetPage({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<TeeSheetSlot[]>([]);
  const [status, setStatus] = useState<CourseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSheet(nextDate = date) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tee-sheet?date=${nextDate}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSlots(data.slots ?? []);
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

  return (
    <AdminShell profile={profile}>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="sheet-date">Date</Label>
          <Input
            id="sheet-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        </div>
        <Button variant="outline" onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}>
          Today
        </Button>
        <Button asChild>
          <a href={`/admin/bookings/new?date=${date}`}>Quick Add Booking</a>
        </Button>
        <Button asChild variant="secondary">
          <a href={`/admin/blocks?date=${date}`}>Block Time</a>
        </Button>
      </div>

      {status && (
        <div className="mb-6 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Course Status</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium">
            <span>Course: {status.course_status}</span>
            <span>Range: {status.range_status}</span>
            <span>Carts: {status.cart_status}</span>
          </div>
          {status.announcement && (
            <p className="mt-2 text-sm text-muted-foreground">{status.announcement}</p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading tee sheet...</p>
      ) : (
        <AdminTeeSheet
          slots={slots}
          onBook={(time) => router.push(`/admin/bookings/new?date=${date}&time=${time}`)}
          onCancel={handleCancel}
          onCheckIn={handleCheckIn}
        />
      )}
    </AdminShell>
  );
}

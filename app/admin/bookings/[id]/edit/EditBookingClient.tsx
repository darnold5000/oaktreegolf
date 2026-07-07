"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking, Profile } from "@/lib/types/database";

export default function EditBookingClient({
  profile,
  bookingId,
}: {
  profile: Profile;
  bookingId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    booking_date: "",
    tee_time: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    players: "4",
    cart_preference: "unknown",
    source: "phone",
    status: "reserved",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/bookings/${bookingId}`);
      const data = await res.json();
      if (data.booking) {
        const b = data.booking as Booking;
        setForm({
          booking_date: b.booking_date,
          tee_time: b.tee_time,
          customer_name: b.customer_name,
          customer_phone: b.customer_phone ?? "",
          customer_email: b.customer_email ?? "",
          players: String(b.players),
          cart_preference: b.cart_preference,
          source: b.source,
          status: b.status,
          notes: b.notes ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [bookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        players: parseInt(form.players, 10),
        customer_email: form.customer_email || null,
        customer_phone: form.customer_phone || null,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Could not update booking.");
      return;
    }

    toast.success("Booking updated.");
    router.push("/admin/tee-sheet");
  }

  if (loading) {
    return (
      <AdminShell profile={profile}>
        <p className="text-muted-foreground">Loading...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell profile={profile}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Edit Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.booking_date}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tee Time</Label>
                <Input
                  type="time"
                  value={form.tee_time.slice(0, 5)}
                  onChange={(e) => setForm({ ...form, tee_time: `${e.target.value}:00` })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Players</Label>
                <Select value={form.players} onValueChange={(v) => v && setForm({ ...form, players: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => v && setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

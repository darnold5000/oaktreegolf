"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
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
import type { Profile } from "@/lib/types/database";

export default function NewBookingClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams.get("add") === "1";
  const remainingSpots = parseInt(searchParams.get("remaining") ?? "4", 10);
  const maxPlayers = Math.min(4, Math.max(1, remainingSpots));

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    booking_date: searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd"),
    tee_time: searchParams.get("time") ?? "07:00:00",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    players: String(Math.min(4, maxPlayers)),
    cart_preference: "unknown",
    source: isAddMode ? "walk_in" : "phone",
    notes: "",
  });

  const playerOptions = useMemo(
    () => Array.from({ length: maxPlayers }, (_, i) => i + 1),
    [maxPlayers],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        players: parseInt(form.players, 10),
        customer_email: form.customer_email || null,
        customer_phone: form.customer_phone || null,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not create booking.");
      return;
    }

    toast.success("Booking created.");
    router.push("/admin/tee-sheet");
  }

  return (
    <AdminShell profile={profile}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {isAddMode ? "Add Players to Tee Time" : "New Booking"}
          </CardTitle>
          {isAddMode && (
            <p className="text-sm text-muted-foreground">
              {form.booking_date} at {form.tee_time.slice(0, 5)} — up to {maxPlayers} spot
              {maxPlayers === 1 ? "" : "s"} available
            </p>
          )}
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
                    {playerOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cart/Walk</Label>
                <Select
                  value={form.cart_preference}
                  onValueChange={(v) => v && setForm({ ...form, cart_preference: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="cart">Cart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => v && setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
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
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : isAddMode ? "Add Booking" : "Create Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}

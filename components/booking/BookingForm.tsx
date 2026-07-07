"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { AvailableTeeTimes } from "@/components/booking/AvailableTeeTimes";
import { BookingSuccess } from "@/components/booking/AvailableTeeTimes";
import type { AvailabilityEmptyReason } from "@/lib/availability";
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

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");
  const initialTime = searchParams.get("time") ?? "";
  const initialPlayers = searchParams.get("players") ?? "4";

  const [step, setStep] = useState<"select" | "details" | "success">("select");
  const [date, setDate] = useState(initialDate);
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [slots, setSlots] = useState<{ time: string; label: string; spotsRemaining?: number }[]>([]);
  const [emptyReason, setEmptyReason] = useState<AvailabilityEmptyReason | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<{
    customer_name: string;
    booking_date: string;
    tee_time: string;
    players: number;
  } | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    cart_preference: "unknown",
    notes: "",
  });

  async function loadSlots(nextDate = date, nextPlayers = players) {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${nextDate}&players=${nextPlayers}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
      setEmptyReason(data.emptyReason ?? null);
    } catch {
      setSlots([]);
      toast.error("Could not load availability.");
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleContinue() {
    if (!selectedTime) {
      toast.error("Please select a tee time.");
      return;
    }
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_date: date,
          tee_time: selectedTime,
          players: parseInt(players, 10),
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Booking failed.");
        if (data.suggestedSlots) {
          setStep("select");
          setSlots(data.suggestedSlots);
          setSelectedTime("");
        }
        return;
      }

      setSuccessBooking(data.booking);
      setStep("success");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "success" && successBooking) {
    return <BookingSuccess booking={successBooking} />;
  }

  return (
    <div className="space-y-6">
      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Select Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  max={format(addDays(new Date(), 14), "yyyy-MM-dd")}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedTime("");
                    loadSlots(e.target.value, players);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Players</Label>
                <Select
                  value={players}
                  onValueChange={(v) => {
                    if (!v) return;
                    setPlayers(v);
                    setSelectedTime("");
                    loadSlots(date, v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "player" : "players"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AvailableTeeTimes
              slots={slots}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
              loading={loadingSlots}
              emptyReason={emptyReason}
            />

            <Button className="w-full" size="lg" onClick={handleContinue} disabled={!selectedTime}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "details" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Your Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              {date} at {selectedTime.slice(0, 5)} · {players} players
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.customer_email}
                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Walking or Cart</Label>
                <Select
                  value={form.cart_preference}
                  onValueChange={(v) => v && setForm({ ...form, cart_preference: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">No preference</SelectItem>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="cart">Cart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Special Requests</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Payment is due at the course. No payment is collected online.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("select")}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Booking..." : "Confirm Reservation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

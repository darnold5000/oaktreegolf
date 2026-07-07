"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function BookingWidget() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [players, setPlayers] = useState("4");
  const [slots, setSlots] = useState<{ time: string; label: string; spotsRemaining?: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability?date=${date}&players=${players}`);
        const data = await res.json();
        setSlots((data.slots ?? []).slice(0, 6));
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date, players]);

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Book Your Tee Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="booking-date">Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="booking-date"
                type="date"
                value={date}
                min={format(new Date(), "yyyy-MM-dd")}
                max={format(addDays(new Date(), 14), "yyyy-MM-dd")}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-players">Players</Label>
            <Select value={players} onValueChange={(v) => v && setPlayers(v)}>
              <SelectTrigger id="booking-players">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
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

        <div>
          <p className="mb-2 text-sm font-medium">Next available times</p>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading availability...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No times available. Call the pro shop.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <Button key={slot.time} asChild variant="outline" size="sm" className="h-auto flex-col py-2">
                  <Link href={`/book?date=${date}&time=${slot.time}&players=${players}`}>
                    <span>{slot.label.split(" — ")[0]}</span>
                    {slot.spotsRemaining !== undefined && (
                      <span className="text-xs font-normal opacity-80">
                        {slot.spotsRemaining} left
                      </span>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>

        <Button asChild className="w-full" size="lg">
          <Link href={`/book?date=${date}&players=${players}`}>View All Available Times</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

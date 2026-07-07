"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { BLOCK_REASONS } from "@/lib/constants";
import type { BlockedTime, Profile } from "@/lib/types/database";

function BlocksContent({ profile }: { profile: Profile }) {
  const searchParams = useSearchParams();
  const [date, setDate] = useState(searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd"));
  const [blocks, setBlocks] = useState<BlockedTime[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    start_time: "07:00:00",
    end_time: "08:00:00",
    reason: BLOCK_REASONS[0] as string,
    public_note: "",
    internal_note: "",
  });

  async function loadBlocks(nextDate = date) {
    const res = await fetch(`/api/admin/blocked-times?date=${nextDate}`);
    const data = await res.json();
    setBlocks(data.blocks ?? []);
  }

  useEffect(() => {
    loadBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/admin/blocked-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ block_date: date, ...form }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Could not create block.");
      return;
    }

    toast.success("Time blocked.");
    loadBlocks();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/blocked-times/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not remove block.");
      return;
    }
    toast.success("Block removed.");
    loadBlocks();
  }

  return (
    <AdminShell profile={profile}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Block Tee Times</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={form.start_time.slice(0, 5)}
                    onChange={(e) => setForm({ ...form, start_time: `${e.target.value}:00` })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={form.end_time.slice(0, 5)}
                    onChange={(e) => setForm({ ...form, end_time: `${e.target.value}:00` })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v ?? BLOCK_REASONS[0] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOCK_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Public Message (optional)</Label>
                <Textarea
                  rows={2}
                  value={form.public_note}
                  onChange={(e) => setForm({ ...form, public_note: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea
                  rows={2}
                  value={form.internal_note}
                  onChange={(e) => setForm({ ...form, internal_note: e.target.value })}
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "Saving..." : "Block Time"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blocks for {date}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocks for this date.</p>
            ) : (
              blocks.map((block) => (
                <div key={block.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{block.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {block.start_time.slice(0, 5)} – {block.end_time.slice(0, 5)}
                    </p>
                    {block.public_note && (
                      <p className="mt-1 text-sm">{block.public_note}</p>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(block.id)}>
                    Remove
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

export default function BlocksClient({ profile }: { profile: Profile }) {
  return (
    <Suspense>
      <BlocksContent profile={profile} />
    </Suspense>
  );
}

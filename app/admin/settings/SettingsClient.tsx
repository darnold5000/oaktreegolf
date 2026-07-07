"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CarFront, Clock, Flag } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusOptionPicker } from "@/components/admin/StatusOptionPicker";
import { AvailabilityBar } from "@/components/public/CourseStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CART_STATUS_OPTIONS,
  COURSE_STATUS_OPTIONS,
  RANGE_STATUS_OPTIONS,
} from "@/lib/course-status-options";
import type { Profile } from "@/lib/types/database";

export default function SettingsClient({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [settings, setSettings] = useState({
    tee_interval_minutes: 10,
    max_players_per_booking: 4,
    booking_window_days: 14,
    minimum_booking_notice_minutes: 15,
    public_booking_enabled: true,
    first_tee_time: "07:00:00",
    last_tee_time: "18:00:00",
  });
  const [status, setStatus] = useState({
    status_date: format(new Date(), "yyyy-MM-dd"),
    course_status: "Open",
    range_status: "Open",
    cart_status: "Available",
    announcement: "",
    first_available_time: "07:00:00",
  });

  useEffect(() => {
    async function load() {
      const today = format(new Date(), "yyyy-MM-dd");
      const [settingsRes, statusRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch(`/api/course-status?date=${today}`),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) setSettings(data.settings);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatus({
          status_date: data.status_date ?? today,
          course_status: data.course_status ?? "Open",
          range_status: data.range_status ?? "Open",
          cart_status: data.cart_status ?? "Available",
          announcement: data.announcement ?? "",
          first_available_time: data.first_available_time ?? "07:00:00",
        });
      }

      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save settings.");
      return;
    }
    toast.success("Settings saved.");
  }

  async function saveStatus(e: React.FormEvent) {
    e.preventDefault();
    setStatusSaving(true);
    const res = await fetch("/api/admin/course-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...status,
        announcement: status.announcement || null,
      }),
    });
    setStatusSaving(false);
    if (!res.ok) {
      toast.error("Could not save course status.");
      return;
    }
    toast.success("Course status updated.");
  }

  if (loading) {
    return (
      <AdminShell profile={profile}>
        <p className="text-muted-foreground">Loading settings...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell profile={profile}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Course Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Tee Interval (minutes)"
                  value={settings.tee_interval_minutes}
                  onChange={(v) => setSettings({ ...settings, tee_interval_minutes: v })}
                />
                <NumberField
                  label="Max Players"
                  value={settings.max_players_per_booking}
                  onChange={(v) => setSettings({ ...settings, max_players_per_booking: v })}
                />
                <NumberField
                  label="Booking Window (days)"
                  value={settings.booking_window_days}
                  onChange={(v) => setSettings({ ...settings, booking_window_days: v })}
                />
                <NumberField
                  label="Min Notice (minutes)"
                  value={settings.minimum_booking_notice_minutes}
                  onChange={(v) => setSettings({ ...settings, minimum_booking_notice_minutes: v })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Tee Time</Label>
                  <Input
                    type="time"
                    value={settings.first_tee_time.slice(0, 5)}
                    onChange={(e) => setSettings({ ...settings, first_tee_time: `${e.target.value}:00` })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Tee Time</Label>
                  <Input
                    type="time"
                    value={settings.last_tee_time.slice(0, 5)}
                    onChange={(e) => setSettings({ ...settings, last_tee_time: `${e.target.value}:00` })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.public_booking_enabled}
                  onChange={(e) => setSettings({ ...settings, public_booking_enabled: e.target.checked })}
                />
                Public booking enabled
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Homepage Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Controls the Course, Range, and Carts pills on the public homepage. Green = open, amber =
              limited rules, red = closed.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveStatus} className="space-y-5">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={status.status_date}
                  onChange={(e) => setStatus({ ...status, status_date: e.target.value })}
                />
              </div>

              <StatusOptionPicker
                label="Course"
                value={status.course_status}
                options={COURSE_STATUS_OPTIONS}
                onChange={(course_status) => setStatus({ ...status, course_status })}
              />
              <StatusOptionPicker
                label="Range"
                value={status.range_status}
                options={RANGE_STATUS_OPTIONS}
                onChange={(range_status) => setStatus({ ...status, range_status })}
              />
              <StatusOptionPicker
                label="Carts"
                value={status.cart_status}
                options={CART_STATUS_OPTIONS}
                onChange={(cart_status) => setStatus({ ...status, cart_status })}
              />

              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Homepage preview
                </p>
                <AvailabilityBar
                  items={[
                    { label: "Course", status: status.course_status, icon: Flag },
                    { label: "Range", status: status.range_status, icon: Clock },
                    { label: "Carts", status: status.cart_status, icon: CarFront },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label>First Available Time</Label>
                <Input
                  type="time"
                  value={status.first_available_time?.slice(0, 5) ?? ""}
                  onChange={(e) => setStatus({ ...status, first_available_time: `${e.target.value}:00` })}
                />
              </div>
              <div className="space-y-2">
                <Label>Homepage Announcement</Label>
                <Textarea
                  rows={3}
                  value={status.announcement}
                  onChange={(e) => setStatus({ ...status, announcement: e.target.value })}
                  placeholder="Frost delay, tournament info, etc."
                />
              </div>
              <Button type="submit" disabled={statusSaving}>
                {statusSaving ? "Saving..." : "Update Status"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} />
    </div>
  );
}

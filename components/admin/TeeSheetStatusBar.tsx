"use client";

import { useState } from "react";
import { CarFront, Clock, Flag, Globe, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { getStatusTone } from "@/components/public/CourseStatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  CART_STATUS_OPTIONS,
  COURSE_STATUS_OPTIONS,
  RANGE_STATUS_OPTIONS,
  type StatusOption,
} from "@/lib/course-status-options";
import type { CourseSettings, CourseStatus, Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface TeeSheetStatusBarProps {
  profile: Profile;
  date: string;
  status: CourseStatus;
  settings: CourseSettings;
  onStatusChange: (status: CourseStatus) => void;
  onSettingsChange?: (settings: CourseSettings) => void;
}

function EditableStatusPill({
  label,
  value,
  icon: Icon,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  options: StatusOption[];
  onSelect: (value: string) => void;
}) {
  const tone = getStatusTone(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          tone.pill,
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span>{label}</span>
        <span className="h-3 w-px bg-current/15" aria-hidden />
        <span className={cn("flex items-center gap-1.5", tone.label)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
          {value}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {options.map((option) => {
          const optionTone = getStatusTone(option.value);
          return (
            <DropdownMenuItem key={option.value} onClick={() => onSelect(option.value)}>
              <span className={cn("mr-2 h-1.5 w-1.5 rounded-full", optionTone.dot)} aria-hidden />
              <span className="flex-1">{option.label}</span>
              {option.value === value ? <span className="text-xs text-muted-foreground">✓</span> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InfoPill({
  label,
  icon: Icon,
  tone = "closed",
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "open" | "warning" | "closed";
  onClick?: () => void;
}) {
  const styles = getStatusTone(
    tone === "open" ? "Open" : tone === "warning" ? "Delayed" : "Closed",
  );
  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
        styles.pill,
        onClick && "transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
      {label}
    </Tag>
  );
}

function AnnouncementPill({
  announcement,
  onSave,
}: {
  announcement: string;
  onSave: (announcement: string | null) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(announcement);
  const [saving, setSaving] = useState(false);
  const hasAnnouncement = announcement.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft.trim() || null);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(announcement);
      }}
    >
      <PopoverTrigger
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          hasAnnouncement
            ? "border-sky-200/80 bg-sky-50 text-sky-900"
            : "border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground",
        )}
      >
        <Megaphone className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span className="truncate">
          {hasAnnouncement ? announcement : "Add announcement"}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-3">
        <p className="text-sm font-medium">Homepage announcement</p>
        <Textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Frost delay, tournament info, etc."
        />
        <div className="flex justify-end gap-2">
          {hasAnnouncement ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={async () => {
                setDraft("");
                setSaving(true);
                try {
                  await onSave(null);
                  setOpen(false);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Clear
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TeeSheetStatusBar({
  profile,
  date,
  status,
  settings,
  onStatusChange,
  onSettingsChange,
}: TeeSheetStatusBarProps) {
  const [savingField, setSavingField] = useState<string | null>(null);

  async function patchStatus(partial: Partial<CourseStatus>) {
    const field = Object.keys(partial)[0] ?? "status";
    setSavingField(field);
    try {
      const res = await fetch("/api/admin/course-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_date: date,
          course_status: status.course_status,
          range_status: status.range_status,
          cart_status: status.cart_status,
          announcement: status.announcement,
          first_available_time: status.first_available_time,
          ...partial,
        }),
      });
      if (!res.ok) {
        toast.error("Could not update status.");
        return;
      }
      const data = await res.json();
      onStatusChange(data.status);
      toast.success("Status updated.");
    } catch {
      toast.error("Could not update status.");
    } finally {
      setSavingField(null);
    }
  }

  async function togglePublicBooking() {
    if (profile.role !== "admin") return;
    setSavingField("public_booking");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_booking_enabled: !settings.public_booking_enabled }),
      });
      if (!res.ok) {
        toast.error("Could not update booking setting.");
        return;
      }
      const data = await res.json();
      onSettingsChange?.(data.settings);
      toast.success(
        data.settings.public_booking_enabled
          ? "Online booking enabled."
          : "Online booking disabled.",
      );
    } catch {
      toast.error("Could not update booking setting.");
    } finally {
      setSavingField(null);
    }
  }

  return (
    <div
      className={cn(
        "mb-4 space-y-2 rounded-xl border bg-card p-3 shadow-sm",
        savingField && "opacity-80",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <EditableStatusPill
          label="Course"
          value={status.course_status}
          icon={Flag}
          options={COURSE_STATUS_OPTIONS}
          onSelect={(course_status) => patchStatus({ course_status })}
        />
        <EditableStatusPill
          label="Range"
          value={status.range_status}
          icon={Clock}
          options={RANGE_STATUS_OPTIONS}
          onSelect={(range_status) => patchStatus({ range_status })}
        />
        <EditableStatusPill
          label="Carts"
          value={status.cart_status}
          icon={CarFront}
          options={CART_STATUS_OPTIONS}
          onSelect={(cart_status) => patchStatus({ cart_status })}
        />

        {!settings.public_booking_enabled ? (
          <InfoPill
            label="Online Booking Off"
            icon={Globe}
            tone="closed"
            onClick={profile.role === "admin" ? togglePublicBooking : undefined}
          />
        ) : null}

        <AnnouncementPill
          announcement={status.announcement ?? ""}
          onSave={(announcement) => patchStatus({ announcement })}
        />
      </div>
      <p className="text-xs text-muted-foreground">Tap a status pill to update it for {date}.</p>
    </div>
  );
}

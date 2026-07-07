import { cn } from "@/lib/utils";
import { resolveStatusTone, type StatusToneType } from "@/lib/course-status-options";

export type StatusTone = {
  pill: string;
  dot: string;
  label: string;
};

const TONE_STYLES: Record<StatusToneType, StatusTone> = {
  open: {
    pill: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
    label: "text-emerald-800",
  },
  warning: {
    pill: "border-amber-200/80 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    label: "text-amber-900",
  },
  closed: {
    pill: "border-red-200/80 bg-red-50 text-red-900",
    dot: "bg-red-500",
    label: "text-red-800",
  },
};

export function getStatusTone(status: string): StatusTone {
  return TONE_STYLES[resolveStatusTone(status)];
}

interface StatusPillProps {
  label: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function StatusPill({ label, status, icon: Icon, className }: StatusPillProps) {
  const tone = getStatusTone(status);

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium sm:text-[11px]",
        tone.pill,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-80" />
      <span className="truncate">{label}</span>
      <span className="h-2.5 w-px shrink-0 bg-current/15" aria-hidden />
      <span className={cn("flex min-w-0 items-center gap-1 truncate", tone.label)}>
        <span className={cn("h-1 w-1 shrink-0 rounded-full", tone.dot)} aria-hidden />
        <span className="truncate">{status}</span>
      </span>
    </div>
  );
}

interface CourseStatusBadgeProps {
  label: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function CourseStatusBadge({ label, status, icon: Icon }: CourseStatusBadgeProps) {
  const tone = getStatusTone(status);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            tone.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
          <span className={tone.label}>{status}</span>
        </div>
      </div>
    </div>
  );
}

interface AvailabilityBarProps {
  items: {
    label: string;
    status: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  className?: string;
}

export function AvailabilityBar({ items, className }: AvailabilityBarProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-center rounded-xl border border-border/60 bg-card px-2.5 py-2 shadow-sm",
        className,
      )}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Course & Range
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <StatusPill key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

export function StatusBanner({ message }: { message: string }) {
  return (
    <div className="border-b bg-accent px-4 py-3 text-center text-sm font-medium text-accent-foreground">
      {message}
    </div>
  );
}

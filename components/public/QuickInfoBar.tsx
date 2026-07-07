import { MapPin, Phone, Clock, Flag, CarFront } from "lucide-react";
import { SITE } from "@/lib/constants";
import { AvailabilityBar } from "@/components/public/CourseStatusBadge";

interface QuickInfoBarProps {
  courseStatus?: string;
  rangeStatus?: string;
  cartStatus?: string;
  firstAvailable?: string | null;
}

export function QuickInfoBar({
  courseStatus = "Open",
  rangeStatus = "Open",
  cartStatus = "Available",
  firstAvailable,
}: QuickInfoBarProps) {
  return (
    <section className="border-b bg-muted/20">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <InfoItem icon={Phone} label="Pro Shop" value={SITE.phone} href={SITE.phoneHref} />
        <InfoItem icon={MapPin} label="Location" value="Plainfield, IN" />
        <AvailabilityBar
          items={[
            { label: "Course", status: courseStatus, icon: Flag },
            { label: "Range", status: rangeStatus, icon: Clock },
            { label: "Carts", status: cartStatus, icon: CarFront },
          ]}
        />
        <InfoItem
          icon={Clock}
          label="First Available"
          value={firstAvailable ? formatTime(firstAvailable) : "Call pro shop"}
          highlight
        />
      </div>
    </section>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div className="flex h-full items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p
          className={
            highlight
              ? "mt-0.5 truncate text-sm font-semibold text-primary"
              : "mt-0.5 truncate text-sm font-semibold"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="transition hover:opacity-85">
        {content}
      </a>
    );
  }

  return content;
}

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
      <div className="mx-auto grid max-w-7xl gap-2 px-4 py-3 sm:grid-cols-2 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-2">
          <InfoItem icon={Phone} label="Pro Shop" value={SITE.phone} href={SITE.phoneHref} />
        </div>
        <div className="lg:col-span-2">
          <InfoItem icon={MapPin} label="Location" value="Plainfield, IN" />
        </div>
        <AvailabilityBar
          className="sm:col-span-2 lg:col-span-6"
          items={[
            { label: "Course", status: courseStatus, icon: Flag },
            { label: "Range", status: rangeStatus, icon: Clock },
            { label: "Carts", status: cartStatus, icon: CarFront },
          ]}
        />
        <div className="lg:col-span-2">
          <InfoItem
            icon={Clock}
            label="First Available"
            value={firstAvailable ? formatTime(firstAvailable) : "Call pro shop"}
            highlight
          />
        </div>
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
    <div className="flex h-full items-center gap-2.5 rounded-xl border border-border/60 bg-card px-2.5 py-2 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p
          className={
            highlight
              ? "truncate text-sm font-semibold leading-tight text-primary"
              : "truncate text-sm font-semibold leading-tight"
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

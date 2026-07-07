import { MapPin, Phone, Clock, Flag, CarFront } from "lucide-react";
import { SITE } from "@/lib/constants";
import { CourseStatusBadge } from "@/components/public/CourseStatusBadge";

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
    <section className="border-b bg-card">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
        <InfoItem icon={Phone} label="Pro Shop" value={SITE.phone} href={SITE.phoneHref} />
        <InfoItem icon={MapPin} label="Location" value="Plainfield, IN" />
        <CourseStatusBadge label="Course" status={courseStatus} icon={Flag} />
        <CourseStatusBadge label="Range" status={rangeStatus} icon={Clock} />
        <CourseStatusBadge label="Carts" status={cartStatus} icon={CarFront} />
        <InfoItem
          icon={Clock}
          label="First Available"
          value={firstAvailable ? formatTime(firstAvailable) : "Call pro shop"}
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="transition hover:opacity-80">
        {content}
      </a>
    );
  }

  return content;
}

import { Badge } from "@/components/ui/badge";

interface CourseStatusBadgeProps {
  label: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function CourseStatusBadge({ label, status, icon: Icon }: CourseStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const variant =
    normalized.includes("open") || normalized.includes("available")
      ? "default"
      : normalized.includes("delay") || normalized.includes("limited")
        ? "secondary"
        : "destructive";

  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Badge variant={variant} className="mt-1">
          {status}
        </Badge>
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

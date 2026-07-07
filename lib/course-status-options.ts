export type StatusToneType = "open" | "warning" | "closed";

export interface StatusOption {
  value: string;
  label: string;
  tone: StatusToneType;
}

export const COURSE_STATUS_OPTIONS: StatusOption[] = [
  { value: "Open", label: "Open", tone: "open" },
  { value: "Closed", label: "Closed", tone: "closed" },
  { value: "Frost Delay", label: "Frost Delay", tone: "warning" },
  { value: "Delayed", label: "Delayed", tone: "warning" },
  { value: "Tournament", label: "Tournament", tone: "warning" },
];

export const RANGE_STATUS_OPTIONS: StatusOption[] = [
  { value: "Open", label: "Open", tone: "open" },
  { value: "Closed", label: "Closed", tone: "closed" },
  { value: "Limited", label: "Limited", tone: "warning" },
  { value: "Maintenance", label: "Maintenance", tone: "warning" },
];

export const CART_STATUS_OPTIONS: StatusOption[] = [
  { value: "Available", label: "Available", tone: "open" },
  { value: "Cart Path Only", label: "Cart Path Only", tone: "warning" },
  { value: "90° Rule", label: "90° Rule", tone: "warning" },
  { value: "Walking Only", label: "Walking Only", tone: "warning" },
  { value: "Not Available", label: "Not Available", tone: "closed" },
];

const ALL_OPTIONS = [...COURSE_STATUS_OPTIONS, ...RANGE_STATUS_OPTIONS, ...CART_STATUS_OPTIONS];

export function findStatusOption(value: string): StatusOption | undefined {
  return ALL_OPTIONS.find((option) => option.value.toLowerCase() === value.toLowerCase());
}

export function resolveStatusTone(value: string): StatusToneType {
  const preset = findStatusOption(value);
  if (preset) return preset.tone;

  const normalized = value.toLowerCase();
  if (normalized.includes("open") || normalized.includes("available")) return "open";
  if (
    normalized.includes("closed") ||
    normalized.includes("not available") ||
    normalized.includes("unavailable")
  ) {
    return "closed";
  }
  if (
    normalized.includes("delay") ||
    normalized.includes("limited") ||
    normalized.includes("cart path") ||
    normalized.includes("90") ||
    normalized.includes("frost") ||
    normalized.includes("walking") ||
    normalized.includes("maintenance") ||
    normalized.includes("tournament")
  ) {
    return "warning";
  }
  return "closed";
}

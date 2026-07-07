"use client";

import { cn } from "@/lib/utils";
import { getStatusTone } from "@/components/public/CourseStatusBadge";
import type { StatusOption } from "@/lib/course-status-options";
import { Label } from "@/components/ui/label";

interface StatusOptionPickerProps {
  label: string;
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
}

export function StatusOptionPicker({ label, value, options, onChange }: StatusOptionPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          const tone = getStatusTone(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                tone.pill,
                selected ? "ring-2 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} aria-hidden />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

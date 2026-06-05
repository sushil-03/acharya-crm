import { useState } from "react";
import { format, subDays, subMonths, startOfYear, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

const PRESETS: { label: string; from: () => Date; to: () => Date }[] = [
  {
    label: "Today",
    from: () => new Date(),
    to: () => new Date(),
  },
  {
    label: "Yesterday",
    from: () => subDays(new Date(), 1),
    to: () => subDays(new Date(), 1),
  },
  {
    label: "Last 7 days",
    from: () => subDays(new Date(), 6),
    to: () => new Date(),
  },
  {
    label: "Last 30 days",
    from: () => subDays(new Date(), 29),
    to: () => new Date(),
  },
  {
    label: "This month",
    from: () => startOfMonth(new Date()),
    to: () => endOfMonth(new Date()),
  },
  {
    label: "Last 3 months",
    from: () => subMonths(new Date(), 3),
    to: () => new Date(),
  },
  {
    label: "This year",
    from: () => startOfYear(new Date()),
    to: () => new Date(),
  },
];

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function formatRangeLabel(from: Date, to: Date): string {
  if (format(from, "yyyy-MM-dd") === format(to, "yyyy-MM-dd")) {
    return format(from, "MMM d, yyyy");
  }
  if (from.getFullYear() === to.getFullYear()) {
    return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;
  }
  return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<DayPickerRange>({ from: value.from, to: value.to });
  const [activePreset, setActivePreset] = useState<string>(value.label);

  function handlePreset(preset: (typeof PRESETS)[number]) {
    const from = preset.from();
    const to = preset.to();
    setPending({ from, to });
    setActivePreset(preset.label);
  }

  function handleCalendarSelect(range: DayPickerRange | undefined) {
    if (!range) return;
    setPending(range);
    setActivePreset("Custom");
  }

  function handleApply() {
    if (!pending.from || !pending.to) return;
    const label =
      activePreset === "Custom"
        ? formatRangeLabel(pending.from, pending.to)
        : activePreset;
    onChange({ from: pending.from, to: pending.to, label });
    setOpen(false);
  }

  function handleCancel() {
    setPending({ from: value.from, to: value.to });
    setActivePreset(value.label);
    setOpen(false);
  }

  const displayLabel =
    value.label === "Custom"
      ? formatRangeLabel(value.from, value.to)
      : value.label;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel();
        else setOpen(true);
      }}
    >
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-muted px-3 h-9 text-[13px] font-medium transition-colors">
          <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
          <span className="max-w-[160px] truncate">{displayLabel}</span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-0 w-auto shadow-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex">
          {/* Presets sidebar */}
          <div className="flex flex-col border-r border-border py-3 px-2 min-w-[140px]">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">
              Quick select
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                className={cn(
                  "text-left px-2 py-1.5 rounded-md text-[13px] transition-colors",
                  activePreset === preset.label
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground",
                )}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setActivePreset("Custom")}
              className={cn(
                "text-left px-2 py-1.5 rounded-md text-[13px] transition-colors mt-1",
                activePreset === "Custom"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted text-muted-foreground",
              )}
            >
              Custom range
            </button>
          </div>

          {/* Calendar + footer */}
          <div className="flex flex-col">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={pending}
              onSelect={handleCalendarSelect}
              disabled={{ after: new Date() }}
              className="p-3"
            />

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 gap-6">
              <span className="text-[12px] text-muted-foreground">
                {pending.from && pending.to
                  ? formatRangeLabel(pending.from, pending.to)
                  : pending.from
                    ? format(pending.from, "MMM d, yyyy")
                    : "Select a date range"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="h-7 px-3 rounded-md text-[12px] font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!pending.from || !pending.to}
                  className="h-7 px-3 rounded-md text-[12px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function defaultDateRange(): DateRange {
  return {
    from: subDays(new Date(), 29),
    to: new Date(),
    label: "Last 30 days",
  };
}

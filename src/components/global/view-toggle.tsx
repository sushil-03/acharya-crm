"use client";

import type * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
export type ViewToggleOption = {
  value: string;
  label?: string;
  icon?: React.ReactNode;
};

type BaseProps = {
  value: string;
  onChange: (v: string) => void;
  options?: ViewToggleOption[];
  ariaLabel?: string;
  className?: string;
  label?: string; // visually hidden on mobile for compactness
};

const defaultOptions: ViewToggleOption[] = [
  { value: "list", label: "List" },
  { value: "table", label: "Table" },
];

// Desktop segmented control — uses Button with animated active thumb
function DesktopSegmented({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: Required<Pick<BaseProps, "value" | "onChange">> &
  Omit<BaseProps, "value" | "onChange" | "label">) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "bg-background relative inline-flex flex-shrink-0 overflow-hidden rounded-sm border p-0.5",
        className,
      )}
    >
      {options?.map((opt) => {
        const selected = opt.value === value;
        return (
          <Button
            key={opt.value}
            role="tab"
            aria-selected={selected}
            type="button"
            size="sm"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex items-center gap-1 rounded-none px-3 py-1.5 text-sm",
              selected
                ? "text-primary bg-primary/10 hover:bg-primary/10 rounded-sm"
                : "text-muted-foreground bg-background hover:bg-primary/5",
            )}
          >
            {selected ? <div className="bg-primary/10 absolute inset-0 -z-10 rounded-md" /> : null}
            {opt.icon ? <span aria-hidden>{opt.icon}</span> : null}
            {!opt.icon && <span className="block md:hidden">{opt.label}</span>}
            <span className="hidden md:block">{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

// Public API
export function ViewToggle({
  value,
  onChange,
  options = defaultOptions,
  ariaLabel = "Toggle view",
  className,
  label,
}: BaseProps) {
  const isMobile = useIsMobile();
  return (
    <DesktopSegmented
      value={value}
      onChange={onChange}
      options={options}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
  //   <MobileToggle
  //     value={value}
  //     onChange={onChange}
  //     options={options}
  //     ariaLabel={ariaLabel}
  //     label={label}
  //     className={className}
  //   />
  // ) : (
  // <DesktopSegmented
  //   value={value}
  //   onChange={onChange}
  //   options={options}
  //   ariaLabel={ariaLabel}
  //   className={className}
  // />
  // )
}

export default ViewToggle;

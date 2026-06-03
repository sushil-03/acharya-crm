"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker, type DropdownProps } from "react-day-picker";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout,
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={formatters}
      classNames={{
        root: cn("w-fit"),
        months: "flex gap-4 flex-col md:flex-row relative",
        month: "flex flex-col w-full gap-4 relative",
        nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between pointer-events-none z-40",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 aria-disabled:opacity-50 p-0 select-none pointer-events-auto",
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 aria-disabled:opacity-50 p-0 select-none pointer-events-auto",
        ),
        month_caption: "flex items-center justify-center h-7 w-full relative",
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "dropdown" ||
            captionLayout === "dropdown-months" ||
            captionLayout === "dropdown-years"
            ? "flex items-center justify-center gap-1 text-[0px]"
            : "text-sm",
        ),
        dropdowns: "w-full flex items-center text-sm font-medium justify-center h-7 gap-1.5",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] select-none",
        week: "flex w-full mt-2",
        day: cn(
          "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          props.showWeekNumber
            ? '[&:nth-child(2)[aria-selected="true"]_button]:rounded-l-md'
            : '[&:first-child[aria-selected="true"]_button]:rounded-l-md',
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, options }: DropdownProps) => {
          const selected = options?.find((option) => option.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="hover:bg-accent hover:text-accent-foreground h-7 w-fit min-w-[70px] gap-1 border-none bg-transparent pr-1.5 text-sm font-medium shadow-none focus:ring-0">
                <SelectValue>{selected?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="z-[250]! max-h-80">
                {options?.map((option, id) => (
                  <SelectItem
                    key={`${option.value}-${id}`}
                    value={option.value?.toString() ?? ""}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        Chevron: ({ orientation, ...props }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown;
          return <Icon className="size-4" {...props} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };

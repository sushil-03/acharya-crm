"use client";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DatePickerWithYearFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  minTime?: Date;
  maxDate?: Date;
  className?: string;
  includeTime?: boolean;
  isLoading?: boolean;
  showErrorBadge?: boolean;
  triggerDisabled?: boolean;
  labelClassName?: string;
  startYear?: number;
  endYear?: number;
}

export function DatePickerWithYearField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  isLoading,
  placeholder = "Pick a date",
  disabled,
  minDate,
  minTime,
  className,
  maxDate,
  includeTime,
  showErrorBadge = true,
  triggerDisabled,
  labelClassName,
  startYear = 1900,
  endYear = new Date().getFullYear() + 10,
}: DatePickerWithYearFieldProps<TFieldValues>) {
  const [open, setOpen] = useState(false);

  // --- TIME VALIDATION HELPERS ---
  // Compare only Y/M/D (ignore time)
  function isSameCalendarDay(a?: Date | null, b?: Date | null) {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  const minHour = includeTime && minTime ? minTime.getHours() : null;
  const minMinute = includeTime && minTime ? minTime.getMinutes() : null;
  function isHourDisabled(hour12: number, isPMSelected: boolean, selectedDate?: Date | undefined) {
    if (!includeTime || !minTime) return false;
    if (!isSameCalendarDay(selectedDate, minTime)) return false;
    const hour24 = (hour12 % 12) + (isPMSelected ? 12 : 0);
    return hour24 < (minHour ?? 0);
  }

  function isMinuteDisabled(
    minute: number,
    selectedHour24: number | undefined,
    selectedDate?: Date | undefined,
  ) {
    if (!includeTime || !minTime) return false;
    if (!isSameCalendarDay(selectedDate, minTime)) return false;

    // Only restrict minutes when selected hour is the same as minHour
    if (selectedHour24 === minHour) return minute < (minMinute ?? 0);
    return false;
  }

  function isAmPmDisabled(ampm: "AM" | "PM", selectedDate?: Date | undefined) {
    if (!includeTime || !minTime) return false;
    if (!isSameCalendarDay(selectedDate, minTime)) return false;

    const minIsPM = (minHour ?? 0) >= 12;
    // If min time is in PM, then AM should be disabled for that same day only.
    if (ampm === "AM") return minIsPM;
    return false;
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-end justify-between gap-2">
            <FormLabel className={cn("text-sm", labelClassName)}>{label}</FormLabel>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              {isLoading ? (
                <div className="rounded-md border p-1">
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "flex h-8 w-full justify-start px-2! text-left font-normal",
                      !field.value && "text-muted-foreground",
                      className,
                    )}
                    disabled={triggerDisabled}
                  >
                    {field.value ? (
                      <span className="w-full">
                        {format(field.value, includeTime ? "PP p" : "PPP")}
                      </span>
                    ) : (
                      <span className="w-full">{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    {field.value && (
                      <div className="flex items-center">
                        <div
                          role="button"
                          aria-label="Clear selection"
                          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-center rounded-md"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            field.onChange(null);
                            // Trigger validation/update and ensure popover stays closed
                            field.onBlur();
                            setOpen(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </Button>
                </FormControl>
              )}
            </PopoverTrigger>
            <PopoverContent className="flex w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                defaultMonth={field.value}
                disabled={disabled}
                captionLayout="dropdown"
                startMonth={startYear ? new Date(startYear, 0) : undefined}
                endMonth={endYear ? new Date(endYear, 11) : undefined}
                onSelect={(date) => {
                  if (!date) {
                    field.onChange(undefined);
                    return;
                  }
                  // Pre if includeTime
                  if (includeTime) {
                    const existing = field.value as unknown as Date | undefined;
                    if (existing) {
                      date.setHours(existing.getHours(), existing.getMinutes(), 0, 0);
                    } else if (minTime) {
                      date.setHours(minTime.getHours(), minTime.getMinutes(), 0, 0);
                    }
                  } else {
                    setOpen(false);
                  }
                  field.onChange(date);
                }}
              />
              {includeTime && (
                <div className="border-l">
                  <div className="flex h-[280px] flex-row divide-x">
                    {/* Hours */}
                    <ScrollArea
                      className="w-auto"
                      onWheelCapture={(e) => e.stopPropagation()}
                      onTouchMoveCapture={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => {
                          const current = field.value as Date | undefined;
                          const isPM = current ? current.getHours() >= 12 : false;
                          const disabledHour = isHourDisabled(hour, isPM, current);
                          return (
                            <Button
                              key={hour}
                              size="icon"
                              variant={
                                field.value && (field.value as Date).getHours() % 12 === hour % 12
                                  ? "default"
                                  : "ghost"
                              }
                              className="aspect-square w-full shrink-0"
                              disabled={disabledHour}
                              onClick={() => {
                                if (disabledHour) return;

                                const base = current ? new Date(current) : new Date();
                                base.setHours(
                                  (hour % 12) + (isPM ? 12 : 0),
                                  base.getMinutes(),
                                  0,
                                  0,
                                );
                                field.onChange(base);
                              }}
                            >
                              {hour}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {/* Minutes */}
                    <ScrollArea
                      className="w-auto"
                      onWheelCapture={(e) => e.stopPropagation()}
                      onTouchMoveCapture={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                          const current = field.value as Date | undefined;
                          const curHour24 = current ? current.getHours() : undefined;
                          const disabledMinute = isMinuteDisabled(minute, curHour24, current);
                          return (
                            <Button
                              key={minute}
                              size="icon"
                              variant={
                                field.value && (field.value as Date).getMinutes() === minute
                                  ? "default"
                                  : "ghost"
                              }
                              className="aspect-square w-full shrink-0"
                              disabled={disabledMinute}
                              onClick={() => {
                                if (disabledMinute) return;
                                const base = current ? new Date(current) : new Date();
                                base.setMinutes(minute);
                                field.onChange(base);
                              }}
                            >
                              {minute.toString().padStart(2, "0")}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {/* AM/PM */}
                    <ScrollArea
                      className=""
                      onWheelCapture={(e) => e.stopPropagation()}
                      onTouchMoveCapture={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col p-2">
                        {(["AM", "PM"] as const).map((ampm) => {
                          const current = field.value as Date | undefined;
                          const disabledAmPm = isAmPmDisabled(ampm, current);
                          return (
                            <Button
                              key={ampm}
                              size="icon"
                              variant={
                                field.value &&
                                ((ampm === "AM" && (field.value as Date).getHours() < 12) ||
                                  (ampm === "PM" && (field.value as Date).getHours() >= 12))
                                  ? "default"
                                  : "ghost"
                              }
                              className="aspect-square w-full shrink-0"
                              disabled={disabledAmPm}
                              onClick={() => {
                                if (disabledAmPm) return;

                                const base = current ? new Date(current) : new Date();
                                const currentHours = base.getHours();
                                const is12HourFormat = currentHours % 12;

                                if (ampm === "AM" && currentHours >= 12) {
                                  base.setHours(is12HourFormat);
                                } else if (ampm === "PM" && currentHours < 12) {
                                  base.setHours(currentHours + 12);
                                }

                                field.onChange(base);
                              }}
                            >
                              {ampm}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {showErrorBadge && <FormMessage />}
        </FormItem>
      )}
    />
  );
}

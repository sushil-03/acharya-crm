"use client";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Check, ChevronsUpDown, InfoIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { ResponsiveTooltipPopover } from "@/components/global/responsive-tooltip-popover";

interface AutocompleteOption {
  value: string | number;
  label: string | React.ReactNode;
  // Optional, used for the trigger’s selected display text
  searchKeys?: string[];
  selectedLabel?: string | React.ReactNode;
}

interface AutocompleteProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  options?: AutocompleteOption[];
  placeholder: string;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
  multiple?: boolean;
  showErrorBadge?: boolean;
  info?: string;
  labelClassName?: string;
  required?: boolean;
}

export const AutocompleteField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options = [],
  placeholder,
  isLoading,
  className,
  info,
  disabled,
  emptyText = "No results found.",
  multiple = false,
  showErrorBadge = true,
  labelClassName,
  required,
}: AutocompleteProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState("$$dummy-selection-fix$$");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) => {
    const term = searchTerm.toLowerCase();
    const label =
      typeof option.label === "string"
        ? option.label.toLowerCase()
        : String(option.value).toLowerCase();
    const selectedLabel =
      typeof option.selectedLabel === "string" ? option.selectedLabel.toLowerCase() : "";
    const searchKeys = option.searchKeys || [];
    return (
      label.includes(term) ||
      selectedLabel.includes(term) ||
      String(option.value).toLowerCase().includes(term) ||
      searchKeys.some((key) => key.toLowerCase().includes(term))
    );
  });

  const displayedOptions = filteredOptions.slice(0, 200);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const singleValue = multiple ? undefined : (field.value as string | number);
        const multiValue = multiple
          ? ((Array.isArray(field.value) ? field.value : []) as (string | number)[])
          : [];
        const selectedLabels = multiple
          ? options
              .filter((o) => multiValue.includes(o.value))
              .map((o) => o.selectedLabel ?? o.label)
          : (options.find((o) => String(o.value) === String(singleValue))?.selectedLabel ??
            options.find((o) => String(o.value) === String(singleValue))?.label ??
            "");

        // const fieldValue = field.value ?? "";
        // const selectedLabel = options.find(
        //   (option) => String(option.value) === String(fieldValue)
        // )?.label;

        return (
          <FormItem>
            {label && (
              <FormLabel className={cn("flex w-fit items-center text-sm", labelClassName)}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
                {info && (
                  <ResponsiveTooltipPopover
                    content={info}
                    trigger={<InfoIcon className="text-accent-foreground size-3" />}
                  />
                )}
              </FormLabel>
            )}
            <Popover
              open={open}
              onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (newOpen) {
                  if (
                    !multiple &&
                    singleValue !== undefined &&
                    singleValue !== null &&
                    singleValue !== ""
                  ) {
                    const selectedOption = options.find(
                      (o) => String(o.value) === String(singleValue),
                    );
                    if (selectedOption) {
                      const val =
                        typeof selectedOption.selectedLabel === "string"
                          ? selectedOption.selectedLabel
                          : typeof selectedOption.label === "string"
                            ? selectedOption.label
                            : String(selectedOption.value);
                      setActiveValue(val);
                      return;
                    }
                  }
                  setActiveValue("$$dummy-selection-fix$$");
                }
              }}
              modal={false}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  {isLoading ? (
                    <div className="rounded-md border p-1">
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      aria-required={required}
                      className={cn(
                        "text-muted-foreground! flex w-full justify-between truncate bg-transparent px-2! font-normal",
                        className,
                      )}
                      disabled={disabled || isLoading}
                    >
                      <span
                        className={cn(
                          "w-full truncate text-start whitespace-nowrap",
                          (
                            multiple
                              ? (selectedLabels as string[]).length > 0
                              : (selectedLabels as string)
                          )
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {multiple
                          ? (selectedLabels as string[]).length > 0
                            ? (selectedLabels as string[]).join(", ")
                            : placeholder
                          : (selectedLabels as string) || placeholder}
                      </span>
                      <ChevronsUpDown className="text-muted-foreground hover:text-foreground ml-2 h-4 w-4 shrink-0 opacity-50" />
                      {((multiple && (selectedLabels as string[]).length > 0) ||
                        (!multiple && !!selectedLabels)) && (
                        <div className="flex items-center">
                          <div
                            role="button"
                            aria-label="Clear selection"
                            className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-center rounded-md opacity-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              field.onChange(multiple ? [] : required ? "" : undefined);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </Button>
                  )}
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className="max-h-80 w-[--radix-popover-trigger-width] max-w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMoveCapture={(e) => e.stopPropagation()}
                onMouseLeave={() => setActiveValue("$$dummy-selection-fix$$")}
                onPointerDownOutside={() => {
                  // Ensure controlled state closes when clicking outside
                  setOpen(false);
                }}
                onFocusOutside={() => {
                  // Close when focus leaves the popover (e.g., tabbing out)
                  setOpen(false);
                }}
                onEscapeKeyDown={() => {
                  // Allow closing via Escape for accessibility
                  setOpen(false);
                }}
              >
                <Command value={activeValue} onValueChange={setActiveValue} shouldFilter={false}>
                  <CommandInput
                    placeholder="Search..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList
                    className="max-h-64 overflow-y-auto"
                    onWheelCapture={(e) => e.stopPropagation()}
                    onTouchMoveCapture={(e) => e.stopPropagation()}
                  >
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup className="overflow-visible">
                      <CommandItem
                        value="$$dummy-selection-fix$$"
                        className="pointer-events-none h-0 min-h-0 w-0 min-w-0 p-0 opacity-0"
                        aria-hidden="true"
                        disabled
                      />
                      {!isLoading && filteredOptions.length === 0 ? (
                        <CommandItem
                          aria-disabled="true"
                          className="pointer-events-none opacity-50"
                        >
                          No option
                        </CommandItem>
                      ) : null}
                      {displayedOptions.map((option, index) => {
                        const isSelected = multiple
                          ? multiValue.map((v) => String(v)).includes(String(option.value))
                          : String(singleValue) === String(option.value);

                        // Use a meaningful text value for search filtering.
                        // Prefer selectedLabel (plain text) when available, otherwise label if it's a string, else fallback to value.
                        // const commandItemValue =
                        //   typeof option.selectedLabel === 'string'
                        //     ? option.selectedLabel
                        //     : typeof option.label === 'string'
                        //       ? option.label
                        //       : String(option.value)

                        return (
                          <CommandItem
                            key={index}
                            value={String(index)}
                            // value={commandItemValue}
                            className={cn(
                              "hover:bg-accent/50!",
                              isSelected ? "bg-accent text-accent-foreground" : "text-inherit!",
                            )}
                            aria-selected={isSelected}
                            onSelect={() => {
                              if (multiple) {
                                const newValue = isSelected
                                  ? multiValue.filter((v) => String(v) !== String(option.value))
                                  : [...multiValue, option.value];
                                field.onChange(newValue);
                              } else {
                                field.onChange(option.value);
                                setOpen(false);
                              }
                            }}
                          >
                            {option.label}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {showErrorBadge && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
};

export default AutocompleteField;

"use client";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  size?: "sm" | "default";
  showErrorBadge?: boolean;
  labelClassName?: string;
}

export const SelectField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options = [],
  placeholder = "Select...",
  disabled,
  className,
  isLoading,
  size = "sm",
  showErrorBadge = true,
  labelClassName,
}: SelectFieldProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentValue = field.value;
        return (
          <FormItem>
            <div className="flex items-end justify-between gap-2">
              <FormLabel className={cn("text-sm", labelClassName)}>{label}</FormLabel>
            </div>
            <FormControl>
              <Select
                value={
                  currentValue === undefined || currentValue === null ? "" : String(currentValue)
                }
                onValueChange={(val) => {
                  const matched = options.find((o) => String(o.value) === String(val));
                  field.onChange(matched ? matched.value : val);
                }}
                disabled={disabled || isLoading}
              >
                <SelectTrigger
                  className={cn("h-8 w-full min-w-0 truncate", className)}
                  size={size}
                  isLoading={isLoading}
                  disabled={disabled}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="max-h-[400px] overflow-auto">
                  {!isLoading && options.length === 0 ? (
                    <SelectItem value="__no_option__" disabled>
                      No option
                    </SelectItem>
                  ) : (
                    options.map((opt) => (
                      <SelectItem key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormControl>
            {showErrorBadge && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
};

export default SelectField;

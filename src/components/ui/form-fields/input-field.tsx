import type { Control, FieldValues, Path } from "react-hook-form";
import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InputFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  valueOverride?: string | number;
  readOnly?: boolean;
  showErrorBadge?: boolean;
  labelClassName?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export function InputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  isLoading = false,
  disabled = false,
  className = "",
  valueOverride,
  showErrorBadge = true,
  readOnly = false,
  labelClassName,
  maxLength,
  showCharCount = false,
}: InputFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-end justify-between gap-2">
            <FormLabel className={cn("text-sm", labelClassName)}>{label}</FormLabel>
            {showCharCount && maxLength ? (
              <span className="text-muted-foreground text-xs">
                {String(valueOverride ?? field.value ?? "").length}/{maxLength}
              </span>
            ) : null}
          </div>
          <FormControl>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                className={cn("h-8 placeholder:text-sm", className)}
                {...field}
                value={(valueOverride ?? field.value ?? "") as any}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const nextValue = e.target.value;
                  field.onChange(maxLength ? nextValue.slice(0, maxLength) : nextValue);
                }}
                maxLength={maxLength}
                disabled={disabled}
                readOnly={readOnly}
              />
            )}
          </FormControl>
          {showErrorBadge && <FormMessage />}
        </FormItem>
      )}
    />
  );
}

import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneInput, PhoneInputCountrySelect, PhoneInputField } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PhoneFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  showErrorBadge?: boolean;
  labelClassName?: string;
}

export function PhoneField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Enter phone number",
  isLoading = false,
  disabled = false,
  className = "",
  showErrorBadge = true,
  labelClassName,
}: PhoneFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn("text-sm", labelClassName)}>{label}</FormLabel>
          <FormControl className="mt-1">
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <PhoneInput
                value={field.value as string}
                onValueChange={field.onChange}
                defaultCountry="IN"
                className={cn("h-8.5", className)}
                disabled={disabled}
              >
                <PhoneInputCountrySelect />
                <PhoneInputField placeholder={placeholder} onBlur={field.onBlur} />
              </PhoneInput>
            )}
          </FormControl>
          {showErrorBadge && <FormMessage />}
        </FormItem>
      )}
    />
  );
}

import type { Control, FieldValues, Path } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { PasswordInput } from "../password-input";
import { ResponsiveTooltipPopover } from "@/components/global/responsive-tooltip-popover";

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  rightAction?: ReactNode;
  info?: string;
}

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  info,
  rightAction,
}: PasswordFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid gap-2">
          <div className="flex flex-wrap items-center">
            <FormLabel className="flex items-center gap-1">
              {label}
              {info && (
                <ResponsiveTooltipPopover
                  trigger={<Info className="text-muted-foreground size-3" />}
                  content={<p className="text-xs">{info}</p>}
                />
              )}
            </FormLabel>
            {rightAction}
          </div>
          <FormControl>
            <PasswordInput {...field} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

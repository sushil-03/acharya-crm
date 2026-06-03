import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          " text-destructive bg-destructive/5 border-destructive/10 [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        info: "text-primary bg-primary/5 border-primary/10 [&>svg]:text-current *:data-[slot=alert-description]:text-primary/90",
        warning:
          "text-warning bg-warning/10 dark:bg-warning/5 border-warning/10 [&>svg]:text-current *:data-[slot=alert-description]:text-warning/90",
        success:
          "text-success bg-success/5 border-success/10 [&>svg]:text-current *:data-[slot=alert-description]:text-success/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface AlertProps extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {
  closeable?: boolean;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Alert({ className, variant, closeable, onClose, children, ...props }: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
      {closeable && (
        <button
          onClick={(e) => {
            setIsVisible(false);
            onClose?.(e);
          }}
          className="ring-offset-background focus:ring-ring absolute top-2 right-2 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

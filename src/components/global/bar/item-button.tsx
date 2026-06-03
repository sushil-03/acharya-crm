import React from "react";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ItemButtonProps {
  icon: React.ReactNode;
  buttonText: string | React.ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "destructive" | "light-destructive";
  disabled?: boolean;
  type?: "default" | "coming_soon";
  className?: string;
  comingSoonText?: string;
  comingSoonBadgeText?: string;
}

const ItemButton = ({
  icon,
  buttonText,
  onClick,
  variant = "ghost",
  disabled = false,
  type = "default",
  className,
  comingSoonText = "Coming soon",
  comingSoonBadgeText = "Soon",
}: ItemButtonProps) => {
  const isComingSoon = type === "coming_soon";
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("w-full rounded-xs justify-start font-normal", className)}
      onClick={() => {
        if (disabled) return;
        if (isComingSoon) {
          toast.message(comingSoonText);
          return;
        }
        onClick?.();
      }}
      disabled={disabled}
    >
      {icon}
      {buttonText}
      {isComingSoon && (
        <Badge variant="warning-light" className="ml-auto rounded-md ">
          {comingSoonBadgeText}
        </Badge>
      )}
    </Button>
  );
};

export default ItemButton;

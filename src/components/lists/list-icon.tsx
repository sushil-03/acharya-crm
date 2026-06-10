import { cn } from "@/lib/utils";
import { getListIconComponent } from "./list-icons";

interface ListIconBadgeProps {
  name?: string | null;
  color?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: { badge: "size-5 rounded", icon: "size-3" },
  sm: { badge: "size-7 rounded-lg", icon: "size-[14px]" },
  md: { badge: "size-9 rounded-xl", icon: "size-[18px]" },
  lg: { badge: "size-11 rounded-xl", icon: "size-5" },
};

export function ListIconBadge({ name, color, size = "sm", className }: ListIconBadgeProps) {
  const Icon = getListIconComponent(name ?? undefined);
  const { badge, icon } = sizeMap[size];
  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0", badge, className)}
      style={{ backgroundColor: color ? `${color}22` : "#f3f4f6" }}
    >
      <Icon className={icon} style={{ color: color ?? "currentColor" }} />
    </span>
  );
}

import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
      <div>
        {breadcrumb && (
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-1.5">
            {breadcrumb}
          </div>
        )}
        <h1 className="font-display text-[24px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-card border border-border shadow-elev-1 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warning" | "gold" | "info";
}) {
  const accents: Record<string, string> = {
    primary: "from-primary/10 to-primary/0 text-primary",
    success: "from-success/15 to-success/0 text-success",
    warning: "from-warning/15 to-warning/0 text-warning",
    gold: "from-gold/20 to-gold/0 text-gold",
    info: "from-info/15 to-info/0 text-info",
  };
  return (
    <Card className="p-5 relative overflow-hidden group hover:shadow-elev-2 transition-shadow">
      <div
        className={`absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br ${accents[accent]} opacity-60 blur-xl pointer-events-none`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          {icon && (
            <div
              className={`size-8 rounded-lg bg-gradient-to-br ${accents[accent]} grid place-items-center`}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="font-display text-[26px] font-bold leading-none">{value}</div>
        {delta && (
          <div
            className={`mt-2 text-[12px] font-medium ${delta.startsWith("-") ? "text-danger" : "text-success"}`}
          >
            {delta} <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export function Badge({
  children,
  tone = "muted",
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
  tone?:
    | "muted"
    | "primary"
    | "primary-light"
    | "success"
    | "success-light"
    | "warning"
    | "warning-light"
    | "danger"
    | "danger-light"
    | "info"
    | "info-light"
    | "gold"
    | "gold-light";
} & React.HTMLAttributes<HTMLSpanElement>) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary dark:text-primary-foreground",
    "primary-light": "border border-primary/30 text-primary bg-primary/10",
    success: "bg-success/15 text-success dark:text-success-foreground dark:bg-success/40",
    "success-light": "border border-success/30 text-success bg-success/10 dark:bg-success/10",
    warning: "bg-warning/15 text-warning dark:text-warning-foreground dark:bg-warning/10",
    "warning-light": "border border-warning/30 text-warning bg-warning/10 dark:bg-warning/10",
    danger: "bg-danger/15 text-danger dark:text-danger-foreground dark:bg-danger/40",
    "danger-light": "border border-danger/30 text-danger bg-danger/10 dark:bg-danger/10",
    info: "bg-info/15 text-info dark:text-info-foreground dark:bg-info/30",
    "info-light": "border border-info/30 text-info bg-info/10",
    gold: "bg-gold/20 text-gold-foreground",
    "gold-light": "border border-gold/30 text-gold bg-gold/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

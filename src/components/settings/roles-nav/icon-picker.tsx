import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { Search, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ICON_SETS = [
  { id: "", label: "All" },
  { id: "lucide", label: "Lucide" },
  { id: "mdi", label: "Material" },
  { id: "tabler", label: "Tabler" },
  { id: "ph", label: "Phosphor" },
  { id: "ri", label: "Remix" },
] as const;

// Per-set defaults shown when that tab is active and no search is typed
const SET_DEFAULTS: Record<string, string[]> = {
  "": [
    "lucide:layout-dashboard","lucide:home","lucide:users","lucide:folder",
    "lucide:bar-chart-2","lucide:wallet","lucide:graduation-cap","lucide:settings",
    "lucide:mail","lucide:shield","lucide:calendar","lucide:building-2",
    "lucide:file-text","lucide:bell","lucide:trending-up","lucide:briefcase",
    "mdi:school","mdi:account-group","mdi:chart-bar","mdi:currency-inr",
    "mdi:clipboard-text","mdi:email","mdi:cog","mdi:home-city",
    "tabler:dashboard","tabler:users","tabler:chart-bar","tabler:school",
    "tabler:wallet","tabler:mail","tabler:settings","tabler:building",
    "ph:student","ph:users-three","ph:chart-bar","ph:wallet",
    "ph:graduation-cap","ph:envelope","ph:gear","ph:buildings",
    "lucide:zap","lucide:star","lucide:target","lucide:rocket",
    "lucide:list","lucide:table","lucide:database","lucide:globe",
    "lucide:phone","lucide:monitor","lucide:user-cog","lucide:award",
    "lucide:filter","lucide:search","lucide:refresh-cw","lucide:download",
    "lucide:clipboard-list","lucide:check-circle","lucide:alert-circle","lucide:tag",
    "lucide:layers","lucide:package","lucide:server","lucide:code-2",
  ],
  "lucide": [
    "lucide:layout-dashboard","lucide:home","lucide:users","lucide:user",
    "lucide:folder","lucide:folder-open","lucide:file-text","lucide:clipboard-list",
    "lucide:bar-chart-2","lucide:trending-up","lucide:pie-chart","lucide:activity",
    "lucide:wallet","lucide:credit-card","lucide:dollar-sign","lucide:banknote",
    "lucide:graduation-cap","lucide:book-open","lucide:school","lucide:library",
    "lucide:settings","lucide:settings-2","lucide:shield","lucide:shield-check",
    "lucide:mail","lucide:message-square","lucide:bell","lucide:send",
    "lucide:calendar","lucide:clock","lucide:map-pin","lucide:globe",
    "lucide:building-2","lucide:briefcase","lucide:package","lucide:layers",
    "lucide:zap","lucide:star","lucide:bookmark","lucide:tag",
    "lucide:check-circle","lucide:alert-circle","lucide:list","lucide:table",
    "lucide:database","lucide:server","lucide:code-2","lucide:terminal",
    "lucide:phone","lucide:headphones","lucide:monitor","lucide:smartphone",
    "lucide:user-cog","lucide:user-check","lucide:contact","lucide:badge",
    "lucide:target","lucide:award","lucide:trophy","lucide:rocket",
    "lucide:filter","lucide:search","lucide:refresh-cw","lucide:download",
  ],
  "mdi": [
    "mdi:home","mdi:account","mdi:account-group","mdi:account-cog",
    "mdi:folder","mdi:file-document","mdi:clipboard-text","mdi:email",
    "mdi:chart-bar","mdi:chart-line","mdi:chart-pie","mdi:trending-up",
    "mdi:wallet","mdi:credit-card","mdi:currency-usd","mdi:currency-inr",
    "mdi:school","mdi:book-open-variant","mdi:library","mdi:graduation-cap",
    "mdi:cog","mdi:shield","mdi:shield-check","mdi:lock",
    "mdi:email-outline","mdi:message","mdi:bell","mdi:send",
    "mdi:calendar","mdi:clock","mdi:map-marker","mdi:web",
    "mdi:office-building","mdi:briefcase","mdi:package-variant","mdi:layers",
    "mdi:flash","mdi:star","mdi:bookmark","mdi:tag",
    "mdi:check-circle","mdi:alert-circle","mdi:format-list-bulleted","mdi:table",
    "mdi:database","mdi:server","mdi:code-tags","mdi:console",
    "mdi:phone","mdi:headphones","mdi:monitor","mdi:cellphone",
    "mdi:account-settings","mdi:account-check","mdi:contacts","mdi:badge-account",
    "mdi:target","mdi:trophy","mdi:rocket","mdi:home-city",
    "mdi:filter","mdi:magnify","mdi:refresh","mdi:download",
  ],
  "tabler": [
    "tabler:dashboard","tabler:home","tabler:users","tabler:user",
    "tabler:folder","tabler:file-text","tabler:clipboard-list","tabler:notes",
    "tabler:chart-bar","tabler:chart-line","tabler:chart-pie","tabler:trending-up",
    "tabler:wallet","tabler:credit-card","tabler:currency-dollar","tabler:cash",
    "tabler:school","tabler:book","tabler:library","tabler:certificate",
    "tabler:settings","tabler:shield","tabler:lock","tabler:key",
    "tabler:mail","tabler:message","tabler:bell","tabler:send",
    "tabler:calendar","tabler:clock","tabler:map-pin","tabler:world",
    "tabler:building","tabler:briefcase","tabler:package","tabler:layers",
    "tabler:bolt","tabler:star","tabler:bookmark","tabler:tag",
    "tabler:circle-check","tabler:alert-circle","tabler:list","tabler:table",
    "tabler:database","tabler:server","tabler:code","tabler:terminal",
    "tabler:phone","tabler:headphones","tabler:desktop","tabler:device-mobile",
    "tabler:user-cog","tabler:user-check","tabler:address-book","tabler:id",
    "tabler:target","tabler:trophy","tabler:rocket","tabler:buildings",
    "tabler:filter","tabler:search","tabler:refresh","tabler:download",
  ],
  "ph": [
    "ph:house","ph:users","ph:user","ph:user-gear",
    "ph:folder","ph:file-text","ph:clipboard-text","ph:note",
    "ph:chart-bar","ph:chart-line","ph:chart-pie","ph:trend-up",
    "ph:wallet","ph:credit-card","ph:currency-dollar","ph:money",
    "ph:graduation-cap","ph:book-open","ph:books","ph:student",
    "ph:gear","ph:shield","ph:shield-check","ph:lock",
    "ph:envelope","ph:chat","ph:bell","ph:paper-plane",
    "ph:calendar","ph:clock","ph:map-pin","ph:globe",
    "ph:buildings","ph:briefcase","ph:package","ph:stack",
    "ph:lightning","ph:star","ph:bookmark","ph:tag",
    "ph:check-circle","ph:warning-circle","ph:list","ph:table",
    "ph:database","ph:hard-drives","ph:code","ph:terminal-window",
    "ph:phone","ph:headphones","ph:monitor","ph:device-mobile",
    "ph:users-three","ph:address-book","ph:identification-card","ph:badge",
    "ph:target","ph:trophy","ph:rocket","ph:flag",
    "ph:funnel","ph:magnifying-glass","ph:arrows-clockwise","ph:download",
  ],
  "ri": [
    "ri:home-line","ri:user-line","ri:group-line","ri:user-settings-line",
    "ri:folder-line","ri:file-text-line","ri:clipboard-line","ri:draft-line",
    "ri:bar-chart-line","ri:line-chart-line","ri:pie-chart-line","ri:arrow-up-line",
    "ri:wallet-line","ri:bank-card-line","ri:money-dollar-circle-line","ri:currency-line",
    "ri:graduation-cap-line","ri:book-open-line","ri:library-line","ri:medal-line",
    "ri:settings-line","ri:shield-line","ri:shield-check-line","ri:lock-line",
    "ri:mail-line","ri:message-line","ri:notification-line","ri:send-plane-line",
    "ri:calendar-line","ri:time-line","ri:map-pin-line","ri:global-line",
    "ri:building-line","ri:briefcase-line","ri:box-line","ri:stack-line",
    "ri:flashlight-line","ri:star-line","ri:bookmark-line","ri:price-tag-line",
    "ri:checkbox-circle-line","ri:error-warning-line","ri:list-check","ri:table-line",
    "ri:database-line","ri:server-line","ri:code-line","ri:terminal-line",
    "ri:phone-line","ri:headphone-line","ri:computer-line","ri:smartphone-line",
    "ri:user-cog-line","ri:user-follow-line","ri:contacts-line","ri:id-card-line",
    "ri:focus-line","ri:trophy-line","ri:rocket-line","ri:flag-line",
    "ri:filter-line","ri:search-line","ri:refresh-line","ri:download-line",
  ],
};

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSet, setActiveSet] = useState<string>("");
  const [results, setResults] = useState<string[]>(SET_DEFAULTS[""]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchIcons = useCallback(async (query: string, set: string) => {
    if (abortRef.current) abortRef.current.abort();

    if (!query.trim()) {
      setResults(SET_DEFAULTS[set] ?? SET_DEFAULTS[""]);
      setTotal(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({ query, limit: "120" });
      if (set) params.set("prefixes", set);
      const res = await fetch(`https://api.iconify.design/search?${params}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      setResults(data.icons ?? []);
      setTotal(data.total ?? null);
    } catch {
      // aborted — ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchIcons(search, activeSet), 250);
    return () => clearTimeout(timer);
  }, [search, activeSet, fetchIcons]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setActiveSet("");
      setResults(SET_DEFAULTS[""]);
      setTotal(null);
    }
  }, [open]);

  // Friendly display name: strip set prefix for footer
  const iconLabel = value
    ? value.includes(":") ? value.split(":")[1] : value
    : "none";

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex items-center justify-center size-14 rounded-xl border-2 transition-all duration-200",
          "hover:border-primary/60 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value
            ? "border-primary/40 bg-primary/5"
            : "border-dashed border-border bg-muted/30 hover:border-primary/40",
        )}
      >
        {value ? (
          <Icon icon={value} className="size-6 text-primary" />
        ) : (
          <Icon icon="lucide:image-plus" className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        {value && (
          <span
            role="button"
            className="absolute -top-1.5 -right-1.5 size-4 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-destructive transition-colors"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
          >
            <X className="size-2.5 text-primary-foreground" />
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[580px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-border space-y-2">
            <DialogTitle className="text-[15px]">Choose an Icon</DialogTitle>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search 200,000+ icons…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Set tabs */}
            <div className="flex items-center gap-1">
              {ICON_SETS.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => setActiveSet(set.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors",
                    activeSet === set.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {set.label}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-muted-foreground">
                {search && total !== null ? `${total.toLocaleString()} results` : "Popular"}
              </span>
            </div>
          </DialogHeader>

          {/* Grid */}
          <div className="overflow-y-auto" style={{ height: 340 }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Icon icon="lucide:loader-2" className="size-5 text-muted-foreground animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Icon icon="lucide:search-x" className="size-8 opacity-30" />
                <p className="text-sm">No icons found for "{search}"</p>
              </div>
            ) : (
              <div className="p-3 grid grid-cols-10 gap-1">
                {results.map((icon) => {
                  const isSelected = value === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      title={icon.split(":")[1] ?? icon}
                      onClick={() => { onChange(icon); setOpen(false); }}
                      className={cn(
                        "relative flex items-center justify-center rounded-lg size-10 transition-all duration-150",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm scale-110"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground hover:scale-105",
                      )}
                    >
                      <Icon icon={icon} className="size-5" />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 size-3.5 bg-primary border-2 border-background rounded-full flex items-center justify-center">
                          <Check className="size-2 text-primary-foreground" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-3 flex items-center gap-3 bg-muted/30">
            <div className="flex items-center justify-center size-8 rounded-lg border bg-background shrink-0">
              <Icon icon={value || "lucide:layout-grid"} className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Selected</p>
              <p className="text-[12px] font-medium truncate">{iconLabel}</p>
            </div>
            {value && (
              <button type="button" onClick={() => onChange("")}
                className="text-[12px] text-muted-foreground hover:text-destructive transition-colors shrink-0">
                Clear
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

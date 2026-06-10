import * as React from "react";
import { Search, ChevronDown, X, User, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { useGetLeads } from "@/components/leads/hook/query/use-get-leads";
import { useGetApplications } from "@/components/application/hook/query/use-get-applications";
import { useGetCounsellors } from "@/components/global/hooks/use-get-counsellor";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LOCAL_STORAGE_KEY } from "@/lib/config";
import { Badge } from "@/components/ui-kit";
import { getLeadStatusTone, getApplicationStatusTone } from "@/lib/constant";

type SearchType = "Leads" | "Applications";

interface GlobalSearchProps {
  isCollapsed?: boolean;
}

export function GlobalSearch({ isCollapsed = false }: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchType, setSearchType] = React.useState<SearchType>("Leads");
  const [query, setQuery] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  // Recent searches keywords state
  const [recentKeywords, setRecentKeywords] = React.useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY.RECENT_KEYWORDS);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [recentLeads, setRecentLeads] = React.useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY.RECENT_LEADS);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [recentApplications, setRecentApplications] = React.useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY.RECENT_APPLICATIONS);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Track removed item IDs for the current session (soft delete from recent list)
  const [removedIds, setRemovedIds] = React.useState<string[]>([]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced search query state
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Persist recent keywords
  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY.RECENT_KEYWORDS, JSON.stringify(recentKeywords));
  }, [recentKeywords]);

  // Persist recent leads
  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY.RECENT_LEADS, JSON.stringify(recentLeads));
  }, [recentLeads]);

  // Persist recent applications
  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY.RECENT_APPLICATIONS, JSON.stringify(recentApplications));
  }, [recentApplications]);

  // Call counsellors query hook to resolve counsellor names
  const { data: counsellors } = useGetCounsellors();

  // Call leads query hook
  const { data: leadsData, isLoading: isLoadingLeads } = useGetLeads({
    search: debouncedQuery.trim() || undefined,
    page: 1,
    pageSize: 10,
  });

  // Call applications query hook
  const { data: appsData, isLoading: isLoadingApps } = useGetApplications({
    search: debouncedQuery.trim() || undefined,
  });

  // Helper to resolve counsellor name from assignments array
  const getCounsellorName = React.useCallback(
    (assignments: any[]) => {
      if (!assignments || assignments.length === 0) return "Unassigned";
      const activeAssignment = assignments.find((a: any) => a.isActive);
      const id = activeAssignment
        ? activeAssignment.counsellorId || activeAssignment.id
        : assignments[0].counsellorId;
      if (!id) return "Unassigned";
      return counsellors?.find((c) => c.id === id)?.name || "Unassigned";
    },
    [counsellors],
  );

  // Keyboard shortcut listener to open search modal (⌘K / Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Clear selected item if we switch search type
  React.useEffect(() => {
    setSelectedItem(null);
  }, [searchType]);

  // Handle keyword selection
  const handleKeywordClick = (keyword: string) => {
    setQuery(keyword);
    inputRef.current?.focus();
  };

  // Handle Enter key in input to add to recent keywords
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      if (!recentKeywords.includes(query.trim())) {
        setRecentKeywords((prev) => [query.trim(), ...prev.slice(0, 4)]);
      }
    }
  };

  // Get active raw results based on the search query and selected search type
  const rawResults = React.useMemo(() => {
    if (!query.trim()) {
      return searchType === "Leads" ? recentLeads : recentApplications;
    }
    return searchType === "Leads" ? leadsData?.data || [] : appsData || [];
  }, [query, searchType, recentLeads, recentApplications, leadsData, appsData]);

  // Normalize results for the UI list and preview details panel
  const results = React.useMemo(() => {
    const activeResults = rawResults.filter((item: any) => !removedIds.includes(item.id));

    return activeResults.map((item: any) => {
      if (searchType === "Leads") {
        const score = item.leadScore ?? item.score ?? 0;
        const intent = score > 75 ? "Hot" : score > 55 ? "Warm" : "Cold";
        const counsellor = getCounsellorName(item.assignments) || item.counsellor || "Unassigned";
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.mobile || item.phone || "",
          program: item.courseInterest || item.program || "",
          campus: item.campusInterest || item.campusId || item.campus || "",
          city: item.city || "",
          country: item.country || "India",
          score,
          intent,
          counsellor,
          status: item.status || item.stage || "",
          stage: item.status || item.stage || "",
          source: item.sourceChannel || item.source || "N/A",
          createdAt: item.createdAt,
          _raw: item,
        };
      } else {
        const studentName = item.student?.firstName
          ? `${item.student.firstName} ${item.student.lastName}`
          : item.student || "";
        const programName = item.program?.name || item.program || "";
        const fee = item.offers?.[0]
          ? parseFloat(item.offers[0].netFeePayable || item.offers[0].totalFee || "0")
          : item.fee || 0;
        const submitted = item.submittedAt
          ? new Date(item.submittedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : item.submitted || "";
        return {
          id: item.id,
          student: studentName,
          email: item.student?.email || "",
          program: programName,
          campus: item.campusId || item.campus || "",
          progress: item.completionPercent ?? item.progress ?? 0,
          status: item.status || "",
          fee,
          submitted,
          _raw: item,
        };
      }
    });
  }, [rawResults, removedIds, searchType, getCounsellorName]);

  const isLoading = !!query.trim() && (searchType === "Leads" ? isLoadingLeads : isLoadingApps);

  const handleSelectResult = (item: any) => {
    setSelectedItem(item);
    if (searchType === "Leads") {
      setRecentLeads((prev) => {
        const rawItem = item._raw || item;
        const filtered = prev.filter((l) => l.id !== rawItem.id);
        return [rawItem, ...filtered].slice(0, 5);
      });
    } else {
      setRecentApplications((prev) => {
        const rawItem = item._raw || item;
        const filtered = prev.filter((app) => app.id !== rawItem.id);
        return [rawItem, ...filtered].slice(0, 5);
      });
    }
  };

  const handleRemoveResult = (itemId: string) => {
    setRemovedIds((prev) => [...prev, itemId]);
    if (selectedItem?.id === itemId) setSelectedItem(null);
    if (!query.trim()) {
      if (searchType === "Leads") {
        setRecentLeads((prev) => prev.filter((l) => l.id !== itemId));
      } else {
        setRecentApplications((prev) => prev.filter((app) => app.id !== itemId));
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelectedItem(null);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Search Trigger Button */}
      {isCollapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setOpen(true)}
                className="group flex items-center justify-center rounded-lg size-9 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer mx-auto"
              >
                <Search className="size-4.5 transition-transform duration-200 group-hover:scale-105" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-medium">Search (⌘K)</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 rounded-lg border border-border bg-muted/40 hover:bg-muted px-3 h-9 text-[13px] text-muted-foreground transition-all cursor-pointer select-none"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search ...</span>
          <kbd className="ml-auto rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-mono select-none">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Search Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[780px] p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl [&>button]:hidden rounded-xl">
          {/* Header Search Input Bar */}
          <div className="flex items-center gap-2 border-b border-border/80 px-4 h-12 text-[13px]">
            {/* Search Type Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 font-semibold text-foreground hover:text-foreground/80 outline-none select-none cursor-pointer">
                  <span className="min-w-[45px] text-left">{searchType}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem
                  className="cursor-pointer font-medium"
                  onClick={() => setSearchType("Leads")}
                >
                  Leads
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer font-medium"
                  onClick={() => setSearchType("Applications")}
                >
                  Applications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Separator line */}
            <div className="w-px h-4 bg-border/80 shrink-0 mx-1" />

            {/* Search Icon */}
            <Search className="size-4 text-muted-foreground shrink-0" />

            {/* Input Text Box */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type To Search"
              className="flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground/75 text-sm h-full text-foreground"
              autoFocus
            />

            {/* Actions (Clear / Close Modal) */}
            <div className="flex items-center gap-2">
              {query && (
                <button
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded hover:bg-muted cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lower Content Area (Keywords, Results, and Quick View) */}
          <div className="flex divide-x divide-border bg-popover h-[460px]">
            {/* Left Side: Recent Searches Keywords and Search Results */}
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto min-w-[480px]">
              {/* Recent Searches Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Recent Searches Keywords
                  </span>
                  {recentKeywords.length > 0 && (
                    <button
                      onClick={() => setRecentKeywords([])}
                      className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentKeywords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-muted hover:bg-muted/80 rounded-md px-2 py-0.5 text-xs text-foreground font-medium transition-colors"
                    >
                      <Search className="size-3 text-muted-foreground" />
                      <span
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleKeywordClick(kw)}
                      >
                        {kw}
                      </span>
                      <button
                        onClick={() =>
                          setRecentKeywords((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-muted-foreground hover:text-foreground cursor-pointer ml-1 p-0.5"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}
                  {recentKeywords.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      No recent keywords.
                    </span>
                  )}
                </div>
              </div>

              {/* Results List */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {query ? "Search Results" : "Recent Search Results"}
                </span>
                <div className="space-y-1.5">
                  {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
                      <span className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      {results.map((item: any) => {
                        const isSelected = selectedItem?.id === item.id;
                        const itemName = item.name || item.student;
                        const itemSubtitle = item.phone || item.id;
                        const itemInfo = item.email || item.program;
                        const itemTag =
                          searchType === "Leads" ? item.counsellor : `${item.progress}%`;
                        const itemBadge = item.stage || item.status;

                        // Consistent Badge Tone mapping
                        const badgeTone = (
                          searchType === "Leads"
                            ? getLeadStatusTone(item.status?.toLowerCase())
                            : getApplicationStatusTone(item.status?.toLowerCase())
                        ) as any;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectResult(item)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                : "border-transparent hover:bg-muted/65"
                            }`}
                          >
                            {/* Icon Wrapper */}
                            <div
                              className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                                searchType === "Leads"
                                  ? "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400"
                                  : "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400"
                              }`}
                            >
                              {searchType === "Leads" ? (
                                <User className="size-4" />
                              ) : (
                                <FileText className="size-4" />
                              )}
                            </div>

                            {/* Title and Subtitles */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground truncate">
                                  {itemName}
                                </span>
                                <Badge tone={badgeTone}>{itemBadge}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 truncate">
                                <span className="font-mono">{itemSubtitle}</span>
                                <span>·</span>
                                <span className="truncate">{itemInfo}</span>
                              </div>
                            </div>

                            {/* Right Tag and Remove Button */}
                            <div className="shrink-0 flex items-center gap-3">
                              <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border/40 font-medium">
                                {itemTag}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveResult(item.id);
                                }}
                                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded hover:bg-muted/80"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {results.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground text-xs">
                          No results found matching "{query}"
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Quick View Panel */}
            <div className="w-[280px] bg-muted/15 p-4 shrink-0 flex flex-col">
              {!selectedItem ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center mb-3">
                    <Search className="size-5 text-primary/45" />
                  </div>
                  <h4 className="font-semibold text-xs text-foreground">Quick View</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[170px] leading-relaxed">
                    Click on any search result for more details.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full justify-between">
                  <div>
                    {/* Header Details */}
                    <div className="flex flex-col items-center text-center pb-3 border-b border-border/60">
                      <div
                        className={`size-11 rounded-full flex items-center justify-center text-xs font-bold mb-2 shadow-sm ${
                          searchType === "Leads"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                        }`}
                      >
                        {(selectedItem.name || selectedItem.student).substring(0, 2).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-xs text-foreground truncate max-w-full">
                        {selectedItem.name || selectedItem.student}
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {selectedItem.id}
                      </span>
                    </div>

                    {/* Metadata Fields */}
                    <div className="py-3 space-y-2.5 text-xs overflow-y-auto max-h-[250px]">
                      {searchType === "Leads" ? (
                        <>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Email Address
                            </span>
                            <span className="font-medium text-foreground truncate block">
                              {selectedItem.email}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Phone Number
                            </span>
                            <span className="font-medium text-foreground font-mono">
                              {selectedItem.phone}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Program Intent
                            </span>
                            <span className="font-medium text-foreground truncate block">
                              {selectedItem.program}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                                Lead Source
                              </span>
                              <span className="font-medium text-foreground truncate block">
                                {selectedItem.source || "N/A"}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                                City / Country
                              </span>
                              <span className="font-medium text-foreground truncate block">
                                {selectedItem.city}, {selectedItem.country}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                                Lead Score
                              </span>
                              <span className="font-bold text-foreground">
                                {selectedItem.score}/100
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                                Assigned To
                              </span>
                              <span className="font-medium text-foreground truncate block">
                                {selectedItem.counsellor}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Program
                            </span>
                            <span className="font-medium text-foreground truncate block">
                              {selectedItem.program}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Student Email
                            </span>
                            <span className="font-medium text-foreground truncate block">
                              {selectedItem.email || "N/A"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Application Progress
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${selectedItem.progress}%` }}
                                />
                              </div>
                              <span className="font-bold text-[10px]">
                                {selectedItem.progress}%
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                                Status
                              </span>
                              <div>
                                <Badge
                                  tone={
                                    getApplicationStatusTone(
                                      selectedItem.status?.toLowerCase(),
                                    ) as any
                                  }
                                >
                                  {selectedItem.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                                Application Fee
                              </span>
                              <span className="font-medium text-foreground font-mono truncate block">
                                {new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  maximumFractionDigits: 0,
                                }).format(selectedItem.fee)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold block">
                              Submitted Date
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedItem.submitted}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2">
                    <DialogClose asChild>
                      {searchType === "Leads" ? (
                        <Link
                          to="/leads/$leadId"
                          params={{ leadId: selectedItem.id }}
                          onClick={() => setOpen(false)}
                          className="w-full bg-primary text-primary-foreground font-semibold py-1.5 rounded-lg text-xs hover:bg-primary/95 transition-all cursor-pointer text-center block shadow-sm"
                        >
                          View Full Profile
                        </Link>
                      ) : (
                        <Link
                          to="/application/$applicationId"
                          params={{ applicationId: selectedItem.id }}
                          onClick={() => setOpen(false)}
                          className="w-full bg-primary text-primary-foreground font-semibold py-1.5 rounded-lg text-xs hover:bg-primary/95 transition-all cursor-pointer text-center block shadow-sm"
                        >
                          View Full Profile
                        </Link>
                      )}
                    </DialogClose>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

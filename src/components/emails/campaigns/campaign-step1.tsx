import React, { useState } from "react";
import {
  Layout,
  FileText,
  AlignLeft,
  Code2,
  Mail,
  Eye,
  CheckCircle2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Axios from "@/lib/axios-config";

import { useGetEmailTemplates } from "@/components/emails/hooks/query/use-get-email-templates";
import { useGetEmailTemplateCategories } from "@/components/emails/hooks/query/use-get-email-template-categories";
import type { EmailTemplateBackend, EmailTemplateBackendListItem } from "@/components/emails/types";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";
import { CampaignNavBar } from "./campaign-nav-bar";

// ─── Types ────────────────────────────────────────────────────────────────────

type CreationMode = "use-template" | "build-from-scratch";
type EditorType = "visual" | "rich-text" | "plain-text" | "html";

const CREATION_MODES: { id: CreationMode; label: string; icon: React.ElementType }[] = [
  { id: "use-template", label: "Use Email Template", icon: Mail },
  { id: "build-from-scratch", label: "Build from Scratch", icon: Code2 },
];

const EDITOR_OPTIONS: {
  id: EditorType;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  gradient: string;
}[] = [
  { id: "visual", title: "Visual Designer", description: "Drag-and-drop builder for pixel-perfect layouts.", icon: Layout, badge: "Popular", gradient: "from-violet-500 to-purple-700" },
  { id: "rich-text", title: "Rich-Text Editor", description: "Format content with a familiar document-style editor.", icon: FileText, gradient: "from-blue-500 to-indigo-600" },
  { id: "plain-text", title: "Plain-Text", description: "Simple emails optimized for direct delivery.", icon: AlignLeft, gradient: "from-teal-500 to-cyan-600" },
  { id: "html", title: "Paste HTML", description: "Import your own custom-coded HTML template.", icon: Code2, badge: "Developer", gradient: "from-slate-500 to-gray-700" },
];

const CATEGORY_GRADIENTS: Record<string, string> = {
  admissions: "from-blue-500 to-indigo-600",
  applications: "from-sky-500 to-blue-600",
  marketing: "from-violet-500 to-purple-700",
  transactional: "from-teal-500 to-cyan-600",
  finance: "from-amber-500 to-orange-600",
  payments: "from-yellow-500 to-amber-600",
  general: "from-slate-500 to-gray-600",
  documents: "from-rose-500 to-pink-600",
  offers: "from-emerald-500 to-green-600",
  leads: "from-cyan-500 to-blue-500",
  onboarding: "from-indigo-500 to-blue-600",
};

function getCategoryGradient(category?: string) {
  if (!category) return "from-primary/80 to-primary";
  return CATEGORY_GRADIENTS[category.toLowerCase()] ?? "from-primary/80 to-primary";
}

const TEMPLATE_PAGE_SIZE = 12;

function TemplateThumbnail({ name, category, isSelected }: { name: string; category?: string; isSelected: boolean }) {
  const gradient = getCategoryGradient(category);
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${gradient}`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
      <div className="absolute bottom-0 left-0 w-14 h-14 bg-white/10 rounded-full translate-y-4 -translate-x-4" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-5">
        <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-base leading-none">{initial}</span>
        </div>
        <div className="w-full space-y-1.5">
          <div className="h-1.5 bg-white/50 rounded-full w-full" />
          <div className="h-1.5 bg-white/35 rounded-full w-5/6 mx-auto" />
          <div className="h-1.5 bg-white/35 rounded-full w-4/6 mx-auto" />
        </div>
        <div className="h-6 bg-white/20 rounded border border-white/30 w-2/5 mt-0.5" />
      </div>
      {isSelected && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <Check className="size-5 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CampaignStep1() {
  const {
    name: campaignName, category, mode,
    setName: setCampaignName, setCategory, setMode: setStoreMode,
    setSelectedTemplate: setStoreTemplate, setEditorType, setStep,
  } = useCampaignCreationStore();

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateBackendListItem | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { data: templatesResponse, isLoading: isLoadingTemplates } = useGetEmailTemplates({
    search: search || undefined,
    category: categoryFilter || undefined,
    isActive: true,
    page,
    pageSize: TEMPLATE_PAGE_SIZE,
  });
  const { data: apiCategories = [] } = useGetEmailTemplateCategories();

  const templates = templatesResponse?.data ?? [];
  const total = templatesResponse?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / TEMPLATE_PAGE_SIZE);

  const handleModeChange = (newMode: CreationMode) => {
    setStoreMode(newMode);
    setSelectedTemplate(null);
  };

  const handlePreview = async (id: string, name: string) => {
    setPreviewTitle(name);
    setPreviewHtml("");
    setIsPreviewLoading(true);
    try {
      const { data } = await Axios.get<EmailTemplateBackend>(`/api/v1/email-templates/${id}`);
      setPreviewHtml(data.htmlBody || "<div style='font-family:sans-serif;color:#888;padding:48px;text-align:center'>No preview available.</div>");
    } catch {
      toast.error("Failed to load preview");
      setPreviewHtml(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleNext = () => {
    if (!campaignName.trim()) { toast.error("Please enter a campaign name"); return; }
    if (!selectedTemplate) { toast.error("Please select a template"); return; }
    setStoreTemplate(selectedTemplate.id, selectedTemplate.name);
    setEditorType("visual");
    setStep(2);
  };

  const handleEditorPick = (type: EditorType) => {
    if (!campaignName.trim()) { toast.error("Please enter a campaign name first"); return; }
    setEditorType(type);
    setStep(2);
  };

  const canProceed = !!campaignName.trim() && mode === "use-template" && !!selectedTemplate;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Name + Category */}
      <div className="border-b border-border bg-background px-6 py-3.5 shrink-0">
        <div className="flex flex-wrap items-end gap-5 max-w-2xl">
          <div className="flex-1 min-w-52">
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">
              Campaign Name <span className="text-danger">*</span>
            </Label>
            <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. Welcome Email — Batch 2027" className="h-8 text-sm" />
          </div>
          <div className="w-48">
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger size="sm" className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {(apiCategories.length > 0
                  ? apiCategories
                  : ["admissions", "marketing", "transactional", "finance", "general"]
                ).map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="shrink-0 border-b border-border bg-background flex items-stretch">
        {CREATION_MODES.map((opt) => {
          const active = mode === opt.id;
          const Icon = opt.icon;
          return (
            <button key={opt.id} type="button" onClick={() => handleModeChange(opt.id)}
              className={cn("flex items-center gap-2 px-6 py-2.5 text-sm font-medium border-b-2 transition-all",
                active ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30",
              )}>
              <Icon className="size-4 shrink-0" />{opt.label}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Use Email Template */}
        {mode === "use-template" && (
          <>
            {/* Filters */}
            <div className="shrink-0 border-b border-border bg-background/80 px-5 py-2.5 flex items-center gap-3">
              <div className="relative w-56 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search templates…" className="pl-8 h-7 text-xs" />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button type="button" onClick={() => { setCategoryFilter(""); setPage(1); }}
                  className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors shrink-0",
                    !categoryFilter ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                  All
                </button>
                {apiCategories.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => { setCategoryFilter(cat === categoryFilter ? "" : cat); setPage(1); }}
                    className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap capitalize transition-colors shrink-0",
                      categoryFilter === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    {cat}
                  </button>
                ))}
              </div>
              <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {total} template{total !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center h-64"><Loader2 className="size-7 animate-spin text-primary" /></div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                  <Mail className="size-10 opacity-20" />
                  <p className="text-sm font-medium">No templates found</p>
                  {(search || categoryFilter) && (
                    <button type="button" className="text-xs text-primary underline" onClick={() => { setSearch(""); setCategoryFilter(""); setPage(1); }}>Clear filters</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {templates.map((tmpl) => {
                    const isSelected = selectedTemplate?.id === tmpl.id;
                    return (
                      <div key={tmpl.id} onClick={() => setSelectedTemplate(isSelected ? null : tmpl)}
                        className={cn("group rounded-xl border overflow-hidden bg-card cursor-pointer transition-all duration-150 flex flex-col",
                          isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/50 hover:shadow-sm")}>
                        <div className="h-36 overflow-hidden shrink-0">
                          <TemplateThumbnail name={tmpl.name} category={tmpl.category} isSelected={isSelected} />
                        </div>
                        <div className="px-3 py-2 flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-semibold leading-tight line-clamp-2" title={tmpl.name}>{tmpl.name}</p>
                          {tmpl.category && (
                            <span className="mt-1 self-start text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tmpl.category}</span>
                          )}
                        </div>
                        <div className="flex items-center border-t border-border divide-x divide-border shrink-0">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handlePreview(tmpl.id, tmpl.name); }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                            <Eye className="size-3" /> Preview
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(isSelected ? null : tmpl); }}
                            className={cn("flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                              isSelected ? "text-primary bg-primary/5" : "text-primary hover:bg-primary/5")}>
                            <CheckCircle2 className="size-3" />{isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-5">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="size-3.5" /></Button>
                  <span className="text-xs text-muted-foreground tabular-nums">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}><ChevronRight className="size-3.5" /></Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Build from Scratch */}
        {mode === "build-from-scratch" && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-base font-semibold">Choose your editor</h2>
                <p className="text-sm text-muted-foreground mt-1">A new email template will be created and linked to this campaign.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {EDITOR_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.id} type="button" onClick={() => handleEditorPick(opt.id)}
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-border hover:border-primary hover:shadow-md text-left transition-all duration-150">
                      <div className={`bg-gradient-to-br ${opt.gradient} h-28 flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-sm"><Icon className="size-6 text-white" /></div>
                      </div>
                      <div className="p-4 flex-1 bg-card">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-semibold text-sm text-foreground leading-tight">{opt.title}</span>
                          {opt.badge && <span className="shrink-0 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{opt.badge}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      {mode === "use-template" && (
        <CampaignNavBar
          statusText={selectedTemplate ? `✓ "${selectedTemplate.name}" selected` : "Select a template to continue"}
          onNext={handleNext}
          canNext={canProceed}
        />
      )}
      {mode === "build-from-scratch" && (
        <CampaignNavBar statusText="Choose an editor above to continue" />
      )}

      {/* Preview dialog */}
      <Dialog open={previewHtml !== null} onOpenChange={() => setPreviewHtml(null)}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-5 py-3.5 border-b border-border shrink-0">
            <DialogTitle className="text-sm font-semibold truncate">{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {isPreviewLoading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <iframe srcDoc={previewHtml ?? ""} sandbox="allow-same-origin" className="w-full h-full border-0" title={previewTitle} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

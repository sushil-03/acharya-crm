import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Axios from "@/lib/axios-config";
import { useGetEmailTemplates } from "../hooks/query/use-get-email-templates";
import type { EmailTemplateBackend, EmailTemplateBackendListItem } from "../types";

interface TemplatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
  /** Optional transform applied to fetched content before calling onSelect */
  transformContent?: (htmlBody: string, textBody: string) => string;
}

type EditorFilter = "all" | "rich_text" | "visual_designer";

const FILTER_LABELS: Record<EditorFilter, string> = {
  all: "All",
  rich_text: "Rich Text",
  visual_designer: "Visual Designer",
};

function editorTypeLabel(type?: string) {
  if (!type) return "Unknown";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}


function TemplateListItem({
  template,
  isSelected,
  onClick,
}: {
  template: EmailTemplateBackendListItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg transition-all",
        isSelected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted",
      )}
    >
      <div className="flex items-center gap-2">
        <p
          className={cn(
            "text-sm font-semibold truncate leading-tight flex-1 min-w-0",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {template.name}
        </p>
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold",
            template.isActive ? "text-emerald-600" : "text-muted-foreground",
          )}
        >
          {template.isActive ? "● Published" : "○ Draft"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        {template.category && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 capitalize font-medium"
          >
            {template.category}
          </Badge>
        )}
        {template.editorType && (
          <span className="text-[10px] text-muted-foreground">
            {editorTypeLabel(template.editorType)}
          </span>
        )}
      </div>
    </button>
  );
}

export function TemplatePickerModal({ open, onClose, onSelect, transformContent }: TemplatePickerModalProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EditorFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateBackendListItem | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const { data, isLoading } = useGetEmailTemplates({ pageSize: 100 });
  const templates = data?.data ?? [];

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setTypeFilter("all");
      setSelectedId(null);
      setPreviewHtml(null);
      setSelectedTemplate(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    let list = templates;
    if (typeFilter !== "all") {
      list = list.filter((t) => t.editorType === typeFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [templates, search, typeFilter]);

  const handleSelectTemplate = async (template: EmailTemplateBackendListItem) => {
    if (selectedId === template.id) return;
    setSelectedId(template.id);
    setSelectedTemplate(template);
    setPreviewHtml(null);
    setIsLoadingPreview(true);
    try {
      const { data: detail } = await Axios.get<EmailTemplateBackend>(
        `/api/v1/email-templates/${template.id}`,
      );
      const raw = transformContent
        ? transformContent(detail.htmlBody || "", detail.textBody || "")
        : detail.htmlBody || detail.textBody || "";
      setPreviewHtml(raw);
    } catch {
      toast.error("Failed to load preview");
      setPreviewHtml(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleApply = () => {
    if (previewHtml === null) return;
    setIsApplying(true);
    onSelect(previewHtml);
    onClose();
    setIsApplying(false);
  };

  const previewDoc = previewHtml
    ? `<!DOCTYPE html><html><head><style>
        body{font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#1e293b;margin:0;padding:20px;line-height:1.6}
        img{max-width:100%;height:auto}
        table{border-collapse:collapse;width:100%}
        *{box-sizing:border-box}
      </style></head><body>${previewHtml}</body></html>`
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[82vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          {/* ── Left: list ── */}
          <div className="w-[300px] shrink-0 flex flex-col border-r bg-muted/30">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b bg-background">
              <h2 className="text-base font-bold text-foreground">Use Template</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a template to preview it.
              </p>
              <div className="relative mt-2.5">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 text-xs pl-8"
                  autoFocus
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-3 py-2 border-b bg-background">
              {(Object.keys(FILTER_LABELS) as EditorFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTypeFilter(f)}
                  className={cn(
                    "flex-1 text-[11px] font-medium py-1 rounded-md transition-all",
                    typeFilter === f
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground px-4">
                  {search ? `No templates match "${search}"` : "No templates found"}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filtered.map((t) => (
                    <TemplateListItem
                      key={t.id}
                      template={t}
                      isSelected={selectedId === t.id}
                      onClick={() => handleSelectTemplate(t)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 py-2 border-t bg-background text-[10px] text-muted-foreground text-center">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── Right: preview ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4 bg-muted/20">
                <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
                  <MousePointerClick className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">No template selected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click a template on the left to preview its content here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Preview header */}
                <div className="px-5 py-3 border-b bg-background shrink-0">
                  <p className="font-semibold text-sm text-foreground leading-tight truncate">
                    {selectedTemplate?.name}
                  </p>
                  {selectedTemplate?.subject && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {selectedTemplate.subject}
                    </p>
                  )}
                </div>

                {/* Preview body */}
                <div className="flex-1 overflow-hidden bg-slate-100 relative">
                  {isLoadingPreview ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Loading preview...</p>
                      </div>
                    </div>
                  ) : previewHtml !== null ? (
                    <iframe
                      srcDoc={previewDoc}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                      title="Template preview"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                      Preview unavailable
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="px-5 py-3 border-t bg-background shrink-0 flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    This will replace the current editor content.
                  </p>
                  <Button
                    onClick={handleApply}
                    disabled={previewHtml === null || isLoadingPreview || isApplying}
                    className="shrink-0 gap-1.5 bg-primary hover:bg-primary/90 text-white h-9"
                  >
                    {isApplying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Use This Template →
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

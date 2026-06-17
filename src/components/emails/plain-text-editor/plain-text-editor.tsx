import { useNavigate, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CampaignStepper } from "@/components/emails/campaigns/campaign-stepper";
import { CampaignNavBar } from "@/components/emails/campaigns/campaign-nav-bar";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";
import { TemplatePickerModal } from "@/components/emails/rich-text-editor/template-picker-modal";
import { Card } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Sparkles,
  FileText,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetEmailTemplateDetails } from "../hooks/query/use-get-email-template-details";
import { useGetEmailTemplateCategories } from "../hooks/query/use-get-email-template-categories";
import { useCreateEmailTemplate } from "../hooks/mutation/use-create-email-template";
import { useUpdateEmailTemplate } from "../hooks/mutation/use-update-email-template";
import { useEmailVariables } from "../hooks/use-email-variables";
import { SendTestEmail } from "../components/send-test-email";


export function PlainTextEditor({ id }: { id?: string }) {
  const campaignStep = useCampaignCreationStore((s) => s.step);
  const navigate = useNavigate();
  const router = useRouter();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [newVarLabel, setNewVarLabel] = useState("");
  const [showAllVars, setShowAllVars] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const lastFocusedRef = useRef<"subject" | "content">("content");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoadedRef = useRef(false);

  const { variables, addVariable, removeVariable } = useEmailVariables();

  // Queries & Mutations
  const { data: templateDetails, isLoading: isLoadingDetails } = useGetEmailTemplateDetails(id);
  const { data: categoriesData = [] } = useGetEmailTemplateCategories();
  const defaultCategories = ["general", "marketing", "transactional", "admissions", "finance"];
  const categories = categoriesData.length > 0 ? categoriesData : defaultCategories;

  const { mutateAsync: createTemplate, isPending: isCreating } = useCreateEmailTemplate();
  const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateEmailTemplate();
  const isSaving = isCreating || isUpdating;

  const templateKey = id && templateDetails?.key
    ? templateDetails.key
    : (name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "test_template");

  // Load existing template details
  useEffect(() => {
    if (id && templateDetails && !isLoadedRef.current) {
      isLoadedRef.current = true;
      setName(templateDetails.name || "");
      setSubject(templateDetails.subject || "");
      setCategory(templateDetails.category || "");
      setStatus(templateDetails.isActive ? "Published" : "Draft");
      setContent(templateDetails.textBody || "");
    }
  }, [id, templateDetails]);

  // Clean initialization for new templates
  useEffect(() => {
    if (!id) {
      setName("");
      setSubject("");
      setCategory("");
      setTags([]);
      setStatus("Draft");
      setContent(`Dear {{First Name}} {{Last Name}},

Thank you for registering on our admissions portal. Your registration code is {{Application ID}}.

Best regards,
Acharya Admissions Desk`);
    }
  }, [id]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!category) return toast.error("Category is required");

    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

    try {
      if (id) {
        toast.loading("Updating template...", { id: "save-template" });
        await updateTemplate({
          id,
          data: {
            name,
            key,
            subject,
            htmlBody: content, // For plain text we can put the same in htmlBody/textBody
            textBody: content,
            category,
            isActive: status === "Published"
          }
        });
        toast.success("Template updated successfully", { id: "save-template" });
      } else {
        toast.loading("Creating template...", { id: "save-template" });
        await createTemplate({
          key,
          name,
          subject,
          htmlBody: content,
          textBody: content,
          editorType: "plain_text",
          designJson: {},
          variables: [],
          category,
          isActive: status === "Published"
        });
        toast.success("Template created successfully", { id: "save-template" });
      }
      navigate({ to: "/email-templates" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save template";
      toast.error(message, { id: "save-template" });
    }
  };

  // Insert merge tag at selection
  const insertMergeField = (field: string) => {
    const placeholder = `{{${field}}}`;
    if (lastFocusedRef.current === "subject") {
      setSubject((prev) => prev + " " + placeholder);
    } else {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const val = before + placeholder + after;
        setContent(val);
        // Put cursor after inserted field
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        }, 0);
      } else {
        setContent((prev) => prev + placeholder);
      }
    }
  };

  const handleCreateVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarLabel.trim()) return;
    const res = addVariable(newVarLabel);
    if (res.success) {
      toast.success(`Variable {{${res.variable?.key}}} created successfully`);
      setNewVarLabel("");
    } else {
      toast.error(res.error || "Failed to create variable");
    }
  };


  const handleTemplateSelect = (content: string) => {
    setContent(content);
  };

  const plainTextTransform = (htmlBody: string, textBody: string): string => {
    if (textBody) return textBody;
    try {
      const doc = new DOMParser().parseFromString(htmlBody, "text/html");
      return doc.body.textContent || "";
    } catch {
      return htmlBody.replace(/<[^>]+>/g, "");
    }
  };

  return (
    <AppShell noPadding>
      <TemplatePickerModal
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleTemplateSelect}
        transformContent={plainTextTransform}
      />
      {campaignStep > 0 && <CampaignStepper />}
      <div className={`flex flex-col overflow-hidden bg-background ${campaignStep > 0 ? "flex-1 min-h-0" : "flex-1"}`}>
        {/* Editor Header Bar */}
        <div className="px-5 py-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.history.back()}
              className="size-8"
              disabled={isSaving}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Email Library · Plain Text Editor
              </div>
              <h2 className="text-lg font-bold font-display text-foreground leading-none mt-0.5">
                {name || "Plain Text Template"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as "Draft" | "Published")}
                disabled={isSaving}
              >
                <SelectTrigger className="h-9 text-xs font-semibold w-[120px] bg-card border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 h-9 min-w-[130px] justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" /> {id ? "Update Template" : "Save Template"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor Inputs Panel */}
        <div className="p-4 border-b border-border bg-card/60 grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Template Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General_Welcome_Nudge"
              className="h-9 text-sm"
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category *</label>
            <Select value={category || undefined} onValueChange={setCategory} disabled={isSaving}>
              <SelectTrigger className="h-9 text-sm bg-card border-input w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="capitalize">{cat}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Tags (Press Enter)</label>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] px-3 py-1 bg-card rounded-md border border-input">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-semibold flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-foreground" disabled={isSaving}>
                    &times;
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Add tag..." : ""}
                className="flex-1 min-w-[60px] text-xs bg-transparent border-0 outline-none p-0 focus:ring-0"
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-4">
            <label className="text-xs font-semibold text-muted-foreground">Subject Line *</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => {
                lastFocusedRef.current = "subject";
              }}
              placeholder="e.g. Welcome to Acharya University"
              className="h-9 text-sm"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {id && isLoadingDetails && (
            <div className="absolute inset-0 bg-background/80 z-[10000] flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium">Loading plain text template details...</p>
            </div>
          )}

          {/* Text Editor Area */}
          <div className="flex-1 flex flex-col h-full bg-slate-50 p-2 overflow-y-auto">
            <Card className="w-full flex flex-col h-full overflow-hidden shadow-elev-2 bg-white">
              <div className="px-4 py-2 border-b border-border bg-muted/20 text-muted-foreground text-[11px] font-semibold flex items-center justify-between gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <FileText className="size-3.5" /> plain-text-message.txt
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplatePicker(true)}
                  className="h-6 text-[11px] gap-1 px-2 font-semibold"
                >
                  <LayoutTemplate className="size-3" /> Use Template
                </Button>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => {
                  lastFocusedRef.current = "content";
                }}
                placeholder="Compose your plain text email template here..."
                spellCheck={true}
                className="flex-1 w-full p-6 text-foreground font-sans text-sm leading-relaxed outline-none resize-none overflow-y-auto"
                disabled={isSaving}
              />
            </Card>
          </div>

          {/* Right Control Sidebar */}
          <div className="w-[300px] shrink-0 bg-card overflow-y-auto flex flex-col divide-y divide-border h-full hidden lg:flex">
            {/* Merge Fields */}
            <div className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1">
                <Sparkles className="size-3.5 text-primary" /> Email Personalization
              </h3>
              <p className="text-[11px] text-muted-foreground leading-normal mb-3">
                Insert mail-merge fields in subject or email body to customize the message.
              </p>

              {/* Add Custom Variable Form */}
              <form onSubmit={handleCreateVariable} className="flex gap-1.5 mb-3.5">
                <Input
                  value={newVarLabel}
                  onChange={(e) => setNewVarLabel(e.target.value)}
                  placeholder="Add var name (e.g. Due Date)..."
                  className="h-8 text-xs bg-muted border-border"
                  disabled={isSaving}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-8 shrink-0 bg-primary text-white"
                  disabled={isSaving || !newVarLabel.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </form>

              <div className="space-y-1">
                {(showAllVars ? variables : variables.slice(0, 4)).map((field) => (
                  <div
                    key={field.key}
                    className="group flex items-center justify-between bg-muted hover:bg-primary/10 hover:text-primary transition px-2.5 py-1.5 rounded-md text-xs font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => insertMergeField(field.key)}
                      className="flex-1 text-left flex items-center justify-between"
                      disabled={isSaving}
                    >
                      <span>{field.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary/70 mr-1.5">
                        {`{{${field.key}}}`}
                      </span>
                    </button>
                    {field.isCustom && (
                      <button
                        type="button"
                        onClick={() => removeVariable(field.key)}
                        className="text-muted-foreground hover:text-destructive opacity-40 hover:opacity-100 p-0.5 rounded transition shrink-0"
                        disabled={isSaving}
                        title="Delete custom variable"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAllVars((v) => !v)}
                className="mt-2.5 w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition font-semibold py-1.5 rounded-md hover:bg-muted/60"
                disabled={isSaving}
              >
                {showAllVars ? (
                  <>
                    <ChevronUp className="size-3" /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3" /> Show All Fields
                  </>
                )}
              </button>
            </div>

            {/* Test Email Component */}
            <SendTestEmail
              templateKey={templateKey}
              subject={subject}
              content={content}
              disabled={isSaving}
            />
          </div>
        </div>
        {campaignStep > 0 && (
          <CampaignNavBar statusText="Save your template then proceed to select recipients." />
        )}
      </div>
    </AppShell>
  );
}

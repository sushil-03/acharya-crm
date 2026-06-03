import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  FileText,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Plus
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getEmailTemplate, saveEmailTemplate, createBlankEmailTemplate } from "@/store/use-email-templates-store";
import { EmailTemplate } from "@/types/email-templates-types";
import { toast } from "sonner";

export const Route = createFileRoute("/email-templates/create/plain-text")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search.id as string) || undefined
    };
  },
  component: PlainTextEditorPage
});

function PlainTextEditorPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [template, setTemplate] = useState<EmailTemplate | null>(null);

  const [testEmails, setTestEmails] = useState("");
  const lastFocusedRef = useRef<"subject" | "content">("content");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing or create blank
  useEffect(() => {
    if (id) {
      const existing = getEmailTemplate(id);
      if (existing) {
        setTemplate(existing);
        setName(existing.name);
        setSubject(existing.subject);
        setContent(existing.content);
        setTags(existing.tags);
        setStatus(existing.status);
      } else {
        toast.error("Template not found");
        navigate({ to: "/email-templates" });
      }
    } else {
      const blank = createBlankEmailTemplate("plain-text");
      setTemplate(blank);
      setName("General Welcome Nudge");
      setSubject("Welcome to Acharya University admissions portal");
      setContent(`Dear {{First Name}} {{Last Name}},

Thank you for registering on our admissions portal. Your registration code is {{Application ID}}.

Please complete the basic details profile within 48 hours to activate your priority counselling queue.

If you require any assistance, our counsellor Priya can be reached directly.

Best regards,
Acharya Admissions Desk`);
      setTags(["Welcome", "Nudge", "Plain-Text"]);
    }
  }, [id, navigate]);

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

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!template) return;

    const updated: EmailTemplate = {
      ...template,
      name,
      subject,
      content,
      tags,
      status,
      modifiedBy: "Admin"
    };

    saveEmailTemplate(updated);
    toast.success("Template saved successfully");
    navigate({ to: "/email-templates" });
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

  const handleSendTest = () => {
    if (!testEmails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }
    toast.success(`Test email successfully sent to ${testEmails}!`);
    setTestEmails("");
  };

  return (
    <AppShell noPadding>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
        {/* Editor Header Bar */}
        <div className="px-5 py-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate({ to: "/email-templates" })}
              className="size-8"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Email Library · Plain Text Editor
              </div>
              <h2 className="text-lg font-bold font-display text-foreground leading-none mt-0.5">
                {name || "General Welcome Nudge"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground/80 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 h-9">
              <Save className="size-4" /> Save Template
            </Button>
          </div>
        </div>

        {/* Editor Inputs Panel */}
        <div className="p-4 border-b border-border bg-card/60 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Template Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General_Welcome_Nudge"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Subject Line *</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => {
                lastFocusedRef.current = "subject";
              }}
              placeholder="e.g. Welcome to Acharya University"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Tags (Press Enter)</label>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] px-3 py-1 bg-card rounded-md border border-input">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-semibold flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-foreground">
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
              />
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Text Editor Area */}
          <div className="flex-1 flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
            <Card className="max-w-[700px] w-full mx-auto flex flex-col h-full overflow-hidden shadow-elev-2 bg-white">
              <div className="px-4 py-2 border-b border-border bg-muted/20 text-muted-foreground text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
                <FileText className="size-3.5" /> plain-text-message.txt
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
              />
            </Card>
          </div>

          {/* Right Control Sidebar */}
          <div className="w-[300px] shrink-0 bg-card overflow-y-auto flex flex-col divide-y divide-border h-full hidden lg:flex">
            {/* Merge Fields */}
            <div className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1">
                <Sparkles className="size-3.5 text-primary" /> Email Personalization
              </h3>
              <p className="text-[11px] text-muted-foreground leading-normal mb-3">
                Insert mail-merge fields in subject or email body to customize the message.
              </p>
              <div className="space-y-1">
                {[
                  "First Name",
                  "Last Name",
                  "Course Name",
                  "Application ID",
                  "Parent Name",
                  "Parent Number"
                ].map((f) => (
                  <button
                    key={f}
                    onClick={() => insertMergeField(f)}
                    className="w-full text-left text-xs bg-muted hover:bg-primary/10 hover:text-primary transition px-2.5 py-1.5 rounded font-medium flex items-center justify-between"
                  >
                    <span>{f}</span>
                    <span className="text-[10px] text-muted-foreground font-mono font-normal">
                      {"{{"}
                      {f.replace(/\s+/g, "")}
                      {"}}"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Email */}
            <div className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1">
                <Send className="size-3.5 text-success" /> Send Test Emails
              </h3>
              <p className="text-[11px] text-muted-foreground leading-normal mb-3">
                Send test emails to review layouts before publishing.
              </p>
              <div className="space-y-2">
                <textarea
                  value={testEmails}
                  onChange={(e) => setTestEmails(e.target.value)}
                  placeholder="e.g. test@example.com, developer@acharya.ac.in"
                  className="w-full text-xs bg-muted border border-border rounded p-2 focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                />
                <Button onClick={handleSendTest} className="w-full text-xs h-8 bg-success hover:bg-success/95 text-white flex items-center justify-center gap-1.5">
                  <Send className="size-3.5" /> Send Test Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEmailVariables } from "../hooks/use-email-variables";
import { TestEmailVariablesDialog } from "../components/test-email-variables-dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const DEFAULT_VISIBLE_FIELDS = 2;

interface EditorSidebarProps {
  insertMergeField: (key: string) => void;
  testEmails: string;
  setTestEmails: (v: string) => void;
  isSaving?: boolean;
  subject: string;
  content: string;
}

export function EditorSidebar({
  insertMergeField,
  testEmails,
  setTestEmails,
  isSaving,
  subject,
  content,
}: EditorSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const [newVarLabel, setNewVarLabel] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { variables, addVariable, removeVariable } = useEmailVariables();

  const visibleFields = showAll
    ? variables
    : variables.slice(0, DEFAULT_VISIBLE_FIELDS);

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

  const handleSendTestClick = () => {
    if (!testEmails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleActualSend = (customSubject: string, customContent: string) => {
    toast.success(`Test email successfully sent to ${testEmails}!`, {
      description: `Subject: "${customSubject}"`,
      duration: 5000,
    });
    setTestEmails("");
  };

  return (
    <div className="w-[300px] shrink-0 bg-card overflow-y-auto flex flex-col divide-y divide-border h-full hidden lg:flex border-l border-border">
      {/* Merge Fields */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" /> Email Personalization
        </h3>
        <p className="text-[11px] text-muted-foreground leading-normal mb-3">
          Click a field to insert it at the cursor (subject or body).
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
          {visibleFields.map((field) => (
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
          onClick={() => setShowAll((v) => !v)}
          className="mt-2.5 w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition font-semibold py-1.5 rounded-md hover:bg-muted/60"
          disabled={isSaving}
        >
          {showAll ? (
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

      {/* Send Test Email */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5">
          <Send className="size-3.5 text-success" /> Send Test Email
        </h3>
        <p className="text-[11px] text-muted-foreground leading-normal mb-3">
          Preview how the email looks before publishing.
        </p>
        <div className="space-y-2">
          <textarea
            value={testEmails}
            onChange={(e) => setTestEmails(e.target.value)}
            placeholder="e.g. test@example.com, admin@acharya.ac.in"
            className="w-full text-xs bg-muted border border-border rounded-md p-2.5 focus:ring-1 focus:ring-primary outline-none min-h-[64px] resize-none"
            disabled={isSaving}
          />
          <p className="text-[10px] text-muted-foreground">
            Separate multiple addresses with commas.
          </p>
          <Button
            onClick={handleSendTestClick}
            disabled={isSaving}
            className="w-full text-xs h-8 bg-success hover:bg-success/95 text-white flex items-center justify-center gap-1.5"
          >
            <Send className="size-3.5" /> Send Test Email
          </Button>
        </div>
      </div>

      <TestEmailVariablesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        subject={subject}
        content={content}
        testEmails={testEmails}
        onSend={handleActualSend}
      />
    </div>
  );
}

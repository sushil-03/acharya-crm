import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { useEmailVariables } from "../hooks/use-email-variables";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SendTestEmail } from "../components/send-test-email";

interface EditorSidebarProps {
  templateKey: string;
  subject: string;
  content: string;
  disabled?: boolean;
  className?: string;
}

export function EditorSidebar({
  templateKey,
  subject,
  content,
  disabled,
  className,
}: EditorSidebarProps) {
  const { variables, addVariable, removeVariable } = useEmailVariables();
  const [newVarLabel, setNewVarLabel] = useState("");

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

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    toast.success(`Copied {{${key}}} to clipboard!`);
  };

  return (
    <div
      className={`w-[280px] shrink-0 bg-card overflow-hidden flex flex-col h-full hidden lg:flex border-l border-border ${className || ""}`}
    >
      {/* Variables */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 min-h-0">
        <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5 shrink-0">
          <Sparkles className="size-3.5 text-primary" /> Template Variables
        </h3>
        <p className="text-[10px] text-muted-foreground leading-normal mb-3 shrink-0">
          Click any variable to copy its placeholder into your template.
        </p>

        <form onSubmit={handleCreateVariable} className="flex gap-1.5 mb-4 shrink-0">
          <Input
            value={newVarLabel}
            onChange={(e) => setNewVarLabel(e.target.value)}
            placeholder="Add variable name..."
            className="h-8 text-xs bg-muted border-border"
          />
          <Button
            type="submit"
            size="icon"
            className="size-8 shrink-0 bg-primary text-white"
            disabled={!newVarLabel.trim()}
          >
            <Plus className="size-4" />
          </Button>
        </form>

        <div className="space-y-1 overflow-y-auto flex-1 pr-1 min-h-0">
          {variables.map((field) => (
            <div
              key={field.key}
              className="group flex items-center justify-between bg-muted hover:bg-primary/10 hover:text-primary transition px-2.5 py-1.5 rounded-md text-xs font-medium"
            >
              <button
                type="button"
                onClick={() => copyToClipboard(field.key)}
                className="flex-1 text-left flex items-center justify-between min-w-0"
                title="Click to copy placeholder"
              >
                <span className="truncate mr-1">{field.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary/70 shrink-0 mr-1.5">
                  {`{{${field.key}}}`}
                </span>
              </button>
              {field.isCustom && (
                <button
                  type="button"
                  onClick={() => removeVariable(field.key)}
                  className="text-muted-foreground hover:text-destructive opacity-40 hover:opacity-100 p-0.5 rounded transition shrink-0"
                  title="Delete custom variable"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Send Test Email */}
      <div className="border-t border-border bg-card/50 shrink-0">
        <SendTestEmail
          templateKey={templateKey}
          subject={subject}
          content={content}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

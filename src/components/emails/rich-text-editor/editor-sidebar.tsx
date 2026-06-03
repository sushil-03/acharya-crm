import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, ChevronDown, ChevronUp } from "lucide-react";
import { MERGE_FIELDS, DEFAULT_VISIBLE_FIELDS } from "./constants";

interface EditorSidebarProps {
  insertMergeField: (key: string) => void;
  testEmails: string;
  setTestEmails: (v: string) => void;
  onSendTest: () => void;
}

export function EditorSidebar({
  insertMergeField,
  testEmails,
  setTestEmails,
  onSendTest,
}: EditorSidebarProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleFields = showAll
    ? MERGE_FIELDS
    : MERGE_FIELDS.slice(0, DEFAULT_VISIBLE_FIELDS);

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

        <div className="space-y-1">
          {visibleFields.map((field) => (
            <button
              key={field.key}
              onClick={() => insertMergeField(field.key)}
              className="w-full text-left text-xs bg-muted hover:bg-primary/10 hover:text-primary transition px-2.5 py-2 rounded-md font-medium flex items-center justify-between group"
            >
              <span>{field.label}</span>
              <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary/70">
                {`{{${field.key}}}`}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition font-semibold py-1.5 rounded-md hover:bg-muted/60"
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
          />
          <p className="text-[10px] text-muted-foreground">
            Separate multiple addresses with commas.
          </p>
          <Button
            onClick={onSendTest}
            className="w-full text-xs h-8 bg-success hover:bg-success/95 text-white flex items-center justify-center gap-1.5"
          >
            <Send className="size-3.5" /> Send Test Email
          </Button>
        </div>
      </div>
    </div>
  );
}

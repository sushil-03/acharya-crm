import React from "react";
import { Input } from "@/components/ui/input";

interface EditorInputsProps {
  name: string;
  setName: (name: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  onSubjectFocus: () => void;
  tags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
  handleAddTag: (e: React.KeyboardEvent) => void;
  handleRemoveTag: (index: number) => void;
}

export function EditorInputs({
  name,
  setName,
  subject,
  setSubject,
  onSubjectFocus,
  tags,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
}: EditorInputsProps) {
  return (
    <div className="p-4 border-b border-border bg-card/60 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Template Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Scholarship_Offer_Nudge"
          className="h-9 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Subject Line *
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onFocus={onSubjectFocus}
          placeholder="e.g. Congratulations! Your scholarship is approved"
          className="h-9 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Tags (Press Enter)
        </label>
        <div className="flex flex-wrap items-center gap-1.5 min-h-[36px] px-3 py-1 bg-card rounded-md border border-input">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-semibold flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="hover:text-foreground"
              >
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
  );
}

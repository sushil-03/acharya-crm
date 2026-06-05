import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditorInputsProps {
  name: string;
  setName: (name: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  category: string;
  setCategory: (category: string) => void;
  categories: string[];
  tags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
  handleAddTag: (e: React.KeyboardEvent) => void;
  handleRemoveTag: (index: number) => void;
  className?: string;
}

export function EditorInputs({
  name,
  setName,
  subject,
  setSubject,
  category,
  setCategory,
  categories,
  tags,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  className,
}: EditorInputsProps) {
  return (
    <div
      className={`p-4 border-b border-border bg-card/60 grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0 ${className || ""}`}
    >
      {/* Row 1 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Template Name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. FEE_pending2627_AIT"
          className="h-9 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Category *</label>
        <Select value={category || undefined} onValueChange={setCategory}>
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

      {/* Row 2 */}
      <div className="flex flex-col gap-1.5 md:col-span-4">
        <label className="text-xs font-semibold text-muted-foreground">Subject Line *</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Fee Payment Outstanding Reminder"
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}

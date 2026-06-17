import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditorHeaderProps {
  name: string;
  status: "Draft" | "Published";
  setStatus: (status: "Draft" | "Published") => void;
  onSave: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
}

export function EditorHeader({ name, status, setStatus, onSave, isSaving, isEditing }: EditorHeaderProps) {
  const router = useRouter();

  return (
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
            Email Library · Rich Text Editor
          </div>
          <h2 className="text-lg font-bold font-display text-foreground leading-none mt-0.5">
            {name || "Rich Text Template"}
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
          onClick={onSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 h-9 min-w-[130px] justify-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="size-4" /> {isEditing ? "Update Template" : "Save Template"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


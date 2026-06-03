import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface EditorHeaderProps {
  name: string;
  status: "Draft" | "Published";
  setStatus: (status: "Draft" | "Published") => void;
  handleSave: () => void;
}

export function EditorHeader({ name, status, setStatus, handleSave }: EditorHeaderProps) {
  const navigate = useNavigate();

  return (
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
            Email Library · Visual Designer
          </div>
          <h2 className="text-lg font-bold font-display text-foreground leading-none mt-0.5">
            {name || "Visual Template"}
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
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 h-9"
        >
          <Save className="size-4" /> Save Template
        </Button>
      </div>
    </div>
  );
}

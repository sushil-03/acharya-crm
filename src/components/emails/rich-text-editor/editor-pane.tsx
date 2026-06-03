import React from "react";
import { Card } from "@/components/ui-kit";
import { FileText } from "lucide-react";
import { EDITOR_ID } from "./constants";

export function EditorPane() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
      <Card className="max-w-[800px] w-full mx-auto flex flex-col h-full overflow-hidden shadow-elev-2 bg-white min-h-[400px]">
        <div className="px-4 py-2 border-b border-border bg-muted/20 text-muted-foreground text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
          <FileText className="size-3.5 text-primary" /> email-rich-editor.html
        </div>
        <div className="flex-1 w-full bg-white relative">
          <textarea
            id={EDITOR_ID}
            className="opacity-0 w-full h-full absolute inset-0 focus:outline-none pointer-events-none"
          />
        </div>
      </Card>
    </div>
  );
}

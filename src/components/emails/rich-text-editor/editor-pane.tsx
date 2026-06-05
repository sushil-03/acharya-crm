import React from "react";
import { Card } from "@/components/ui-kit";
import { FileText } from "lucide-react";
import { EDITOR_ID } from "./constants";

export function EditorPane() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 p-2 overflow-y-auto">
      <Card className="max-w-[800px] w-full mx-auto flex flex-col h-full overflow-hidden p-0 shadow-elev-2 bg-white min-h-[400px]">
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

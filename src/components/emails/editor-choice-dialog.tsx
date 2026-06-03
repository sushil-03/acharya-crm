import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layout, FileText, AlignLeft, Code2 } from "lucide-react";

export type EditorType = "visual" | "rich-text" | "plain-text" | "html";

interface EditorOption {
  id: EditorType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

interface EditorChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: (editorType: EditorType) => void;
  initialSelected?: EditorType;
}

export function EditorChoiceDialog({
  open,
  onOpenChange,
  onProceed,
  initialSelected = "visual",
}: EditorChoiceDialogProps) {
  const [selected, setSelected] = useState<EditorType>(initialSelected);

  const options: EditorOption[] = [
    {
      id: "visual",
      title: "Visual Designer",
      description: "Build layouts using an interactive drag-and-drop builder.",
      icon: <Layout className="size-5" />,
      badge: "Popular",
    },
    {
      id: "rich-text",
      title: "Rich-Text Editor",
      description: "Format copy easily with a standard document editor.",
      icon: <FileText className="size-5" />,
    },
    {
      id: "plain-text",
      title: "Plain-Text Editor",
      description: "Draft clean, pure-text emails optimized for direct delivery.",
      icon: <AlignLeft className="size-5" />,
    },
    {
      id: "html",
      title: "Paste HTML",
      description: "Import your own custom-coded HTML templates.",
      icon: <Code2 className="size-5" />,
      badge: "Developer",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[680px] p-6 bg-background border border-border shadow-lg rounded-lg gap-0">
        <DialogHeader className="mb-6 space-y-1">
          <DialogTitle className="text-lg font-bold font-display text-foreground tracking-tight">
            Create Email Template
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose the editor mode that best fits your workflow.
          </DialogDescription>
        </DialogHeader>

        {/* 2x2 Grid of Left-Aligned Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <div
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`flex gap-3.5 p-4 rounded-lg border cursor-pointer text-left transition-all duration-200 select-none items-start relative ${
                  isSelected
                    ? "border-primary bg-primary/[0.02]"
                    : "border-border hover:border-muted-foreground/25 hover:bg-muted/10"
                }`}
              >
                {/* Clean, monochrome icon */}
                <div className={`p-2 rounded-md shrink-0 border ${
                  isSelected 
                    ? "bg-primary/5 border-primary/20 text-primary" 
                    : "bg-muted/30 border-border/50 text-muted-foreground"
                }`}>
                  {option.icon}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {option.title}
                    </span>
                    {option.badge && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    {option.description}
                  </p>
                </div>

                {/* Radio indicator */}
                <div className="absolute top-4 right-4 shrink-0">
                  <div className={`size-4 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground/30 bg-transparent"
                  }`}>
                    {isSelected && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t border-border mt-6 pt-4 gap-3 flex items-center justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="px-4 text-xs font-medium text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onProceed(selected)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 text-xs font-semibold shadow-sm"
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { automationTriggers } from "../../lib/automation.ts";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (category: string, actName: string, displayName: string, description: string) => void;
}

type Category = keyof typeof automationTriggers.triggers;

const CATEGORY_LABELS: Record<string, string> = {
  Lead: "Lead Trigger",
  Opportunity: "Opportunity Trigger",
  Activity: "Activity Trigger",
  User: "User Trigger",
  Task: "Task Trigger",
  Cron: "At Regular Intervals",
};

const CATEGORY_COLORS: Record<string, string> = {
  Lead: "bg-success/20 text-success",
  Opportunity: "bg-info/20 text-info",
  Activity: "bg-warning/20 text-warning",
  User: "bg-primary/20 text-primary",
  Task: "bg-danger/20 text-danger",
  Cron: "bg-muted text-muted-foreground",
};

export function TriggerSelectModal({ open, onClose, onSelect }: Props) {
  const categories = Object.keys(automationTriggers.triggers) as Category[];
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0]);
  const [selectedActName, setSelectedActName] = useState<string | null>(null);

  const triggers = automationTriggers.triggers[activeCategory] ?? [];
  const selectedTrigger = triggers.find((t) => t.actName === selectedActName);

  function handleConfirm() {
    if (!selectedTrigger) return;
    onSelect(
      activeCategory,
      selectedTrigger.actName,
      selectedTrigger.displayName,
      selectedTrigger.description,
    );
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle>When will your Automation start?</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        <div className="flex h-96">
          {/* categories */}
          <ul className="w-44 shrink-0 border-r border-border overflow-y-auto py-2">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedActName(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    activeCategory === cat
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground/70 hover:bg-muted/50"
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              </li>
            ))}
          </ul>

          {/* triggers */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {triggers.map((t) => {
              const isSelected = t.actName === selectedActName;
              const colorClass =
                CATEGORY_COLORS[activeCategory] ?? "bg-muted text-muted-foreground";
              return (
                <button
                  key={t.actName}
                  onClick={() => setSelectedActName(t.actName)}
                  onDoubleClick={() => {
                    setSelectedActName(t.actName);
                    handleConfirm();
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${colorClass}`}
                  >
                    {t.displayName.slice(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight">{t.displayName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {t.description}
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedActName}>
            Confirm Trigger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

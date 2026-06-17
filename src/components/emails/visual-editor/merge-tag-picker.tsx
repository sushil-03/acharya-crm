import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { loadAllVariables, type EmailVariable } from "../hooks/use-email-variables";

interface MergeTagPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
}

export function MergeTagPicker({ open, onClose, onSelect }: MergeTagPickerProps) {
  const [search, setSearch] = useState("");
  const [variables, setVariables] = useState<EmailVariable[]>([]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setVariables(loadAllVariables());
    }
  }, [open]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? variables.filter(
          (v) =>
            v.label.toLowerCase().includes(q) ||
            v.key.toLowerCase().includes(q) ||
            (v.category ?? "").toLowerCase().includes(q),
        )
      : variables;

    return filtered.reduce(
      (acc, v) => {
        const cat = v.category ?? (v.isCustom ? "Custom" : "General");
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(v);
        return acc;
      },
      {} as Record<string, EmailVariable[]>,
    );
  }, [search, variables]);

  const totalFiltered = Object.values(groups).reduce((s, g) => s + g.length, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <DialogTitle className="text-sm font-semibold">Insert Merge Tag</DialogTitle>
          <Input
            placeholder="Search by name, key or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="h-8 text-xs mt-2"
          />
        </DialogHeader>

        <div className="overflow-y-auto max-h-[400px] py-1">
          {totalFiltered === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-10">
              No variables match &ldquo;{search}&rdquo;
            </p>
          ) : (
            Object.entries(groups).map(([cat, vars]) => (
              <div key={cat}>
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50">
                  {cat} <span className="font-normal normal-case tracking-normal opacity-60">({vars.length})</span>
                </div>
                {vars.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => {
                      onSelect(v.key);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-2 flex items-center justify-between gap-3 hover:bg-muted transition-colors group"
                  >
                    <span className="text-sm">{v.label}</span>
                    <span className="text-[11px] font-mono text-muted-foreground group-hover:text-primary shrink-0">
                      {`{{${v.key}}}`}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

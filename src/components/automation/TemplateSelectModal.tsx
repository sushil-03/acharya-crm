import { useState } from "react";
import { X, FileText, Users, UserCheck, RefreshCw, Mail, Handshake } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  createBlankAutomation,
  cloneAutomation,
  saveAutomation,
  MOCK_AUTOMATIONS,
} from "../../store/automation-store";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const CATEGORIES = [
  "All",
  "Recommended",
  "Inbound Prospect Follow-up",
  "Customer Follow-up",
  "Re-engagement",
  "Engagement",
  "Finish Purchase",
  "Onboarding Email",
  "Internal User Engagement",
];

const TEMPLATES = [
  {
    id: "blank",
    name: "Build from Scratch",
    description: "Build an automation from scratch using triggers, conditions and actions.",
    category: ["All", "Recommended"],
    icon: FileText,
    sourceId: null,
  },
  {
    id: "t1",
    name: "New Lead Auto-Assign & Welcome",
    description:
      "Automatically assign new leads from Facebook/Google/Walk-in and send a welcome message.",
    category: ["All", "Recommended", "Inbound Prospect Follow-up"],
    icon: Users,
    sourceId: "auto-001",
  },
  {
    id: "t2",
    name: "Application Follow-up",
    description:
      "Follow up with leads who have a pending application with WhatsApp and task reminders.",
    category: ["All", "Recommended", "Customer Follow-up", "Engagement"],
    icon: UserCheck,
    sourceId: "auto-002",
  },
  {
    id: "t3",
    name: "Fee Payment Nudge",
    description: "Multi-step reminder sequence for leads with pending fee payment.",
    category: ["All", "Finish Purchase"],
    icon: RefreshCw,
    sourceId: "auto-005",
  },
  {
    id: "t4",
    name: "Admission Decision Notify + ERP Sync",
    description: "Notify student of admission decision and push approved students to ERP.",
    category: ["All", "Recommended", "Onboarding Email"],
    icon: Mail,
    sourceId: "auto-003",
  },
  {
    id: "t5",
    name: "Walk-in Registration",
    description:
      "Capture walk-in activity, update lead source, assign counsellor and send welcome SMS.",
    category: ["All", "Inbound Prospect Follow-up", "Internal User Engagement"],
    icon: Handshake,
    sourceId: "auto-006",
  },
];

export function TemplateSelectModal({ open, onClose, onCreated }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<string | null>("blank");

  const visible = TEMPLATES.filter((t) => t.category.includes(activeCategory));

  function handleSelect() {
    const tmpl = TEMPLATES.find((t) => t.id === selected);
    if (!tmpl) return;

    if (tmpl.id === "blank" || !tmpl.sourceId) {
      const flow = createBlankAutomation();
      saveAutomation(flow);
      onCreated(flow.id);
    } else {
      const source = MOCK_AUTOMATIONS.find((m) => m.id === tmpl.sourceId);
      if (source) {
        const cloned = cloneAutomation(source, tmpl.name);
        saveAutomation(cloned);
        onCreated(cloned.id);
      }
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle>Choose a template to get started</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </DialogHeader>
        <div className="flex h-[420px]">
          {/* categories */}
          <ul className="w-52 shrink-0 border-r border-border overflow-y-auto py-2">
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelected(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    activeCategory === cat
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/70 hover:bg-muted/50"
                  }`}
                >
                  {cat}
                  {cat === "Internal User Engagement" && (
                    <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">
                      New
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* templates */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {visible.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = selected === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelected(tmpl.id)}
                  onDoubleClick={() => {
                    setSelected(tmpl.id);
                    handleSelect();
                  }}
                  className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`size-12 shrink-0 rounded-lg flex items-center justify-center ${
                      tmpl.id === "blank"
                        ? "bg-muted border border-dashed border-border"
                        : "bg-primary/10"
                    }`}
                  >
                    {tmpl.id === "blank" ? (
                      <span className="text-[10px] font-bold text-muted-foreground">Blank</span>
                    ) : (
                      <Icon className="size-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{tmpl.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {tmpl.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selected}>
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Plus, Trash2, GripVertical, Users, X, Check, RefreshCw } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { ChannelBadge } from "../channel-badge";
import type { Channel } from "@/types/communications";

const COUNSELLORS = [
  { id: "round_robin", label: "Round Robin" },
  { id: "priya_nair", label: "Priya Nair" },
  { id: "rahul_verma", label: "Rahul Verma" },
  { id: "anita_singh", label: "Anita Singh" },
  { id: "kiran_m", label: "Kiran M." },
];

const PROGRAMS = [
  "B.Tech Computer Science", "B.Tech Mechanical", "MBA Analytics", "MBBS",
  "B.Arch", "Pharm.D", "B.Sc Nursing", "B.Com LLB",
];

function AddRuleForm({ onAdd, onCancel }: { onAdd: (rule: { label: string; channel?: Channel; program?: string; assignTo: string; assignToLabel: string }) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [channel, setChannel] = useState<Channel | "">("");
  const [program, setProgram] = useState("");
  const [assignTo, setAssignTo] = useState("round_robin");

  const assignToLabel = COUNSELLORS.find((c) => c.id === assignTo)?.label ?? "Round Robin";
  const valid = label.trim() && (channel || program);

  return (
    <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Rule Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none focus:ring-2 focus:ring-primary/30"
          placeholder='e.g. "WhatsApp leads → Priya Nair"'
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Channel condition</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel | "")}
            className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none"
          >
            <option value="">Any channel</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="web">Web Query</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Program condition</label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none"
          >
            <option value="">Any program</option>
            {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Assign to</label>
        <select
          value={assignTo}
          onChange={(e) => setAssignTo(e.target.value)}
          className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none"
        >
          {COUNSELLORS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => valid && onAdd({ label, channel: channel || undefined, program: program || undefined, assignTo, assignToLabel })}
          disabled={!valid}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40"
        >
          <Check className="size-3.5" /> Add Rule
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-muted text-[13px] font-medium">
          <X className="size-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function AssignmentRules() {
  const { assignmentRules, addAssignmentRule, deleteAssignmentRule } = useChatStore();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[13px] text-muted-foreground">
          Rules are evaluated in priority order. The first matching rule assigns the conversation. If no rule matches, it remains unassigned.
        </p>
        <button
          onClick={() => setAdding(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium"
        >
          <Plus className="size-3.5" /> Add Rule
        </button>
      </div>

      {adding && (
        <AddRuleForm
          onAdd={(r) => { addAssignmentRule(r); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-2">
        {assignmentRules.map((rule, i) => (
          <div
            key={rule.id}
            className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <GripVertical className="size-4 cursor-grab" />
              <span className="text-[11px] font-bold w-4 text-center">{i + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px]">{rule.label}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {rule.channel && <ChannelBadge channel={rule.channel} />}
                {rule.program && (
                  <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                    {rule.program}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ${rule.assignTo === "round_robin" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"}`}>
                {rule.assignTo === "round_robin" ? (
                  <RefreshCw className="size-3" />
                ) : (
                  <Users className="size-3" />
                )}
                {rule.assignToLabel}
              </div>
              <button
                onClick={() => deleteAssignmentRule(rule.id)}
                className="size-7 grid place-items-center rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        {assignmentRules.length === 0 && (
          <div className="py-10 text-center text-[13px] text-muted-foreground border border-dashed border-border rounded-xl">
            No assignment rules yet. Add one to auto-route incoming conversations.
          </div>
        )}
      </div>
    </div>
  );
}

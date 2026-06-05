import { useState } from "react";
import { Plus, Trash2, MessageSquare, Clock, Bot, X, Check } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import type { AutoResponse } from "@/types/communications";

function ResponseCard({ response }: { response: AutoResponse }) {
  const { toggleAutoResponse, deleteAutoResponse } = useChatStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(response.response);

  const ICONS = { welcome: MessageSquare, away: Clock, faq: Bot };
  const Icon = ICONS[response.trigger];

  return (
    <div className={`border rounded-xl p-4 transition-colors ${response.enabled ? "border-border" : "border-border/50 opacity-60"}`}>
      <div className="flex items-start gap-3">
        <div className={`size-8 rounded-lg grid place-items-center shrink-0 ${response.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[13px]">{response.label}</span>
            {response.trigger === "faq" && response.question && (
              <span className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                Trigger: "{response.question}"
              </span>
            )}
          </div>
          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                autoFocus
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full bg-muted rounded-lg px-3 py-2 text-[13px] outline-none resize-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-primary text-primary-foreground text-[12px]"
                >
                  <Check className="size-3" /> Save
                </button>
                <button
                  onClick={() => { setDraft(response.response); setEditing(false); }}
                  className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-muted text-[12px]"
                >
                  <X className="size-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="text-[12px] text-muted-foreground mt-1 cursor-pointer hover:text-foreground transition-colors line-clamp-3"
              onClick={() => setEditing(true)}
              title="Click to edit"
            >
              {response.response}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleAutoResponse(response.id)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${response.enabled ? "bg-success" : "bg-muted-foreground/30"}`}
          >
            <span
              className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${response.enabled ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
          <button
            onClick={() => deleteAutoResponse(response.id)}
            className="size-7 grid place-items-center rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddFAQForm({ onAdd, onCancel }: { onAdd: (q: string, r: string) => void; onCancel: () => void }) {
  const [q, setQ] = useState("");
  const [r, setR] = useState("");
  return (
    <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Trigger keyword / question</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none focus:ring-2 focus:ring-primary/30"
          placeholder='e.g. "fees", "scholarship", "hostel"'
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Auto-response</label>
        <textarea
          rows={3}
          value={r}
          onChange={(e) => setR(e.target.value)}
          className="w-full bg-background rounded-lg px-3 py-2 text-[13px] border border-border outline-none resize-none focus:ring-2 focus:ring-primary/30"
          placeholder="Response to send automatically..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => q && r && onAdd(q, r)}
          disabled={!q || !r}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40"
        >
          <Check className="size-3.5" /> Add FAQ
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-muted text-[13px] font-medium">
          <X className="size-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function AutoResponses() {
  const { autoResponses, addAutoResponse } = useChatStore();
  const [addingFAQ, setAddingFAQ] = useState(false);

  const welcome = autoResponses.filter((r) => r.trigger === "welcome");
  const away = autoResponses.filter((r) => r.trigger === "away");
  const faqs = autoResponses.filter((r) => r.trigger === "faq");

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-[14px]">Welcome Message</h3>
          <p className="text-[12px] text-muted-foreground">Sent automatically when a student starts a new conversation.</p>
        </div>
        {welcome.map((r) => <ResponseCard key={r.id} response={r} />)}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-[14px]">Outside Office Hours</h3>
          <p className="text-[12px] text-muted-foreground">Sent when a message arrives outside business hours (Mon–Sat, 9 AM – 6 PM).</p>
        </div>
        {away.map((r) => <ResponseCard key={r.id} response={r} />)}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[14px]">FAQ Bot Replies</h3>
            <p className="text-[12px] text-muted-foreground">Keyword-triggered auto-replies before a counsellor takes over.</p>
          </div>
          <button
            onClick={() => setAddingFAQ(true)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium"
          >
            <Plus className="size-3.5" /> Add FAQ
          </button>
        </div>
        {addingFAQ && (
          <AddFAQForm
            onAdd={(q, r) => {
              addAutoResponse({ trigger: "faq", label: q, enabled: true, response: r, question: q });
              setAddingFAQ(false);
            }}
            onCancel={() => setAddingFAQ(false)}
          />
        )}
        {faqs.map((r) => <ResponseCard key={r.id} response={r} />)}
      </section>
    </div>
  );
}

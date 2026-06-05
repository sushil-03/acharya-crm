import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import type { ChatTemplate } from "@/types/communications";

const CATEGORIES: ChatTemplate["category"][] = [
  "welcome", "documents", "scholarship", "fee", "tour", "followup", "other",
];

const CATEGORY_COLORS: Record<ChatTemplate["category"], string> = {
  welcome: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  documents: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  scholarship: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  fee: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tour: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  followup: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  other: "bg-muted text-muted-foreground",
};

function TemplateForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<ChatTemplate>;
  onSave: (t: Omit<ChatTemplate, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    category: initial?.category ?? ("welcome" as ChatTemplate["category"]),
    content: initial?.content ?? "",
    channel: initial?.channel ?? ("" as ChatTemplate["channel"] | ""),
  });

  const valid = form.title.trim() && form.content.trim();

  return (
    <div className="border border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Template name..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ChatTemplate["category"] })}
            className="w-full h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
          Content <span className="font-normal">(use {"{{name}}"}, {"{{program}}"} for variables)</span>
        </label>
        <textarea
          rows={3}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full bg-background rounded-lg px-3 py-2 text-[13px] border border-border outline-none resize-none focus:ring-2 focus:ring-primary/30"
          placeholder="Template message..."
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
          Channel (optional — leave blank for all channels)
        </label>
        <select
          value={form.channel ?? ""}
          onChange={(e) => setForm({ ...form, channel: e.target.value as ChatTemplate["channel"] | "" })}
          className="w-48 h-9 bg-background rounded-lg px-3 text-[13px] border border-border outline-none"
        >
          <option value="">All channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="web">Web</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => valid && onSave({ ...form, channel: (form.channel || undefined) as ChatTemplate["channel"] })}
          disabled={!valid}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40"
        >
          <Check className="size-3.5" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-muted text-[13px] font-medium"
        >
          <X className="size-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function TemplateManager() {
  const { templates, addTemplate, deleteTemplate, updateTemplate } = useChatStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ChatTemplate["category"] | "all">("all");

  const filtered = templates.filter((t) => categoryFilter === "all" || t.category === categoryFilter);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            All ({templates.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = templates.filter((t) => t.category === c).length;
            if (count === 0) return null;
            return (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors ${categoryFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium"
        >
          <Plus className="size-3.5" /> Add Template
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <TemplateForm
          onSave={(t) => { addTemplate(t); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr_auto] bg-muted/40 px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Title</span>
          <span className="text-center px-4">Category</span>
          <span>Preview</span>
          <span className="text-right">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[13px] text-muted-foreground">No templates yet</div>
        )}
        {filtered.map((t) => (
          <div key={t.id}>
            {editingId === t.id ? (
              <div className="p-4">
                <TemplateForm
                  initial={t}
                  onSave={(patch) => { updateTemplate(t.id, patch); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_auto_1fr_auto] px-4 py-3 border-t border-border items-start gap-2 hover:bg-muted/30 transition-colors">
                <div className="text-[13px] font-medium">{t.title}</div>
                <div className="px-4 flex items-center">
                  <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 capitalize ${CATEGORY_COLORS[t.category]}`}>
                    {t.category}
                  </span>
                </div>
                <div className="text-[12px] text-muted-foreground line-clamp-2">{t.content}</div>
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => setEditingId(t.id)}
                    className="size-7 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="size-7 grid place-items-center rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Paperclip, Smile, Send, LayoutTemplate, Search, X } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import type { ChatTemplate } from "@/types/communications";

const CATEGORY_COLORS: Record<ChatTemplate["category"], string> = {
  welcome: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  documents: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  scholarship: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  fee: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tour: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  followup: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  other: "bg-muted text-muted-foreground",
};

export function MessageComposer({ onInsertTemplate }: { onInsertTemplate?: (text: string) => void }) {
  const { activeConvId, conversations, templates, sendMessage } = useChatStore();
  const conv = conversations.find((c) => c.id === activeConvId);
  const [text, setText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredTemplates = templates.filter(
    (t) =>
      (!t.channel || !conv || t.channel === conv.channel) &&
      (templateSearch === "" ||
        t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.content.toLowerCase().includes(templateSearch.toLowerCase())),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    }
    if (showTemplates) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplates]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (val.endsWith("/")) {
      setShowTemplates(true);
      setTemplateSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") setShowTemplates(false);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !activeConvId) return;
    sendMessage(activeConvId, trimmed);
    setText("");
    textareaRef.current?.focus();
  };

  const insertTemplate = (content: string) => {
    setText(content);
    setShowTemplates(false);
    onInsertTemplate?.(content);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <div className="border-t border-border p-3 bg-card relative">
      {/* Template picker popover */}
      {showTemplates && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-3 right-3 mb-2 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="flex-1 text-[13px] bg-transparent outline-none"
            />
            <button onClick={() => setShowTemplates(false)}>
              <X className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredTemplates.length === 0 && (
              <div className="py-6 text-center text-[13px] text-muted-foreground">No templates found</div>
            )}
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => insertTemplate(t.content)}
                className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 capitalize ${CATEGORY_COLORS[t.category]}`}>
                    {t.category}
                  </span>
                  <span className="text-[13px] font-medium">{t.title}</span>
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{t.content}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button className="size-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground shrink-0">
          <Paperclip className="size-4" />
        </button>
        <button className="size-9 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground shrink-0">
          <Smile className="size-4" />
        </button>
        <button
          onClick={() => { setShowTemplates((v) => !v); setTemplateSearch(""); }}
          className={`size-9 grid place-items-center rounded-lg shrink-0 transition-colors ${showTemplates ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
        >
          <LayoutTemplate className="size-4" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message or / for templates..."
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none bg-muted rounded-xl px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/30 min-h-[36px] max-h-32"
          style={{ overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="size-9 grid place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 shrink-0"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Minus,
  Search,
  Send,
  LayoutTemplate,
  CheckCheck,
  Check,
  Bot,
  Sparkles,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useChatStore } from "@/store/chat-store";
import { ChannelBadge } from "./channel-badge";
import type { Channel, MessageStatus } from "@/types/communications";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusTick({ status, light }: { status: MessageStatus; light?: boolean }) {
  const cls = light ? "opacity-60" : "";
  if (status === "read") return <CheckCheck className={`size-3 text-blue-300 ${cls}`} />;
  if (status === "delivered") return <CheckCheck className={`size-3 opacity-40`} />;
  return <Check className={`size-3 opacity-30`} />;
}

const AI_HINTS: Record<string, string> = {
  c1: "Send the campus tour confirmation + parking details template.",
  c2: "Offer to share the MBA brochure and placement report.",
  c3: "Let her know deadline is July 31 — send the checklist.",
  c7: "Share hostel details and monthly fee breakdown.",
  c8: "Escalate fee portal issue; offer the manual payment link.",
};

const CHANNEL_FILTERS: { key: Channel | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "whatsapp", label: "WA" },
  { key: "instagram", label: "IG" },
  { key: "facebook", label: "FB" },
  { key: "web", label: "Web" },
];

// ── Conversation List ─────────────────────────────────────────────────────────

function ConvList({
  channelFilter,
  onChannel,
  onSelect,
}: {
  channelFilter: Channel | "all";
  onChannel: (v: Channel | "all") => void;
  onSelect: () => void;
}) {
  const { conversations, activeConvId, setActive, markRead } = useChatStore();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    if (channelFilter !== "all" && c.channel !== channelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.contact.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0 space-y-2">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted text-[12px] outline-none focus:ring-2 focus:ring-primary/30 border-0"
          />
        </div>

        {/* Channel pills */}
        <div className="flex gap-1">
          {CHANNEL_FILTERS.map(({ key, label }) => {
            const unread = conversations
              .filter((c) => key === "all" || c.channel === key)
              .reduce((s, c) => s + c.unread, 0);
            const active = channelFilter === key;
            return (
              <button
                key={key}
                onClick={() => onChannel(key)}
                className={`flex-1 h-7 rounded-md text-[11px] font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
                {unread > 0 && (
                  <span className={`ml-0.5 ${active ? "opacity-70" : "text-primary font-bold"}`}>
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[12px] text-muted-foreground">No conversations</div>
        )}
        {filtered.map((conv) => {
          const isActive = conv.id === activeConvId;
          return (
            <button
              key={conv.id}
              onClick={() => {
                setActive(conv.id);
                if (conv.unread > 0) markRead(conv.id);
                onSelect();
              }}
              className={`w-full text-left flex items-start gap-3 px-3 py-2.5 border-b border-border/50 transition-colors ${
                isActive
                  ? "bg-primary/8 border-l-[3px] border-l-primary"
                  : "hover:bg-muted/50 border-l-[3px] border-l-transparent"
              }`}
            >
              {/* Avatar with channel/status overlay */}
              <div className="relative shrink-0 mt-0.5">
                <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-[11px] font-bold shadow-sm">
                  {conv.contact.avatar}
                </div>
                {conv.status === "resolved" ? (
                  <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-success grid place-items-center ring-2 ring-background">
                    <CheckCircle2 className="size-2.5 text-white" />
                  </span>
                ) : conv.status === "bot" ? (
                  <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-warning grid place-items-center ring-2 ring-background">
                    <Bot className="size-2.5 text-white" />
                  </span>
                ) : (
                  <ChannelBadge channel={conv.channel} avatarOverlay />
                )}
              </div>

              {/* Info — 2 rows only */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[13px] truncate ${isActive ? "font-bold" : "font-semibold"}`}>
                    {conv.contact.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{conv.lastTime}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground truncate flex-1 leading-snug">
                    {conv.lastMessage}
                  </span>
                  {conv.unread > 0 && (
                    <span className="shrink-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Chat Pane ─────────────────────────────────────────────────────────────────

function ChatPane() {
  const { conversations, activeConvId, templates, sendMessage } = useChatStore();
  const conv = conversations.find((c) => c.id === activeConvId);
  const [text, setText] = useState("");
  const [showTmpl, setShowTmpl] = useState(false);
  const [tmplSearch, setTmplSearch] = useState("");
  const [showAI, setShowAI] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tmplRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conv?.messages.length]);

  useEffect(() => {
    setShowAI(true);
    setText("");
  }, [activeConvId]);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (tmplRef.current && !tmplRef.current.contains(e.target as Node)) setShowTmpl(false);
    }
    if (showTmpl) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showTmpl]);

  if (!conv) return (
    <div className="flex-1 grid place-items-center text-[13px] text-muted-foreground">
      Select a conversation
    </div>
  );

  const filteredTmpl = templates.filter(
    (t) =>
      (!t.channel || t.channel === conv.channel) &&
      (tmplSearch === "" || t.title.toLowerCase().includes(tmplSearch.toLowerCase())),
  );

  const handleSend = () => {
    const v = text.trim();
    if (!v) return;
    sendMessage(activeConvId, v);
    setText("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") setShowTmpl(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    if (v.endsWith("/")) { setShowTmpl(true); setTmplSearch(""); }
  };

  const aiHint = AI_HINTS[activeConvId];

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-[oklch(0.97_0.01_250)] dark:bg-background/60">
        {conv.messages.map((msg, i) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id ?? i} className="flex justify-center">
                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 text-muted-foreground text-[10px] rounded-full px-3 py-1">
                  <Bot className="size-3 shrink-0" />
                  {msg.text}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id ?? i} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed shadow-sm ${
                  msg.isMe
                    ? "bg-primary text-primary-foreground rounded-br-[4px]"
                    : "bg-white dark:bg-card text-foreground rounded-bl-[4px] border border-border/60"
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-0.5 flex items-center justify-end gap-0.5 ${
                    msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                  {msg.isMe && <StatusTick status={msg.status} light />}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI suggestion */}
        {aiHint && showAI && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-800/50 rounded-xl rounded-bl-[4px] px-3 py-2 text-[11.5px] max-w-[85%]">
              <Sparkles className="size-3.5 shrink-0 mt-0.5 text-violet-500" />
              <span className="text-muted-foreground leading-relaxed">
                <span className="font-semibold text-violet-600 dark:text-violet-400">AI: </span>
                {aiHint}
              </span>
              <button
                onClick={() => setShowAI(false)}
                className="ml-1 shrink-0 text-muted-foreground/60 hover:text-muted-foreground mt-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 p-2.5 bg-card relative shrink-0">
        {/* Template picker */}
        {showTmpl && (
          <div
            ref={tmplRef}
            className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={tmplSearch}
                onChange={(e) => setTmplSearch(e.target.value)}
                placeholder="Search templates..."
                className="flex-1 text-[12px] bg-transparent outline-none"
              />
              <button onClick={() => setShowTmpl(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredTmpl.length === 0 && (
                <div className="py-6 text-center text-[12px] text-muted-foreground">No templates found</div>
              )}
              {filteredTmpl.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setText(t.content);
                    setShowTmpl(false);
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0"
                >
                  <div className="text-[12px] font-semibold">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{t.content}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-1.5">
          <button
            onClick={() => { setShowTmpl((v) => !v); setTmplSearch(""); }}
            className={`size-8 grid place-items-center rounded-lg shrink-0 transition-colors ${
              showTmpl ? "bg-primary/15 text-primary" : "hover:bg-muted text-muted-foreground"
            }`}
            title="Templates (/)"
          >
            <LayoutTemplate className="size-4" />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message... (/ for templates)"
            className="flex-1 resize-none bg-muted rounded-xl px-3 py-2 text-[12.5px] outline-none focus:ring-2 focus:ring-primary/30 min-h-[34px] max-h-24 leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="size-8 grid place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 shrink-0 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");

  const conversations = useChatStore((s) => s.conversations);
  const activeConvId = useChatStore((s) => s.activeConvId);
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 select-none">
      {/* ── Full panel ── */}
      {open && !minimized && (
        <div
          className="bg-background border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            width: 680,
            height: 520,
            boxShadow: "0 25px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="size-7 rounded-lg bg-white/15 grid place-items-center shrink-0">
              <MessageSquare className="size-4" />
            </div>
            <span className="font-bold text-[14px] flex-1 tracking-tight">Communication Hub</span>
            {totalUnread > 0 && (
              <span className="bg-white/20 text-white text-[11px] font-bold rounded-full px-2.5 py-0.5 leading-none">
                {totalUnread} new
              </span>
            )}
            <Link
              to="/chat-settings"
              className="size-7 grid place-items-center rounded-md hover:bg-white/20 transition-colors"
              title="Chat Settings"
            >
              <Settings2 className="size-4" />
            </Link>
            <button
              onClick={() => setMinimized(true)}
              className="size-7 grid place-items-center rounded-md hover:bg-white/20 transition-colors"
              title="Minimise"
            >
              <Minus className="size-4" />
            </button>
            <button
              onClick={handleClose}
              className="size-7 grid place-items-center rounded-md hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            {/* Conversation list */}
            <div
              className="border-r border-border/60 shrink-0 flex flex-col"
              style={{ width: 240 }}
            >
              <ConvList
                channelFilter={channelFilter}
                onChannel={setChannelFilter}
                onSelect={() => setShowChat(true)}
              />
            </div>

            {/* Chat pane */}
            <div className="flex-1 min-w-0">
              <ChatPane />
            </div>
          </div>
        </div>
      )}

      {/* ── Minimised pill ── */}
      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2.5 h-11 px-4 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
          style={{ boxShadow: "0 8px 24px -4px rgba(99,102,241,0.5)" }}
        >
          <MessageSquare className="size-4" />
          <span className="text-[13px] font-semibold">Communication Hub</span>
          {totalUnread > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold rounded-full px-1.5 h-5 flex items-center leading-none">
              {totalUnread}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="size-5 grid place-items-center rounded-full hover:bg-white/20 transition-colors ml-1"
          >
            <X className="size-3" />
          </button>
        </button>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => (open ? handleClose() : handleOpen())}
        className="size-14 rounded-full text-white grid place-items-center relative transition-all hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          boxShadow: open
            ? "0 4px 12px rgba(99,102,241,0.4)"
            : "0 8px 28px -4px rgba(99,102,241,0.6), 0 2px 8px rgba(0,0,0,0.15)",
        }}
        aria-label="Toggle Communication Hub"
      >
        <div
          className="transition-all duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
        </div>
        {!open && totalUnread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1"
            style={{ boxShadow: "0 2px 8px rgba(239,68,68,0.5)" }}
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}

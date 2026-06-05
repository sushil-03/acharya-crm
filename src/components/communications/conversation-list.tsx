import { useState } from "react";
import { Search, Bot, CheckCircle2, Circle } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { ChannelBadge } from "./channel-badge";
import type { Channel, ConvStatus } from "@/types/communications";

const CHANNEL_FILTERS: { key: Channel | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "whatsapp", label: "WA" },
  { key: "instagram", label: "IG" },
  { key: "facebook", label: "FB" },
  { key: "web", label: "Web" },
];

const STATUS_FILTERS: { key: ConvStatus | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Circle },
  { key: "open", label: "Open", icon: Circle },
  { key: "bot", label: "Bot", icon: Bot },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
];

export function ConversationList() {
  const { conversations, activeConvId, setActive, markRead } = useChatStore();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ConvStatus | "all">("all");

  const filtered = conversations.filter((c) => {
    if (channelFilter !== "all" && c.channel !== channelFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.contact.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadByChannel = (ch: Channel | "all") =>
    conversations
      .filter((c) => ch === "all" || c.channel === ch)
      .reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex flex-col h-full border-r border-border min-h-0">
      {/* Search */}
      <div className="p-3 border-b border-border shrink-0 space-y-2">
        <div className="relative">
          <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Channel filters */}
        <div className="flex gap-1">
          {CHANNEL_FILTERS.map(({ key, label }) => {
            const count = unreadByChannel(key);
            const active = channelFilter === key;
            return (
              <button
                key={key}
                onClick={() => setChannelFilter(key)}
                className={`flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-[11px] font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold ${active ? "opacity-80" : "text-primary"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status filters */}
        <div className="flex gap-1">
          {STATUS_FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex-1 flex items-center justify-center gap-1 h-6 rounded-md text-[10px] font-semibold transition-colors ${statusFilter === key ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="size-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-muted-foreground">
            No conversations found
          </div>
        )}
        {filtered.map((conv) => {
          const isActive = conv.id === activeConvId;
          return (
            <button
              key={conv.id}
              onClick={() => {
                setActive(conv.id);
                if (conv.unread > 0) markRead(conv.id);
              }}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-3 border-b border-border transition-colors ${isActive ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/40 border-l-2 border-l-transparent"}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-[11px] font-bold">
                  {conv.contact.avatar}
                </div>
                {conv.status === "bot" && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-warning/90 grid place-items-center">
                    <Bot className="size-2.5 text-white" />
                  </span>
                )}
                {conv.status === "resolved" && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-success/90 grid place-items-center">
                    <CheckCircle2 className="size-2.5 text-white" />
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-[13px] truncate">{conv.contact.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{conv.lastTime}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <ChannelBadge channel={conv.channel} compact />
                  <span className="text-[10px] text-muted-foreground truncate flex-1">
                    {conv.contact.program}
                  </span>
                  {conv.unread > 0 && (
                    <span className="shrink-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

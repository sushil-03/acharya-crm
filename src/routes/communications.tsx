import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Settings2, Phone, Video, UserCheck, CheckCircle2, RotateCcw, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { useChatStore } from "@/store/chat-store";
import { ConversationList } from "@/components/communications/conversation-list";
import { MessageArea } from "@/components/communications/message-area";
import { MessageComposer } from "@/components/communications/message-composer";
import { ContactPanel } from "@/components/communications/contact-panel";
import { ChannelBadge } from "@/components/communications/channel-badge";

export const Route = createFileRoute("/communications")({
  component: CommsPage,
  head: () => ({ meta: [{ title: "Communication Hub — Acharya One" }] }),
});

const STAGE_TONE: Record<string, "primary" | "success" | "warning" | "muted" | "info"> = {
  Inquiry: "muted",
  "Application Started": "info",
  "Docs Pending": "warning",
  "Offer Released": "primary",
  Enrolled: "success",
  "Payment Pending": "warning",
};

function ConversationHeader({ onInsert }: { onInsert: (text: string) => void }) {
  const { conversations, activeConvId, resolveConversation, reopenConversation } = useChatStore();
  const conv = conversations.find((c) => c.id === activeConvId);
  if (!conv) return null;
  const { contact } = conv;

  return (
    <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0 bg-card">
      <div className="size-9 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white text-[11px] font-bold shrink-0">
        {contact.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[14px]">{contact.name}</span>
          <ChannelBadge channel={conv.channel} />
          {conv.status === "resolved" && (
            <Badge tone="success">Resolved</Badge>
          )}
          {conv.status === "bot" && (
            <Badge tone="warning">Bot</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="size-1.5 rounded-full bg-success inline-block" />
          <span className="text-[11px] text-muted-foreground">{contact.program}</span>
          <span className="text-[11px] text-muted-foreground">·</span>
          <Badge tone={STAGE_TONE[contact.stage] ?? "muted"}>{contact.stage}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button className="size-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground" title="Call">
          <Phone className="size-4" />
        </button>
        <button className="size-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground" title="Video call">
          <Video className="size-4" />
        </button>
        <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:bg-muted text-muted-foreground text-[12px]" title="Assign">
          <UserCheck className="size-4" />
          <span className="hidden sm:inline">Assign</span>
          <ChevronDown className="size-3" />
        </button>
        {conv.status === "resolved" ? (
          <button
            onClick={() => reopenConversation(conv.id)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-[12px] font-medium"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reopen</span>
          </button>
        ) : (
          <button
            onClick={() => resolveConversation(conv.id)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-success/10 text-success hover:bg-success/20 text-[12px] font-medium"
          >
            <CheckCircle2 className="size-3.5" />
            <span className="hidden sm:inline">Resolve</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CommsPage() {
  const [composerText, setComposerText] = useState("");

  const handleInsertTemplate = useCallback((text: string) => {
    setComposerText(text);
  }, []);

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Growth"
        title="Communication Hub"
        subtitle="Unified inbox · WhatsApp · Instagram · Facebook · Web"
        actions={
          <Link
            to="/chat-settings"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-[13px] font-medium transition-colors"
          >
            <Settings2 className="size-4" />
            Chat Settings
          </Link>
        }
      />

      <Card className="overflow-hidden h-[calc(100vh-200px)] grid grid-cols-1 md:grid-cols-[320px_1fr_280px]">
        <ConversationList />

        <div className="flex flex-col min-h-0">
          <ConversationHeader onInsert={handleInsertTemplate} />
          <MessageArea />
          <MessageComposer onInsertTemplate={handleInsertTemplate} />
        </div>

        <div className="hidden md:block overflow-hidden">
          <ContactPanel onInsertTemplate={handleInsertTemplate} />
        </div>
      </Card>
    </AppShell>
  );
}

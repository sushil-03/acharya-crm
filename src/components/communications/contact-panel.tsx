import { useState } from "react";
import { Phone, Mail, ExternalLink, Copy, Check, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useChatStore } from "@/store/chat-store";
import { ChannelBadge } from "./channel-badge";
import { Badge } from "@/components/ui-kit";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-muted text-muted-foreground">
      {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
    </button>
  );
}

const STAGE_TONE: Record<string, "primary" | "success" | "warning" | "muted" | "info"> = {
  Inquiry: "muted",
  "Application Started": "info",
  "Docs Pending": "warning",
  "Offer Released": "primary",
  Enrolled: "success",
  "Payment Pending": "warning",
};

export function ContactPanel({ onInsertTemplate }: { onInsertTemplate?: (text: string) => void }) {
  const { conversations, activeConvId, templates } = useChatStore();
  const conv = conversations.find((c) => c.id === activeConvId);
  const [note, setNote] = useState("");

  if (!conv) return null;
  const { contact } = conv;

  const channelTemplates = templates.filter((t) => !t.channel || t.channel === conv.channel);

  return (
    <div className="border-l border-border p-4 overflow-y-auto space-y-5">
      {/* Contact header */}
      <div className="text-center">
        <div className="size-16 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-white font-bold text-lg mx-auto shadow-md">
          {contact.avatar}
        </div>
        <div className="font-semibold mt-2 text-[14px]">{contact.name}</div>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <Star className="size-3 text-warning fill-warning" />
          <span className="text-[12px] text-muted-foreground">Score {contact.score}</span>
          <span className="text-[10px] text-muted-foreground">· {contact.leadId}</span>
        </div>
        <div className="mt-2 flex justify-center">
          <ChannelBadge channel={conv.channel} />
        </div>
      </div>

      {/* Info grid */}
      <div className="space-y-2.5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Program</div>
          <div className="text-[12px]">{contact.program}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Stage</div>
          <Badge tone={STAGE_TONE[contact.stage] ?? "muted"}>{contact.stage}</Badge>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Assigned To</div>
          <div className="text-[12px]">{contact.assignedTo}</div>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 group">
          <Phone className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-[12px] flex-1 truncate">{contact.phone}</span>
          <CopyButton value={contact.phone} />
        </div>
        <div className="flex items-center gap-2 group">
          <Mail className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-[12px] flex-1 truncate">{contact.email}</span>
          <CopyButton value={contact.email} />
        </div>
      </div>

      {/* View lead profile */}
      <Link
        to="/leads/$leadId"
        params={{ leadId: contact.leadId }}
        className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg border border-border text-[12px] font-medium hover:bg-muted transition-colors"
      >
        <ExternalLink className="size-3.5" /> View Lead Profile
      </Link>

      {/* Notes */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Quick Note</div>
        <textarea
          rows={2}
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full text-[12px] bg-muted rounded-lg px-2.5 py-2 outline-none resize-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Template library */}
      {onInsertTemplate && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Templates</div>
          <div className="space-y-1">
            {channelTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => onInsertTemplate(t.content)}
                className="w-full text-left text-[12px] px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors truncate"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useRef, useEffect, useState } from "react";
import { CheckCheck, Check, Bot, Sparkles, X } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import type { MessageStatus } from "@/types/communications";

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === "read") return <CheckCheck className="size-3 text-blue-400" />;
  if (status === "delivered") return <CheckCheck className="size-3 opacity-50" />;
  return <Check className="size-3 opacity-50" />;
}

const AI_SUGGESTIONS: Record<string, string> = {
  c1: "Suggest sending the campus tour confirmation template with parking details.",
  c2: "Offer to share the MBA brochure and placement report PDF.",
  c3: "Let her know the application deadline is July 31st — send the checklist.",
  c7: "Share hostel details and monthly fee breakdown.",
  c8: "Escalate fee portal issue to tech team; offer manual payment link.",
};

export function MessageArea() {
  const { conversations, activeConvId } = useChatStore();
  const conv = conversations.find((c) => c.id === activeConvId);
  const endRef = useRef<HTMLDivElement>(null);
  const [showAI, setShowAI] = useState(true);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowAI(true);
  }, [activeConvId, conv?.messages.length]);

  if (!conv) return null;

  const aiSuggestion = AI_SUGGESTIONS[activeConvId];

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[oklch(0.97_0.01_250)] dark:bg-background space-y-2">
      {conv.messages.map((msg, i) => {
        if (msg.isSystem) {
          return (
            <div key={msg.id ?? i} className="flex justify-center my-1">
              <div className="flex items-center gap-1.5 bg-muted/70 text-muted-foreground text-[11px] rounded-full px-3 py-1">
                <Bot className="size-3" />
                {msg.text}
              </div>
            </div>
          );
        }

        return (
          <div key={msg.id ?? i} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-[13px] shadow-sm ${
                msg.isMe
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card text-card-foreground rounded-bl-sm border border-border"
              }`}
            >
              {msg.text}
              <div
                className={`text-[10px] mt-0.5 flex items-center justify-end gap-1 ${
                  msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {msg.time}
                {msg.isMe && <StatusIcon status={msg.status} />}
              </div>
            </div>
          </div>
        );
      })}

      {/* AI Suggestion */}
      {aiSuggestion && showAI && (
        <div className="flex justify-start">
          <div className="flex items-start gap-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/10 border border-violet-300/40 dark:border-violet-700/40 text-foreground rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12px] max-w-[80%]">
            <Sparkles className="size-3.5 shrink-0 mt-0.5 text-violet-500" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-violet-600 dark:text-violet-400">AI: </span>
              {aiSuggestion}
            </span>
            <button onClick={() => setShowAI(false)} className="ml-1 shrink-0 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

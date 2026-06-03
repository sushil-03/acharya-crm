import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import {
  Send,
  Search,
  Phone,
  Video,
  Paperclip,
  Smile,
  Sparkles,
  MessageSquare,
  Mail,
  MessageCircle,
  CheckCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/communications")({
  component: CommsPage,
  head: () => ({ meta: [{ title: "Communication Hub — Acharya One" }] }),
});

// Define a type for a message
interface ChatMessage {
  me: boolean;
  t: string;
  time?: string; // Optional for new messages
}

// Define a type for a thread
interface ChatThread {
  id: number;
  name: string;
  channel: string;
  last: string;
  time: string;
  unread: number;
  avatar: string;
  program: string; // Add program here
  messages: ChatMessage[]; // Add messages array
}

const initialThreads: ChatThread[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    channel: "WhatsApp",
    last: "Yes, I can attend the campus visit on Saturday.",
    time: "2m",
    unread: 2,
    avatar: "AS",
    program: "B.Tech Computer Science",
    messages: [
      { me: false, t: "Hi! I'm interested in B.Tech CSE at your Bengaluru campus." },
      {
        me: true,
        t: "Hi Aarav! Welcome 👋 I'm Priya from Acharya admissions. Happy to help. Could you share your 12th score?",
      },
      { me: false, t: "I scored 91% in PCM. Also taking JEE Main." },
      {
        me: true,
        t: "Excellent! You're eligible for our Merit Scholarship up to 25%. Would you like to schedule a campus tour this Saturday?",
      },
      { me: false, t: "Yes, I can attend the campus visit on Saturday." },
    ],
  },
  {
    id: 2,
    name: "Diya Patel",
    channel: "Email",
    last: "Thank you for the scholarship offer letter...",
    time: "18m",
    unread: 0,
    avatar: "DP",
    program: "MBA Analytics",
    messages: [
      {
        me: false,
        t: "Dear Priya, Thank you for the scholarship offer letter. I'm reviewing it now.",
      },
      { me: true, t: "You're welcome, Diya! Please let us know if you have any questions." },
    ],
  },
  {
    id: 3,
    name: "Vihaan Reddy",
    channel: "WhatsApp",
    last: "What documents do I need for the application?",
    time: "1h",
    unread: 1,
    avatar: "VR",
    program: "B.Arch",
    messages: [
      { me: false, t: "Hi, what documents do I need to upload for the application?" },
      {
        me: true,
        t: "Hi Vihaan, you'll need your 10th and 12th mark sheets, a valid ID proof, and a passport-sized photograph.",
      },
      { me: false, t: "Okay, thanks!" },
    ],
  },
  {
    id: 4,
    name: "Saanvi Khan",
    channel: "SMS",
    last: "OTP confirmation for fee payment",
    time: "2h",
    unread: 0,
    avatar: "SK",
    program: "Pharm.D",
    messages: [{ me: false, t: "Your OTP for fee payment is 123456." }],
  },
  {
    id: 5,
    name: "Arjun Singh",
    channel: "WhatsApp",
    last: "Can we reschedule the counselling call?",
    time: "4h",
    unread: 0,
    avatar: "AS",
    program: "MBBS",
    messages: [
      {
        me: false,
        t: "Hi, I need to reschedule my counselling call. Is tomorrow afternoon available?",
      },
      { me: true, t: "Sure, Arjun. Let me check Priya's availability and get back to you." },
    ],
  },
];

function CommsPage() {
  const [active, setActive] = useState(0);
  const [allThreads, setAllThreads] = useState<ChatThread[]>(initialThreads);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentThread = allThreads[active];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentThread.messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;

    const newMessage: ChatMessage = {
      me: true,
      t: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAllThreads((prevThreads) => {
      const updatedThreads = [...prevThreads];
      const threadToUpdate = { ...updatedThreads[active] };
      threadToUpdate.messages = [...threadToUpdate.messages, newMessage];
      threadToUpdate.last = newMessage.t;
      threadToUpdate.time = "Now";
      updatedThreads[active] = threadToUpdate;
      return updatedThreads;
    });

    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Growth"
        title="Communication Hub"
        subtitle="Unified inbox · WhatsApp Business · Email · SMS · Voice"
      />

      <Card className="overflow-hidden h-[calc(100vh-220px)] grid grid-cols-1 md:grid-cols-[320px_1fr_280px]">
        <div className="border-r border-border flex flex-col min-h-0">
          <div className="p-3 border-b border-border shrink-0">
            <div className="relative">
              <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                placeholder="Search conversations..."
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted text-[13px] outline-none"
              />
            </div>
            <div className="flex gap-1 mt-2">
              {[
                { i: MessageCircle, l: "All", n: allThreads.reduce((sum, t) => sum + t.unread, 0) },
                {
                  i: MessageSquare,
                  l: "WA",
                  n: allThreads
                    .filter((t) => t.channel === "WhatsApp")
                    .reduce((sum, t) => sum + t.unread, 0),
                },
                {
                  i: Mail,
                  l: "Email",
                  n: allThreads
                    .filter((t) => t.channel === "Email")
                    .reduce((sum, t) => sum + t.unread, 0),
                },
              ].map((t, i) => (
                <button
                  key={i}
                  className={`flex-1 flex items-center justify-center gap-1 h-7 rounded-md text-[11px] font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <t.i className="size-3" /> {t.l} <span className="opacity-70">{t.n}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {allThreads.map((t, i) => (
              <button
                key={t.id}
                onClick={() => {
                  setActive(i);
                  setAllThreads((prevThreads) => {
                    const updatedThreads = [...prevThreads];
                    const threadToUpdate = { ...updatedThreads[i] };
                    if (threadToUpdate.unread > 0) {
                      threadToUpdate.unread = 0;
                      updatedThreads[i] = threadToUpdate;
                    }
                    return updatedThreads;
                  });
                }}
                className={`w-full text-left flex items-start gap-2.5 px-3 py-3 border-b border-border  ${active === i ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/40"}`}
              >
                <div className="size-9 rounded-full bg-gradient-brand grid place-items-center text-white text-[11px] font-bold shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[13px] truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.time}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      tone={
                        t.channel === "WhatsApp"
                          ? "success"
                          : t.channel === "Email"
                            ? "info"
                            : "muted"
                      }
                    >
                      {t.channel}
                    </Badge>
                    {t.unread > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-muted-foreground truncate mt-0.5">{t.last}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col min-h-0 relative">
          <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
            <div className="size-9 rounded-full bg-gradient-brand grid place-items-center text-white text-[11px] font-bold">
              {currentThread.avatar}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[14px]">{currentThread.name}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success" /> Online · WhatsApp
              </div>
            </div>
            <button className="size-9 grid place-items-center rounded-lg hover:bg-muted">
              <Phone className="size-4" />
            </button>
            <button className="size-9 grid place-items-center rounded-lg hover:bg-muted">
              <Video className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 bg-[oklch(0.97_0.01_250)] space-y-3 scrollbar-thin">
            {currentThread.messages.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-[13px] shadow-elev-1 ${m.me ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground rounded-bl-sm"}`}
                >
                  {m.t}
                  <div
                    className={`text-[10px] mt-0.5 flex items-center gap-1 ${m.me ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {m.time || "Just now"}
                    {m.me && <CheckCheck className="size-3" />}
                  </div>
                </div>
              </div>
            ))}
            {/* AI Suggestion */}
            <div className="flex justify-start">
              <div className="bg-gradient-aurora text-white rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12px] flex items-center gap-2 shadow-elev-2">
                <Sparkles className="size-3.5" /> AI: Suggest replying with a Saturday tour
                confirmation + parking details template
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border p-3 bg-card">
            <div className="flex items-end gap-2">
              <button className="size-9 grid place-items-center rounded-lg hover:bg-muted">
                <Paperclip className="size-4" />
              </button>
              <button className="size-9 grid place-items-center rounded-lg hover:bg-muted">
                <Smile className="size-4" />
              </button>
              <textarea
                placeholder="Type a message or / for templates..."
                rows={1}
                className="flex-1 resize-none bg-muted rounded-xl px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSendMessage}
                className="size-9 grid place-items-center rounded-lg bg-primary text-primary-foreground"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-l border-border p-4 hidden md:block overflow-y-auto">
          <div className="text-center mb-4">
            <div className="size-16 rounded-full bg-gradient-brand grid place-items-center text-white font-bold text-lg mx-auto">
              {currentThread.avatar}
            </div>
            <div className="font-semibold mt-2">{currentThread.name}</div>
            <div className="text-[11px] text-muted-foreground">Lead L10245 · Score 92</div>{" "}
            {/* This "Lead L10245 · Score 92" is static, consider making it dynamic if data is available */}
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Program
              </div>
              <div className="text-[12px]">{currentThread.program}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Stage
              </div>
              <Badge tone="primary">Application Started</Badge>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Templates
              </div>
              <div className="space-y-1">
                {[
                  "Welcome message",
                  "Brochure share",
                  "Document checklist",
                  "Campus tour invite",
                  "Scholarship offer",
                ].map((t) => (
                  <button
                    key={t}
                    className="w-full text-left text-[12px] px-2 py-1.5 rounded-md hover:bg-muted"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

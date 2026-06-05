import { create } from "zustand";
import type {
  Conversation,
  ChatMessage,
  ChatTemplate,
  AutoResponse,
  AssignmentRule,
  WidgetConfig,
} from "@/types/communications";

const mockConversations: Conversation[] = [
  {
    id: "c1",
    channel: "whatsapp",
    status: "open",
    unread: 2,
    lastMessage: "Yes, I can attend the campus visit on Saturday.",
    lastTime: "2m",
    tags: ["hot-lead", "merit-scholar"],
    contact: {
      name: "Aarav Sharma",
      avatar: "AS",
      leadId: "L10245",
      program: "B.Tech Computer Science",
      stage: "Application Started",
      phone: "+91 98765 43210",
      email: "aarav.sharma@gmail.com",
      score: 92,
      assignedTo: "Priya Nair",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hi! I'm interested in B.Tech CSE at your Bengaluru campus.", time: "10:14 AM", status: "read" },
      { id: "m2", isMe: true, text: "Hi Aarav! Welcome 👋 I'm Priya from Acharya admissions. Happy to help. Could you share your 12th score?", time: "10:15 AM", status: "read" },
      { id: "m3", isMe: false, text: "I scored 91% in PCM. Also taking JEE Main.", time: "10:17 AM", status: "read" },
      { id: "m4", isMe: true, text: "Excellent! You're eligible for our Merit Scholarship up to 25%. Would you like to schedule a campus tour this Saturday?", time: "10:20 AM", status: "read" },
      { id: "m5", isMe: false, text: "Yes, I can attend the campus visit on Saturday.", time: "10:22 AM", status: "delivered" },
    ],
  },
  {
    id: "c2",
    channel: "instagram",
    status: "open",
    unread: 3,
    lastMessage: "Can you send me the college brochure? 🙏",
    lastTime: "8m",
    tags: ["new"],
    contact: {
      name: "Ishaan Kapoor",
      avatar: "IK",
      leadId: "L10289",
      program: "MBA Analytics",
      stage: "Inquiry",
      phone: "+91 87654 32109",
      email: "ishaan.k@yahoo.com",
      score: 74,
      assignedTo: "Unassigned",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hey! Saw your reel about MBA programs 🔥 What are the fees?", time: "9:45 AM", status: "read" },
      { id: "m2", isMe: true, text: "Hi Ishaan! Our MBA Analytics program starts at ₹3.5L per year. Would you like a detailed breakdown?", time: "9:50 AM", status: "read" },
      { id: "m3", isMe: false, text: "Yes please! Also what's the placement record?", time: "9:55 AM", status: "read" },
      { id: "m4", isMe: true, text: "Our latest batch had 98% placement with avg package of ₹8.2 LPA. Top recruiters: Deloitte, Accenture, Wipro.", time: "10:00 AM", status: "read" },
      { id: "m5", isMe: false, text: "Can you send me the college brochure? 🙏", time: "10:02 AM", status: "delivered" },
    ],
  },
  {
    id: "c3",
    channel: "facebook",
    status: "open",
    unread: 1,
    lastMessage: "What is the last date for application?",
    lastTime: "22m",
    tags: [],
    contact: {
      name: "Meera Krishnan",
      avatar: "MK",
      leadId: "L10301",
      program: "B.Arch",
      stage: "Offer Released",
      phone: "+91 76543 21098",
      email: "meera.krishnan@outlook.com",
      score: 85,
      assignedTo: "Rahul Verma",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hello, I saw your Facebook ad about Architecture programs. Is NATA score mandatory?", time: "9:10 AM", status: "read" },
      { id: "m2", isMe: true, text: "Hi Meera! Yes, NATA is required for B.Arch admission. Minimum score: 80 out of 200.", time: "9:20 AM", status: "read" },
      { id: "m3", isMe: false, text: "I got 110 in NATA. Am I eligible?", time: "9:35 AM", status: "read" },
      { id: "m4", isMe: true, text: "Absolutely! That's a great score. You're eligible. Want me to start your application?", time: "9:40 AM", status: "read" },
      { id: "m5", isMe: false, text: "What is the last date for application?", time: "9:48 AM", status: "delivered" },
    ],
  },
  {
    id: "c4",
    channel: "web",
    status: "bot",
    unread: 0,
    lastMessage: "Bot: Thank you! A counsellor will reach out soon.",
    lastTime: "35m",
    tags: ["bot-handled"],
    contact: {
      name: "Riya Joshi",
      avatar: "RJ",
      leadId: "L10315",
      program: "B.Sc Nursing",
      stage: "Inquiry",
      phone: "+91 65432 10987",
      email: "riya.joshi@gmail.com",
      score: 61,
      assignedTo: "Unassigned",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hi, I want to know about nursing admission 2026-27.", time: "9:05 AM", status: "read" },
      { id: "m2", isMe: true, text: "Hello! 👋 Welcome to Acharya Admissions. I can help with Nursing queries.", time: "9:05 AM", status: "read", },
      { id: "m3", isMe: false, text: "What are the eligibility criteria?", time: "9:06 AM", status: "read" },
      { id: "m4", isMe: true, text: "For B.Sc Nursing: 10+2 with PCB, minimum 45% marks. Karnataka CET score required for Karnataka domicile students.", time: "9:06 AM", status: "read" },
      { id: "m5", isMe: true, text: "Thank you! A counsellor will reach out soon.", time: "9:07 AM", status: "read" },
      { id: "sys1", isMe: false, text: "Bot auto-responded · Awaiting counsellor takeover", time: "9:07 AM", status: "read", isSystem: true },
    ],
  },
  {
    id: "c5",
    channel: "whatsapp",
    status: "open",
    unread: 0,
    lastMessage: "Okay, I'll share the documents today.",
    lastTime: "1h",
    tags: [],
    contact: {
      name: "Vihaan Reddy",
      avatar: "VR",
      leadId: "L10198",
      program: "MBBS",
      stage: "Docs Pending",
      phone: "+91 54321 09876",
      email: "vihaan.r@gmail.com",
      score: 78,
      assignedTo: "Priya Nair",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hi, what documents do I need to upload for the MBBS application?", time: "8:30 AM", status: "read" },
      { id: "m2", isMe: true, text: "Hi Vihaan! You'll need: 10th & 12th marksheets, NEET scorecard, valid ID proof, passport photo (white background).", time: "8:35 AM", status: "read" },
      { id: "m3", isMe: false, text: "Okay, I'll share the documents today.", time: "8:40 AM", status: "read" },
    ],
  },
  {
    id: "c6",
    channel: "instagram",
    status: "resolved",
    unread: 0,
    lastMessage: "Thank you so much! Got my admit card ✅",
    lastTime: "2h",
    tags: ["resolved"],
    contact: {
      name: "Diya Patel",
      avatar: "DP",
      leadId: "L10177",
      program: "B.Com LLB",
      stage: "Enrolled",
      phone: "+91 43210 98765",
      email: "diya.patel@gmail.com",
      score: 88,
      assignedTo: "Rahul Verma",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hi! I've completed my enrollment. How do I get my admit card?", time: "7:00 AM", status: "read" },
      { id: "m2", isMe: true, text: "Congrats Diya! 🎉 Your admit card will be on the student portal within 48 hours. Check: my.acharya.edu.in", time: "7:05 AM", status: "read" },
      { id: "m3", isMe: false, text: "Thank you so much! Got my admit card ✅", time: "9:00 AM", status: "read" },
      { id: "sys1", isMe: false, text: "Conversation resolved by Rahul Verma", time: "9:02 AM", status: "read", isSystem: true },
    ],
  },
  {
    id: "c7",
    channel: "facebook",
    status: "open",
    unread: 1,
    lastMessage: "Is there a hostel facility on campus?",
    lastTime: "3h",
    tags: ["outstation"],
    contact: {
      name: "Arjun Singh",
      avatar: "AS",
      leadId: "L10322",
      program: "B.Tech Mechanical",
      stage: "Inquiry",
      phone: "+91 32109 87654",
      email: "arjun.singh@hotmail.com",
      score: 67,
      assignedTo: "Unassigned",
    },
    messages: [
      { id: "m1", isMe: false, text: "I'm from Rajasthan, interested in B.Tech Mechanical. Is there a hostel facility on campus?", time: "6:45 AM", status: "read" },
    ],
  },
  {
    id: "c8",
    channel: "web",
    status: "open",
    unread: 4,
    lastMessage: "The fee payment portal shows an error 😟",
    lastTime: "5m",
    tags: ["urgent", "fee-issue"],
    contact: {
      name: "Saanvi Khan",
      avatar: "SK",
      leadId: "L10290",
      program: "Pharm.D",
      stage: "Payment Pending",
      phone: "+91 21098 76543",
      email: "saanvi.khan@gmail.com",
      score: 80,
      assignedTo: "Priya Nair",
    },
    messages: [
      { id: "m1", isMe: false, text: "Hi, I was trying to pay the application fee but the portal is not working.", time: "9:55 AM", status: "read" },
      { id: "m2", isMe: true, text: "Hi Saanvi! Sorry about that. Can you let me know what error you're seeing?", time: "9:56 AM", status: "read" },
      { id: "m3", isMe: false, text: "It says 'Payment gateway timeout'. I've tried 3 times!", time: "9:57 AM", status: "read" },
      { id: "m4", isMe: false, text: "The fee payment portal shows an error 😟", time: "10:00 AM", status: "delivered" },
    ],
  },
];

const mockTemplates: ChatTemplate[] = [
  { id: "t1", category: "welcome", title: "Welcome Message", content: "Hi {{name}}! 👋 Welcome to Acharya Admissions. I'm {{counsellor}} and I'll be helping you through the process. How can I assist you today?", },
  { id: "t2", category: "documents", title: "Document Checklist", content: "Please upload the following documents:\n• 10th Marksheet\n• 12th Marksheet\n• Valid ID Proof (Aadhar/Passport)\n• Passport-sized photograph\n• Entrance exam scorecard (if applicable)", },
  { id: "t3", category: "scholarship", title: "Scholarship Offer", content: "Great news {{name}}! Based on your academic profile, you are eligible for a {{percentage}}% Merit Scholarship. Would you like me to send you the scholarship letter?", },
  { id: "t4", category: "tour", title: "Campus Tour Invite", content: "We'd love to have you visit our campus! 🎓\n📅 Date: This Saturday, {{date}}\n⏰ Time: 10 AM – 1 PM\n📍 Location: Acharya Institute, Bengaluru\nReply YES to confirm your slot.", },
  { id: "t5", category: "fee", title: "Fee Payment Reminder", content: "Friendly reminder: Your application fee of ₹{{amount}} is due by {{date}}. Pay here: pay.acharya.edu.in\nFor any issues, reply to this message.", },
  { id: "t6", category: "followup", title: "Follow-up Message", content: "Hi {{name}}, just checking in on your application. Is there anything I can help you with? We're here to support you through every step 😊", },
  { id: "t7", category: "documents", title: "Brochure Share", content: "Here's our detailed brochure for {{program}}: 📄 bit.ly/acharya-brochure-2026\nFeel free to reach out if you have any questions!", channel: "whatsapp" },
];

const mockAutoResponses: AutoResponse[] = [
  { id: "ar1", trigger: "welcome", label: "Welcome Message", enabled: true, response: "Hi there! 👋 Welcome to Acharya Admissions. Our team typically responds within 2 hours. For urgent queries, call us at 1800-XXX-XXXX." },
  { id: "ar2", trigger: "away", label: "Outside Hours", enabled: true, response: "Thanks for reaching out! Our office hours are Mon–Sat, 9 AM – 6 PM IST. We'll get back to you first thing in the morning. 🙏" },
  { id: "ar3", trigger: "faq", label: "What are the fees?", enabled: true, response: "Our fee structure varies by program. B.Tech: ₹1.8L/yr, MBA: ₹3.5L/yr, MBBS: ₹12L/yr. For a detailed breakdown, say 'fee details'.", question: "fees" },
  { id: "ar4", trigger: "faq", label: "Is hostel available?", enabled: true, response: "Yes! We have separate boys' and girls' hostels with AC/non-AC options. Fees start at ₹80,000/year including meals. 🏠", question: "hostel" },
  { id: "ar5", trigger: "faq", label: "Admission process?", enabled: false, response: "Our admission process: 1) Fill online form 2) Upload documents 3) Pay application fee 4) Attend counselling 5) Receive offer letter. Takes ~5 working days.", question: "admission process" },
];

const mockAssignmentRules: AssignmentRule[] = [
  { id: "r1", label: "WhatsApp leads → Priya Nair", channel: "whatsapp", assignTo: "priya_nair", assignToLabel: "Priya Nair", priority: 1 },
  { id: "r2", label: "Instagram DMs → Round Robin", channel: "instagram", assignTo: "round_robin", assignToLabel: "Round Robin", priority: 2 },
  { id: "r3", label: "MBBS queries → Rahul Verma", program: "MBBS", assignTo: "rahul_verma", assignToLabel: "Rahul Verma", priority: 3 },
  { id: "r4", label: "Web queries → Round Robin", channel: "web", assignTo: "round_robin", assignToLabel: "Round Robin", priority: 4 },
  { id: "r5", label: "Facebook Messenger → Anita Singh", channel: "facebook", assignTo: "anita_singh", assignToLabel: "Anita Singh", priority: 5 },
];

type ChatStoreState = {
  conversations: Conversation[];
  activeConvId: string;
  templates: ChatTemplate[];
  autoResponses: AutoResponse[];
  assignmentRules: AssignmentRule[];
  widgetConfig: WidgetConfig;
  setActive: (id: string) => void;
  sendMessage: (convId: string, text: string) => void;
  resolveConversation: (convId: string) => void;
  reopenConversation: (convId: string) => void;
  updateWidgetConfig: (patch: Partial<WidgetConfig>) => void;
  addTemplate: (t: Omit<ChatTemplate, "id">) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, patch: Partial<ChatTemplate>) => void;
  addAutoResponse: (ar: Omit<AutoResponse, "id">) => void;
  deleteAutoResponse: (id: string) => void;
  toggleAutoResponse: (id: string) => void;
  addAssignmentRule: (rule: Omit<AssignmentRule, "id" | "priority">) => void;
  deleteAssignmentRule: (id: string) => void;
  markRead: (convId: string) => void;
};

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: mockConversations,
  activeConvId: mockConversations[0].id,
  templates: mockTemplates,
  autoResponses: mockAutoResponses,
  assignmentRules: mockAssignmentRules,
  widgetConfig: {
    chatName: "Acharya Admissions Support",
    greeting: "Hi there! 👋 How can we help you today?",
    primaryColor: "#6366f1",
    logoUrl: "",
    isLive: true,
  },

  setActive: (id) => set({ activeConvId: id }),

  markRead: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId ? { ...c, unread: 0 } : c,
      ),
    })),

  sendMessage: (convId, text) => {
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      isMe: true,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: "Now" }
          : c,
      ),
    }));
  },

  resolveConversation: (convId) => {
    const sysMsg: ChatMessage = {
      id: `sys${Date.now()}`,
      isMe: false,
      text: "Conversation marked as resolved",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read",
      isSystem: true,
    };
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, status: "resolved", messages: [...c.messages, sysMsg] }
          : c,
      ),
    }));
  },

  reopenConversation: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId ? { ...c, status: "open" } : c,
      ),
    })),

  updateWidgetConfig: (patch) =>
    set((s) => ({ widgetConfig: { ...s.widgetConfig, ...patch } })),

  addTemplate: (t) =>
    set((s) => ({
      templates: [...s.templates, { ...t, id: `t${Date.now()}` }],
    })),

  deleteTemplate: (id) =>
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

  updateTemplate: (id, patch) =>
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  addAutoResponse: (ar) =>
    set((s) => ({
      autoResponses: [...s.autoResponses, { ...ar, id: `ar${Date.now()}` }],
    })),

  deleteAutoResponse: (id) =>
    set((s) => ({ autoResponses: s.autoResponses.filter((r) => r.id !== id) })),

  toggleAutoResponse: (id) =>
    set((s) => ({
      autoResponses: s.autoResponses.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r,
      ),
    })),

  addAssignmentRule: (rule) =>
    set((s) => ({
      assignmentRules: [
        ...s.assignmentRules,
        { ...rule, id: `r${Date.now()}`, priority: s.assignmentRules.length + 1 },
      ],
    })),

  deleteAssignmentRule: (id) =>
    set((s) => ({ assignmentRules: s.assignmentRules.filter((r) => r.id !== id) })),
}));

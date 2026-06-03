// Realistic mock data for ACHARYA ONE CRM

export const campuses = [
  { id: "blr", name: "Bengaluru Main", code: "BLR-01" },
  { id: "myr", name: "Mysuru Campus", code: "MYR-02" },
  { id: "hyd", name: "Hyderabad Tech", code: "HYD-03" },
  { id: "del", name: "Delhi NCR", code: "DEL-04" },
];

export const programs = [
  "B.Tech Computer Science",
  "B.Tech AI & ML",
  "B.Tech Mechanical",
  "BBA",
  "BBA International",
  "MBA",
  "MBA Analytics",
  "B.Sc Data Science",
  "B.Arch",
  "Pharm.D",
  "MBBS",
  "LL.B",
];

export const sources = [
  "Google Ads",
  "Facebook",
  "Instagram",
  "Organic",
  "Referral",
  "Channel Partner",
  "Walk-in",
  "Education Fair",
];

export const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Application Started",
  "Documents Pending",
  "Verified",
  "Offer Sent",
  "Enrolled",
  "Dropped",
];

export const counsellors = [
  {
    id: "c1",
    name: "Priya Sharma",
    avatar: "PS",
    load: 42,
    conv: 28,
    rating: 4.8,
    campus: "BLR-01",
  },
  {
    id: "c2",
    name: "Rahul Verma",
    avatar: "RV",
    load: 38,
    conv: 31,
    rating: 4.9,
    campus: "BLR-01",
  },
  {
    id: "c3",
    name: "Ananya Iyer",
    avatar: "AI",
    load: 51,
    conv: 24,
    rating: 4.6,
    campus: "MYR-02",
  },
  {
    id: "c4",
    name: "Karan Mehta",
    avatar: "KM",
    load: 29,
    conv: 35,
    rating: 4.7,
    campus: "HYD-03",
  },
  {
    id: "c5",
    name: "Neha Kapoor",
    avatar: "NK",
    load: 44,
    conv: 26,
    rating: 4.5,
    campus: "DEL-04",
  },
];

const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Ananya",
  "Diya",
  "Saanvi",
  "Aadhya",
  "Pari",
  "Anika",
  "Navya",
  "Myra",
  "Kiara",
  "Sara",
];
const lastNames = [
  "Sharma",
  "Verma",
  "Iyer",
  "Patel",
  "Reddy",
  "Khan",
  "Singh",
  "Gupta",
  "Mehta",
  "Nair",
  "Bhat",
  "Rao",
  "Joshi",
  "Kapoor",
];
const cities = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Dubai",
  "Singapore",
  "Toronto",
];

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
const r = rng(42);
const pick = <T>(arr: T[]) => arr[Math.floor(r() * arr.length)];

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  program: string;
  campus: string;
  source: string;
  stage: string;
  score: number;
  counsellor: string;
  createdAt: string;
  lastActivity: string;
  value: number;
  tags: string[];
  intent: "Hot" | "Warm" | "Cold";
};

export const leads: Lead[] = Array.from({ length: 60 }).map((_, i) => {
  const fn = pick(firstNames),
    ln = pick(lastNames);
  const stage = pick(stages);
  const score = Math.floor(40 + r() * 60);
  return {
    id: `L${(10234 + i).toString()}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`,
    phone: `+91 9${Math.floor(100000000 + r() * 899999999)}`,
    city: pick(cities),
    country: r() > 0.85 ? "International" : "India",
    program: pick(programs),
    campus: pick(campuses).code,
    source: pick(sources),
    stage,
    score,
    counsellor: pick(counsellors).name,
    createdAt: `${1 + Math.floor(r() * 28)} Apr 2025`,
    lastActivity: `${Math.floor(r() * 12)}h ago`,
    value: Math.floor(150 + r() * 600) * 1000,
    tags: r() > 0.6 ? ["Scholarship", "Priority"] : ["New"],
    intent: score > 75 ? "Hot" : score > 55 ? "Warm" : "Cold",
  };
});

export const funnelData = [
  { stage: "Leads", value: 12480, color: "var(--chart-1)" },
  { stage: "Contacted", value: 8920, color: "var(--chart-2)" },
  { stage: "Qualified", value: 5640, color: "var(--chart-3)" },
  { stage: "Applications", value: 3210, color: "var(--chart-4)" },
  { stage: "Offers", value: 1840, color: "var(--chart-5)" },
  { stage: "Enrolled", value: 1240, color: "var(--chart-1)" },
];

export const monthlyTrend = [
  { m: "Nov", leads: 1820, applications: 540, enrolled: 210 },
  { m: "Dec", leads: 2140, applications: 680, enrolled: 245 },
  { m: "Jan", leads: 2680, applications: 820, enrolled: 312 },
  { m: "Feb", leads: 3120, applications: 1040, enrolled: 384 },
  { m: "Mar", leads: 3580, applications: 1180, enrolled: 442 },
  { m: "Apr", leads: 4120, applications: 1420, enrolled: 520 },
];

export const sourceMix = [
  { name: "Google Ads", value: 38, cost: 1820000 },
  { name: "Meta Ads", value: 24, cost: 980000 },
  { name: "Organic", value: 18, cost: 0 },
  { name: "Channel Partners", value: 12, cost: 640000 },
  { name: "Referrals", value: 8, cost: 0 },
];

export const campusPerf = campuses.map((c, i) => ({
  campus: c.name,
  target: 1200 + i * 200,
  achieved: 980 + Math.floor(r() * 600),
  revenue: 4.2 + r() * 3,
}));

export const notifications = [
  {
    id: 1,
    type: "lead",
    title: "New hot lead from Google Ads",
    desc: "Aarav Sharma · B.Tech CS · Score 92",
    time: "2m ago",
  },
  {
    id: 2,
    type: "doc",
    title: "Document verification pending",
    desc: "12 applications awaiting review",
    time: "18m ago",
  },
  {
    id: 3,
    type: "payment",
    title: "Fee payment received",
    desc: "₹1,80,000 from Diya Patel",
    time: "1h ago",
  },
  {
    id: 4,
    type: "ai",
    title: "AI: Lead drop-off risk detected",
    desc: "8 qualified leads inactive for 5+ days",
    time: "3h ago",
  },
  {
    id: 5,
    type: "approval",
    title: "Scholarship approval needed",
    desc: "Merit-based 40% — Karan Mehta",
    time: "5h ago",
  },
];

export const applications = leads.slice(0, 24).map((l, i) => ({
  id: `APP-${2025000 + i}`,
  student: l.name,
  program: l.program,
  campus: l.campus,
  progress: Math.floor(20 + r() * 80),
  status: pick(["Draft", "Submitted", "Under Review", "Documents Pending", "Approved", "Rejected"]),
  fee: l.value,
  submitted: l.createdAt,
}));

export const documents = [
  { id: "D1", student: "Aarav Sharma", type: "10th Marksheet", status: "Verified", confidence: 98 },
  { id: "D2", student: "Diya Patel", type: "12th Marksheet", status: "Pending", confidence: 0 },
  { id: "D3", student: "Vihaan Reddy", type: "Aadhaar", status: "Mismatch", confidence: 64 },
  { id: "D4", student: "Saanvi Khan", type: "Passport", status: "Verified", confidence: 96 },
  {
    id: "D5",
    student: "Arjun Singh",
    type: "Income Certificate",
    status: "Fraud Flag",
    confidence: 22,
  },
  {
    id: "D6",
    student: "Anika Gupta",
    type: "Transfer Certificate",
    status: "Verified",
    confidence: 94,
  },
];

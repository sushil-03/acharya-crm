# Automation Feature — Implementation Plan

## Business Context

**Acharya Institutes** is a large multi-college university group. This CRM ("Acharya One") manages the entire student acquisition funnel — from first inquiry (lead) to admission and handoff to the college ERP (being built separately).

**Core flow a lead goes through:**

```
Inquiry / Lead Created
  → Lead Assigned to Counsellor
    → Counsellor Follow-ups (calls, WhatsApp, email)
      → Application Submitted
        → Documents Collected
          → Verification
            → Admission Decision
              → Fee Payment
                → Enrollment → ERP handoff
```

**How leads enter the CRM:**

| Source          | Mechanism                                                        |
| --------------- | ---------------------------------------------------------------- |
| College Website | Embedded inquiry form (JS snippet) — POSTs to CRM API            |
| WhatsApp        | WhatsApp Business API webhook → lead created automatically       |
| Facebook Ads    | Meta Lead Gen Forms → Zapier/webhook → CRM API                   |
| Google Ads      | Google Lead Form Extensions → webhook → CRM API                  |
| Walk-in         | Counsellor manually creates lead from front desk                 |
| Phone Call      | Inbound call tracking → activity logged, lead matched or created |
| Agent/Partner   | Channel partner portal submission                                |

The **lead source** (Facebook, Google, WhatsApp, Walk-in, etc.) is one of the most important fields for automation branching — different sources get different assignment rules, follow-up sequences, and SLA timers.

**Why Automation matters here:**

- Hundreds of leads per day across many colleges and programs, from multiple channels simultaneously
- Counsellors can't manually follow up on every stage transition — especially for digital leads who expect instant response
- Missed follow-ups within the first hour = lost admissions (speed-to-lead is critical)
- The automation engine handles the in-between steps automatically: assign leads by source/program, send instant acknowledgement, remind counsellors, update stages, trigger ERP sync via webhook when a student is admitted

---

## Overview

Build a visual workflow automation builder for the Acharya One CRM, similar to LeadSquared's automation module. Users can create event-driven automations: pick a trigger → add conditions (If/Else) → add wait steps → execute actions. Frontend-only demo using localStorage for persistence.

---

## 1. Dependency to Add

```bash
pnpm add @xyflow/react
```

`@xyflow/react` is the current package (reactflow v12+). It replaces the old `reactflow` package and has first-class React 19 support. It is **not currently installed** in `package.json`.

---

## 2. Sidebar Change

**File:** `src/components/app-sidebar.tsx`

Add a new group called `"Automation"` between the `"Growth"` and `"Experience"` groups in the `groups` array. Import the `Zap` icon from `lucide-react`.

```ts
{
  label: "Automation",
  items: [
    { to: "/automation", label: "Automation", icon: Zap },
  ],
},
```

---

## 3. Routes to Create

TanStack Router uses file-based routing in `src/routes/`. Two new files:

| File                                      | URL               | Purpose                              |
| ----------------------------------------- | ----------------- | ------------------------------------ |
| `src/routes/automation.tsx`               | `/automation`     | List of all automations (table view) |
| `src/routes/automation.$automationId.tsx` | `/automation/:id` | Full-screen flow builder canvas      |

The builder uses a special layout (no sidebar, full-screen canvas), so it **does not** use `AppShell`. It renders its own top bar with Save/Publish controls.

---

## 4. Data Model

**File:** `src/lib/automation-types.ts` (new)

```ts
// Node types available on the canvas
export type NodeKind = "trigger" | "condition" | "wait" | "action" | "end";

export interface AutomationNodeData {
  kind: NodeKind;
  label: string;
  description?: string;
  // For trigger nodes
  triggerCategory?: string; // e.g. "Lead", "Opportunity"
  triggerActName?: string; // e.g. "Lead Created"
  // For condition nodes
  conditionField?: string; // e.g. "Lead Source"
  conditionOp?: string; // e.g. "is", "is not", "contains"
  conditionValue?: string;
  // For wait nodes
  waitDuration?: number;
  waitUnit?: "minutes" | "hours" | "days";
  // For action nodes
  actionType?: string; // e.g. "Send Email", "Update Lead", "Webhook"
  actionConfig?: Record<string, string>;
}

export interface AutomationFlow {
  id: string;
  name: string;
  status: "draft" | "published";
  triggerType: string; // Human-readable e.g. "Lead Created"
  triggerCount: number; // Simulated counter for demo
  lastPublishedOn: string | null;
  modifiedOn: string;
  modifiedBy: string;
  nodes: import("@xyflow/react").Node<AutomationNodeData>[];
  edges: import("@xyflow/react").Edge[];
}
```

**File:** `src/lib/automation-store.ts` (new)

Provides `get/save/delete` helpers that read/write to `localStorage` key `"acharya_automations"`. Also exports `mockAutomations: AutomationFlow[]` — 3 pre-built examples shown on first load (seeded into localStorage if empty).

---

## 5. Mock Data — Pre-built Automations

Six example automations to seed (matching real Acharya workflows):

1. **"New Lead Auto-Assign & Welcome"** _(Published, 237K triggers)_ — Trigger: Lead Created → Multi If/Else (Lead Source) → Facebook: Assign to Digital Team + Send WhatsApp / Google: Assign to Digital Team + Send SMS / Walk-in: Assign to Front Desk Counsellor + Send Welcome SMS / Other: Assign round-robin
2. **"Website Lead Instant Response"** _(Published)_ — Trigger: Lead Created (Source = Website) → Wait 2 min → Send WhatsApp "Thanks for your inquiry" → Assign Task to counsellor (Call within 1 hour)
3. **"Application Follow-up"** _(Published, 82K triggers)_ — Trigger: Opportunity Added → Wait 1 day → Send WhatsApp → Wait 2 days → If/Else (Application Submitted?) → Yes: Send acknowledgement email / No: Assign Task to counsellor + Send nudge SMS
4. **"Admission Decision Notify + ERP Sync"** _(Published)_ — Trigger: Admission Decision Updated → If/Else (Decision = Approved) → Yes: Send Offer Letter Email + Push to ERP (webhook) / No: Send Rejection Email + Update Lead Stage
5. **"Document Pending Reminder"** _(Draft)_ — Trigger: Lead Updated (stage = Documents Pending) → Wait 2 days → Send SMS reminder → Wait 3 days → Assign Task to counsellor → Wait 2 days → Send WhatsApp escalation
6. **"Fee Payment Nudge"** _(Published, 4K triggers)_ — Trigger: Opportunity Added (stage = Fee Pending) → Wait 1 day → Send WhatsApp → Wait 2 days → Send Email → Wait 3 days → Log Activity (escalate)

These cover: multi-source branching, linear sequences, conditional branching, and ERP integration.

---

## 6. Automation List Page (`/automation`)

**File:** `src/routes/automation.tsx`

Uses `AppShell` and matches the existing page pattern (`PageHeader` + content).

### Layout

```
PageHeader
  title: "Automation"
  action: "+ Create Automation" button (opens TemplateSelectModal)

Filters row
  Search input | Trigger Type dropdown | Status dropdown | Modified On dropdown

Table
  Columns: Name | Trigger Type | Trigger Count | Last Published On | Status | Modified On | Modified By | Actions
  Name cell is a Link → /automation/$id
  Status badge: "Published" (success) | "Draft" (muted)
  Actions cell: gear icon → dropdown (Edit, Clone, Delete, Publish/Unpublish)

Right panel (collapsible, 280px)
  "+ Create Automation" primary CTA button
  Related Settings links:
    - Automation Failure Report
    - Automation Termination Report
```

### State

- `automations` — loaded from `automation-store`
- `search`, `triggerTypeFilter`, `statusFilter` — local `useState`
- `showTemplateModal` — controls template picker dialog

---

## 7. Template Select Modal

**File:** `src/components/automation/TemplateSelectModal.tsx`

Opened when clicking "+ Create Automation" on the list page.

### Layout

Two-column dialog (640px wide):

- **Left:** Category list — All | Recommended | Inbound Prospect Follow-up | Customer Follow-up | Re-engagement | Engagement | Finish Purchase | Onboarding Email | Internal User Engagement
- **Right:** Template cards
  - "Build from Scratch" (Blank) — always first
  - Pre-built templates (3 matching mock automations)

On select:

- If "Blank" → create new `AutomationFlow` with empty nodes, navigate to `/automation/$newId`
- If template → clone the template flow, navigate to builder

---

## 8. Automation Builder (`/automation/$automationId`)

**File:** `src/routes/automation.$automationId.tsx`

Full-screen page (no `AppShell`, no sidebar). Layout:

```
┌─────────────────────────────────────────────────────────┐
│ TopBar: [← home] [● Name (Draft)] [✏] ... Save Publish  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              React Flow Canvas                           │
│                                                          │
│         "Your Automation starts here"                    │
│                  [+ Add your Trigger]                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
         [ zoom controls bottom-right ]
```

### Toolbar actions

- **Save** — writes to localStorage, status stays "draft"
- **Publish** — sets `status: "published"`, sets `lastPublishedOn`, saves
- **Unpublish** — sets `status: "draft"`
- **Undo / Redo** — TanStack's `useHistoryStore` or simple stack via `useState`
- **Name edit** — inline pencil icon → input field

---

## 9. Node Types

All custom nodes live in `src/components/automation/nodes/`.

### 9a. TriggerNode (`trigger`)

- Dashed border when empty ("+ Add your Trigger")
- Solid card when configured: title = trigger displayName, subtitle = description
- Green bottom bar (active color)
- Clicking opens `TriggerSelectModal`
- Single output handle at bottom

### 9b. ConditionNode (`condition`)

- Title: "If/Else" or "Multi If/Else"
- Shows condition summary (e.g., "Lead Source is Inbound...")
- Red bottom bar
- Two output handles: **Yes** (left, green arrow) and **No** (right, red arrow)
- Clicking opens `ConditionPanel` in right side drawer

### 9c. WaitNode (`wait`)

- Title: "Wait"
- Shows duration (e.g., "Wait for 3 Minutes")
- Yellow/amber bottom bar
- Single output handle at bottom
- Clicking opens `WaitPanel` in right side drawer

### 9d. ActionNode (`action`)

- Title: action type (e.g., "Send Email", "Update Lead", "Webhook")
- Shows brief config summary
- Blue bottom bar
- Single output handle at bottom
- Clicking opens `ActionPanel` in right side drawer

### 9e. AddButtonNode (`add-button`)

- Rendered as a small `+` circle between nodes on each edge
- Clicking opens an `AddStepMenu` popover with options:
  - Add Condition (If/Else)
  - Add Wait
  - Add Action
  - Add End

### 9f. EndNode (`end`)

- Terminal node, no output handle
- Rendered as a small circle/diamond

---

## 10. Modals and Panels

### TriggerSelectModal

**File:** `src/components/automation/TriggerSelectModal.tsx`

Two-column modal using data from `src/lib/automation.ts`:

- **Left:** Category tabs — Lead Trigger | Opportunity Trigger | Activity Trigger | User Trigger | Task Trigger | At Regular Intervals
- **Right:** List of triggers for selected category
  - Each item: colored avatar icon + displayName (bold) + description
  - Active selection highlighted in green
  - Confirm button sets trigger on the node

### ConditionPanel (Right Drawer)

**File:** `src/components/automation/panels/ConditionPanel.tsx`

Slide-in sheet from the right (360px):

- Condition type: "If/Else" | "Multi If/Else"
- Field selector (Lead Source, Owner, Program, etc.)
- Operator selector (is, is not, contains, is defined, is not defined)
- Value input
- Save / Cancel

### WaitPanel (Right Drawer)

**File:** `src/components/automation/panels/WaitPanel.tsx`

- Duration number input
- Unit selector: Minutes | Hours | Days
- Save / Cancel

### ActionPanel (Right Drawer)

**File:** `src/components/automation/panels/ActionPanel.tsx`

Action types are grouped into categories matching the admissions workflow:

**Communication**

- Send Email — to: Lead / Counsellor / Parent, subject, body template
- Send SMS — to: Lead / Counsellor, message template
- Send WhatsApp — message template (key channel at Acharya)

**Lead Management**

- Assign Lead — assign to counsellor (by role, round-robin, or specific user)
- Update Lead Field — field selector + new value (stage, source, intent score, etc.)
- Add Lead to List — static list selector
- Change Lead Stage — direct stage mover (Draft → Submitted → Under Review → etc.)

**Task & Activity**

- Assign Task — title, due in X days, assignee
- Log Activity — type (call, visit, follow-up), notes

**Admissions Process**

- Send Document Request — request specific docs from lead
- Trigger Verification — push lead into verification queue
- Send Offer Letter — template email with scholarship/program details
- Update Admission Decision — Approved / Rejected / Waitlisted

**ERP Integration (Webhook)**

- Push to ERP — POST lead/admission data to ERP endpoint (used when student is admitted and enrollment is confirmed)
- Webhook — generic HTTP call with configurable URL + payload

Dynamic config form renders based on selected action type. Save / Cancel.

---

## 11. React Flow Configuration

```tsx
// In the builder
const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  wait: WaitNode,
  action: ActionNode,
  "add-button": AddButtonNode,
  end: EndNode,
};

// Initial state for blank automation
const initialNodes = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 0, y: 0 },
    data: { kind: "trigger", label: "+ Add your Trigger" },
  },
];
```

Use `useNodesState` and `useEdgesState` from `@xyflow/react`. Persist to localStorage on every change (debounced 500ms).

Edge style: animated dashed lines while in draft, solid lines when published. Use `SmoothStepEdge` for clean right-angle routing.

---

## 12. File Structure Summary

```
src/
├── lib/
│   ├── automation.ts              (existing — trigger definitions)
│   ├── automation-types.ts        (NEW — TypeScript interfaces)
│   └── automation-store.ts        (NEW — localStorage CRUD + mock seeds)
│
├── routes/
│   ├── automation.tsx             (NEW — list page)
│   └── automation.$automationId.tsx (NEW — builder page)
│
└── components/
    └── automation/
        ├── TemplateSelectModal.tsx (NEW)
        ├── TriggerSelectModal.tsx  (NEW)
        ├── nodes/
        │   ├── TriggerNode.tsx     (NEW)
        │   ├── ConditionNode.tsx   (NEW)
        │   ├── WaitNode.tsx        (NEW)
        │   ├── ActionNode.tsx      (NEW)
        │   ├── AddButtonNode.tsx   (NEW)
        │   └── EndNode.tsx         (NEW)
        └── panels/
            ├── ConditionPanel.tsx  (NEW)
            ├── WaitPanel.tsx       (NEW)
            └── ActionPanel.tsx     (NEW)
```

**Sidebar file to modify:**

- `src/components/app-sidebar.tsx` — add Automation group + `Zap` icon import

---

## 13. Implementation Order

1. `pnpm add @xyflow/react`
2. Create `automation-types.ts` and `automation-store.ts`
3. Update `app-sidebar.tsx` — add Automation nav group
4. Create `automation.tsx` list page with mock data table
5. Create `TemplateSelectModal.tsx`
6. Create builder route `automation.$automationId.tsx` skeleton with ReactFlow canvas
7. Build all node components (TriggerNode first, then others)
8. Build `TriggerSelectModal.tsx` using `automationTriggers` from `automation.ts`
9. Build the three panels (Condition, Wait, Action)
10. Wire up `AddButtonNode` to insert new nodes mid-flow
11. Connect Save / Publish / Undo toolbar
12. End-to-end test: create blank → pick trigger → add If/Else → add actions → save → publish

---

## 14. Verification

- Navigate to `/automation` — list shows 3 seeded automations
- Click "+ Create Automation" → Template modal opens
- Select "Build from Scratch" → navigate to `/automation/:newId`
- Canvas shows "Your Automation starts here" with dashed trigger node
- Click trigger node → trigger modal opens, categories render from `automation.ts`
- Select "New Lead" → node updates with label and description
- Click "+" below trigger → popover shows Add Condition / Wait / Action
- Add If/Else → node appears with Yes/No handles and colored bottom bar
- Click If/Else node → right panel opens for condition config
- Add Wait node → yellow bar, duration configurable
- Add Action node → action type selector + config form
- Save → persists to localStorage, refresh retains state
- Publish → status badge changes to "Published", header shows green dot
- Return to `/automation` list → new automation appears in table

---

## 15. Design Notes

- Node cards: `bg-card border border-border rounded-xl shadow-elev-1`, 240px wide
- Bottom colored bar: 4px height, `rounded-b-xl`
  - Trigger: `bg-success` (green)
  - Condition: `bg-danger` (red)
  - Wait: `bg-warning` (amber)
  - Action: `bg-info` (blue)
  - End: `bg-muted`
- Canvas background: dot grid pattern (ReactFlow `<Background variant="dots" />`)
- MiniMap: shown bottom-right above zoom controls
- All panels use `Sheet` from `src/components/ui/sheet.tsx`
- All modals use `Dialog` from `src/components/ui/dialog.tsx`
- Icons: Lucide React (`Zap` for sidebar, `GitMerge` for condition, `Clock` for wait, `Play` for action)

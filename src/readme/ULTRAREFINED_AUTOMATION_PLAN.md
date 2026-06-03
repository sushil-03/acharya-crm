Here is a draft plan to refine:

# Automation Feature — Implementation Plan

## Context

**Acharya Institutes** is a multi-college university group. This CRM manages the full student acquisition funnel: Lead → Counsellor Assignment → Application → Documents → Verification → Admission Decision → Fee → Enrollment → ERP handoff. The automation engine handles in-between steps automatically (assign leads, send reminders, change stages, push to ERP via webhook) so counsellors don't miss follow-ups on the hundreds of daily leads across many colleges.

User wants to add a new "Automation" section to the sidebar and build a full visual workflow automation builder (like LeadSquared). The feature lets users create event-driven automations using triggers from `src/lib/automation.ts`, then chain conditions (If/Else), waits, and actions on a React Flow canvas. Frontend-only demo using localStorage. Detailed plan document written to `src/readme/AUTOMATION_PLAN.md`.

---

## Step 1 — Install dependency

```bash
pnpm add @xyflow/react
```

`@xyflow/react` is not in `package.json`. This is required for the canvas builder.

---

## Step 2 — Sidebar (`src/components/app-sidebar.tsx`)

- Import `Zap` from `lucide-react`
- Add new group object between `"Growth"` and `"Experience"`:

```ts
{ label: "Automation", items: [{ to: "/automation", label: "Automation", icon: Zap }] }
```

---

## Step 3 — Data layer

- **`src/lib/automation-types.ts`** — TypeScript interfaces: `NodeKind`, `AutomationNodeData`, `AutomationFlow`
- **`src/lib/automation-store.ts`** — localStorage CRUD helpers + 3 seeded mock automations

---

## Step 4 — Automation list page (`src/routes/automation.tsx`)

Uses `AppShell` + `PageHeader`. Shows a table of automations (Name, Trigger Type, Trigger Count, Status, Modified On). "+ Create Automation" button opens TemplateSelectModal. Right collapsible panel with related settings links.

---

## Step 5 — Template Select Modal (`src/components/automation/TemplateSelectModal.tsx`)

Two-column dialog: category list on left, template cards on right. "Build from Scratch" creates blank flow. Pre-built templates clone a seeded automation. Navigation goes to `/automation/:newId`.

---

## Step 6 — Builder route (`src/routes/automation.$automationId.tsx`)

Full-screen (no AppShell). Custom top bar with name, Save/Publish/Undo. ReactFlow canvas. Persists to localStorage on change (debounced 500ms).

---

## Step 7 — Node components (`src/components/automation/nodes/`)

Six node types, each a custom React component:

- **TriggerNode** — dashed when empty, green bottom bar, opens TriggerSelectModal on click
- **ConditionNode** — red bottom bar, Yes/No output handles, opens ConditionPanel
- **WaitNode** — amber bottom bar, shows duration, opens WaitPanel
- **ActionNode** — blue bottom bar, shows action type, opens ActionPanel
- **AddButtonNode** — "+" circle on edges, opens step-type popover
- **EndNode** — terminal, no output

---

## Step 8 — Trigger Select Modal (`src/components/automation/TriggerSelectModal.tsx`)

Uses `automationTriggers` from `src/lib/automation.ts`. Left column: category tabs (Lead, Opportunity, Activity, User, Task, Cron). Right: trigger list per category. Confirm sets trigger on the node.

---

## Step 9 — Configuration panels (`src/components/automation/panels/`)

Three `Sheet` drawers (right side):

- **ConditionPanel** — field / operator / value for If/Else config
- **WaitPanel** — duration number + unit (minutes/hours/days)
- **ActionPanel** — action type selector (Send Email, SMS, Update Lead, Webhook) + dynamic config form

---

## Critical files

| File                                      | Action                               |
| ----------------------------------------- | ------------------------------------ |
| `src/components/app-sidebar.tsx`          | Modify — add Automation group        |
| `src/lib/automation.ts`                   | Read-only — data source for triggers |
| `src/lib/automation-types.ts`             | Create new                           |
| `src/lib/automation-store.ts`             | Create new                           |
| `src/routes/automation.tsx`               | Create new                           |
| `src/routes/automation.$automationId.tsx` | Create new                           |
| `src/components/automation/`              | Create new directory + 9 files       |

---

## Verification

1. `/automation` loads — shows 3 seeded automations in table
2. "+ Create Automation" → template modal with categories
3. "Build from Scratch" → navigates to builder with empty canvas
4. Click trigger node → trigger modal opens with categories from automation.ts
5. Add steps via "+" nodes — condition/wait/action appear correctly
6. Panels open on node click, config saves to node data
7. Save → localStorage persisted, survives refresh
8. Publish → status badge changes, header shows "Published"
9. Return to list → automation appears with correct status

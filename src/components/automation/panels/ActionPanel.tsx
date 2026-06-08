import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import type { AutomationNodeData } from "../../../types/automation-types";

const ACTION_TYPES = [
  { group: "Communication", actions: ["Send Email", "Send SMS", "Send WhatsApp"] },
  {
    group: "Lead Management",
    actions: ["Assign Lead", "Update Lead", "Add Lead to List", "Change Lead Stage"],
  },
  { group: "Task & Activity", actions: ["Assign Task", "Log Activity"] },
  {
    group: "Admissions Process",
    actions: [
      "Send Document Request",
      "Trigger Verification",
      "Send Offer Letter",
      "Update Admission Decision",
    ],
  },
  { group: "ERP Integration", actions: ["Push to ERP", "Webhook"] },
];

const ALL_ACTIONS = ACTION_TYPES.flatMap((g) => g.actions);

interface Props {
  open: boolean;
  data: AutomationNodeData | null;
  onClose: () => void;
  onSave: (patch: Partial<AutomationNodeData>) => void;
}

export function ActionPanel({ open, data, onClose, onSave }: Props) {
  const [actionType, setActionType] = useState("Send Email");
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      setActionType(data.actionType ?? "Send Email");
      setConfig(data.actionConfig ?? {});
    }
  }, [data]);

  function set(key: string, val: string) {
    setConfig((c) => ({ ...c, [key]: val }));
  }

  function handleSave() {
    const description = buildDescription(actionType, config);
    onSave({ actionType, actionConfig: config, label: actionType, description });
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Action</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Action Type</Label>
            <Select
              value={actionType}
              onValueChange={(v) => {
                setActionType(v);
                setConfig({});
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((g) => (
                  <div key={g.group}>
                    <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.group}
                    </div>
                    {g.actions.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ActionConfig actionType={actionType} config={config} set={set} />
        </div>
        <div className="mt-8 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActionConfig({
  actionType,
  config,
  set,
}: {
  actionType: string;
  config: Record<string, string>;
  set: (k: string, v: string) => void;
}) {
  switch (actionType) {
    case "Send Email":
    case "Send Offer Letter":
      return (
        <>
          <Field
            label="To"
            value={config.to ?? ""}
            onChange={(v) => set("to", v)}
            placeholder="Lead email / {Lead.Email}"
          />
          <Field
            label="Subject"
            value={config.subject ?? ""}
            onChange={(v) => set("subject", v)}
            placeholder="Email subject"
          />
          <TextareaField
            label="Body"
            value={config.body ?? ""}
            onChange={(v) => set("body", v)}
            placeholder="Email body..."
          />
        </>
      );
    case "Send SMS":
    case "Send WhatsApp":
      return (
        <>
          <Field
            label="To"
            value={config.to ?? ""}
            onChange={(v) => set("to", v)}
            placeholder="{Lead.Phone}"
          />
          <TextareaField
            label="Message"
            value={config.message ?? ""}
            onChange={(v) => set("message", v)}
            placeholder="Message content..."
          />
        </>
      );
    case "Assign Lead":
      return (
        <SelectField
          label="Assign To"
          value={config.assignTo ?? ""}
          onChange={(v) => set("assignTo", v)}
          options={["Round Robin", "Specific Counsellor", "By Program", "By Campus", "Team Lead"]}
        />
      );
    case "Update Lead":
    case "Change Lead Stage":
      return (
        <>
          <SelectField
            label="Field"
            value={config.field ?? ""}
            onChange={(v) => set("field", v)}
            options={["Stage", "Source", "Intent Score", "Assigned To", "Program", "Campus"]}
          />
          <Field
            label="New Value"
            value={config.value ?? ""}
            onChange={(v) => set("value", v)}
            placeholder="New value"
          />
        </>
      );
    case "Assign Task":
      return (
        <>
          <Field
            label="Task Title"
            value={config.title ?? ""}
            onChange={(v) => set("title", v)}
            placeholder="Task title"
          />
          <Field
            label="Due In (days)"
            value={config.dueIn ?? ""}
            onChange={(v) => set("dueIn", v)}
            placeholder="1"
            type="number"
          />
          <SelectField
            label="Assign To"
            value={config.assignTo ?? ""}
            onChange={(v) => set("assignTo", v)}
            options={["Lead's Counsellor", "Team Lead", "Any Available"]}
          />
        </>
      );
    case "Update Admission Decision":
      return (
        <SelectField
          label="Decision"
          value={config.decision ?? ""}
          onChange={(v) => set("decision", v)}
          options={["Approved", "Rejected", "Waitlisted", "Deferred"]}
        />
      );
    case "Push to ERP":
      return (
        <>
          <Field
            label="ERP Endpoint URL"
            value={config.url ?? ""}
            onChange={(v) => set("url", v)}
            placeholder="https://erp.acharya.ac.in/api/admissions"
          />
          <SelectField
            label="Method"
            value={config.method ?? "POST"}
            onChange={(v) => set("method", v)}
            options={["POST", "PUT"]}
          />
        </>
      );
    case "Webhook":
      return (
        <>
          <Field
            label="URL"
            value={config.url ?? ""}
            onChange={(v) => set("url", v)}
            placeholder="https://..."
          />
          <SelectField
            label="Method"
            value={config.method ?? "POST"}
            onChange={(v) => set("method", v)}
            options={["POST", "PUT", "GET"]}
          />
          <TextareaField
            label="Payload (JSON)"
            value={config.payload ?? ""}
            onChange={(v) => set("payload", v)}
            placeholder='{"key": "value"}'
          />
        </>
      );
    default:
      return null;
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function buildDescription(actionType: string, config: Record<string, string>): string {
  switch (actionType) {
    case "Send Email":
      return config.subject ? `Email: ${config.subject}` : "Send email to lead";
    case "Send SMS":
      return config.message ? config.message.slice(0, 40) : "Send SMS to lead";
    case "Send WhatsApp":
      return config.message ? config.message.slice(0, 40) : "Send WhatsApp to lead";
    case "Assign Lead":
      return config.assignTo ? `Assign to ${config.assignTo}` : "Assign lead";
    case "Update Lead":
      return config.field ? `Update ${config.field} → ${config.value}` : "Update lead field";
    case "Assign Task":
      return config.title ? config.title : "Create task";
    case "Push to ERP":
      return "Push student data to ERP";
    case "Webhook":
      return config.url ? `POST ${config.url}` : "Call webhook";
    default:
      return actionType;
  }
}

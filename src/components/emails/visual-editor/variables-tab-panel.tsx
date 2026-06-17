import React, { useState } from "react";
import { toast } from "sonner";
import Axios from "@/lib/axios-config";
import { extractVariables } from "../components/test-email-variables-dialog";
import { DEFAULT_VARIABLES, type EmailVariable } from "../hooks/use-email-variables";

interface VariablesTabPanelProps {
  unlayer: any;
  templateKeyRef: React.MutableRefObject<string>;
  subjectRef: React.MutableRefObject<string>;
}

function loadVariables(): EmailVariable[] {
  try {
    const stored = localStorage.getItem("email_template_variables");
    if (stored) {
      const parsed = JSON.parse(stored) as EmailVariable[];
      const customOnly = parsed.filter((v) => !DEFAULT_VARIABLES.some((d) => d.key === v.key));
      return [...DEFAULT_VARIABLES, ...customOnly.map((v) => ({ ...v, isCustom: true }))];
    }
  } catch {}
  return DEFAULT_VARIABLES;
}

function persistCustomVariables(vars: EmailVariable[]) {
  const customOnly = vars.filter((v) => v.isCustom);
  localStorage.setItem("email_template_variables", JSON.stringify(customOnly));
}


const s = {
  container: {
    padding: "16px",
    height: "100%",
    overflowY: "auto" as const,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: "12px",
    color: "#1e293b",
    boxSizing: "border-box" as const,
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "700" as const,
    marginBottom: "4px",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  hint: {
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  addRow: {
    display: "flex",
    gap: "6px",
    marginBottom: "12px",
  },
  input: {
    flex: 1 as const,
    padding: "7px 10px",
    fontSize: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    outline: "none",
    background: "#f8fafc",
    color: "#1e293b",
  },
  addBtn: {
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: "700" as const,
    background: "#800000",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    lineHeight: 1,
  },
  varRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 10px",
    borderRadius: "6px",
    background: "#f1f5f9",
    marginBottom: "4px",
    transition: "background 0.15s",
  },
  varBtn: {
    flex: 1 as const,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    textAlign: "left" as const,
    gap: "6px",
    minWidth: 0,
  },
  varLabel: {
    fontWeight: "600" as const,
    color: "#1e293b",
    fontSize: "12px",
    flexShrink: 0,
  },
  varKey: {
    fontSize: "10px",
    color: "#94a3b8",
    fontFamily: "monospace",
    flexShrink: 0,
  },
  removeBtn: {
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1,
    padding: "0 2px",
    flexShrink: 0,
  },
  searchInput: {
    width: "100%",
    padding: "7px 10px",
    fontSize: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    outline: "none",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box" as const,
    marginBottom: "12px",
  },
  categoryLabel: {
    fontSize: "10px",
    fontWeight: "700" as const,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    padding: "6px 0 3px",
  },
  emptyHint: {
    fontSize: "11px",
    color: "#94a3b8",
    textAlign: "center" as const,
    padding: "12px 0",
  },
  divider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "16px 0",
  },
  textarea: {
    width: "100%",
    padding: "8px 10px",
    fontSize: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    outline: "none",
    resize: "vertical" as const,
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box" as const,
    lineHeight: "1.5",
  },
  sendBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "9px",
    fontSize: "12px",
    fontWeight: "700" as const,
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  varFillLabel: {
    fontSize: "11px",
    fontWeight: "600" as const,
    color: "#64748b",
    marginBottom: "8px",
  },
  varFillInput: {
    width: "100%",
    padding: "6px 10px",
    fontSize: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    outline: "none",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box" as const,
  },
  varFillFieldLabel: {
    fontSize: "11px",
    fontWeight: "600" as const,
    color: "#475569",
    marginBottom: "3px",
  },
  actionRow: {
    display: "flex",
    gap: "6px",
    marginTop: "4px",
  },
  cancelBtn: {
    flex: 1 as const,
    padding: "8px",
    fontSize: "12px",
    fontWeight: "600" as const,
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  confirmBtn: (disabled: boolean) => ({
    flex: 2 as const,
    padding: "8px",
    fontSize: "12px",
    fontWeight: "600" as const,
    background: disabled ? "#86efac" : "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: disabled ? "not-allowed" : ("pointer" as const),
  }),
};

export function VariablesTabPanel({ unlayer, templateKeyRef, subjectRef }: VariablesTabPanelProps) {
  const [variables, setVariables] = useState<EmailVariable[]>(loadVariables);
  const [newVarLabel, setNewVarLabel] = useState("");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [testEmails, setTestEmails] = useState("");
  const [isFillMode, setIsFillMode] = useState(false);
  const [detectedVars, setDetectedVars] = useState<string[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newVarLabel.trim();
    if (!trimmed) return;
    const key = trimmed.replace(/[^a-zA-Z0-9]/g, "");
    if (!key) return toast.error("Invalid variable name");
    if (variables.some((v) => v.key.toLowerCase() === key.toLowerCase())) {
      return toast.error("Variable already exists");
    }
    const newVar: EmailVariable = { label: trimmed, key, isCustom: true };
    const updated = [...variables, newVar];
    setVariables(updated);
    persistCustomVariables(updated);
    toast.success(`Variable {{${key}}} created`);
    setNewVarLabel("");
  };

  const handleRemoveVariable = (key: string) => {
    const updated = variables.filter((v) => v.key !== key || !v.isCustom);
    setVariables(updated);
    persistCustomVariables(updated);
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    toast.success(`Copied {{${key}}} to clipboard!`);
  };

  const handleSendTestClick = () => {
    if (!testEmails.trim()) return toast.error("Please enter at least one email address");
    unlayer.exportHtml((data: any) => {
      const html = data.html || "";
      const vars = extractVariables(subjectRef.current || "", html);
      setDetectedVars(vars);
      const init: Record<string, string> = {};
      vars.forEach((v) => (init[v] = ""));
      setVarValues(init);
      setIsFillMode(true);
    });
  };

  const handleConfirmSend = async () => {
    const emailList = testEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (!emailList.length) return toast.error("Please enter at least one email address");

    setIsSending(true);
    toast.loading("Sending test email...", { id: "send-test-email" });
    try {
      await Promise.all(
        emailList.map((email) =>
          Axios.post("/api/v1/communications/send", {
            channel: "email",
            templateKey: templateKeyRef.current,
            to: email,
            params: varValues,
          }),
        ),
      );
      toast.success(`Test email sent to ${testEmails}!`, { id: "send-test-email" });
      setIsFillMode(false);
      setTestEmails("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send test email";
      toast.error(msg, { id: "send-test-email" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={s.container}>
      {/* ── Variables ── */}
      <div style={s.sectionTitle}>
        <span>✦</span> Template Variables
      </div>
      <div style={s.hint}>Click any variable to copy its placeholder into your template.</div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search variables..."
        style={s.searchInput}
      />

      <form onSubmit={handleAddVariable} style={s.addRow}>
        <input
          value={newVarLabel}
          onChange={(e) => setNewVarLabel(e.target.value)}
          placeholder="Add variable name..."
          style={s.input}
        />
        <button type="submit" disabled={!newVarLabel.trim()} style={s.addBtn}>
          +
        </button>
      </form>

      {(() => {
        const q = search.trim().toLowerCase();
        const filtered = q
          ? variables.filter(
              (v) =>
                v.label.toLowerCase().includes(q) ||
                v.key.toLowerCase().includes(q) ||
                (v.category ?? "").toLowerCase().includes(q),
            )
          : variables;

        if (!filtered.length) {
          return <div style={s.emptyHint}>No variables match "{search}"</div>;
        }

        // Group by category
        const groups: Record<string, EmailVariable[]> = {};
        filtered.forEach((v) => {
          const cat = v.category ?? (v.isCustom ? "Custom" : "General");
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(v);
        });

        return Object.entries(groups).map(([cat, catVars]) => (
          <div key={cat}>
            <div style={s.categoryLabel}>{cat}</div>
            {catVars.map((field) => (
              <div
                key={field.key}
                style={{
                  ...s.varRow,
                  background: hoveredKey === field.key ? "#fee2e2" : "#f1f5f9",
                }}
                onMouseEnter={() => setHoveredKey(field.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <button type="button" onClick={() => copyToClipboard(field.key)} style={s.varBtn}>
                  <span style={s.varLabel}>{field.label}</span>
                  <span style={s.varKey}>{`{{${field.key}}}`}</span>
                </button>
                {field.isCustom && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(field.key)}
                    title="Remove"
                    style={s.removeBtn}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ));
      })()}

      <div style={s.divider} />

      {/* ── Send Test Email ── */}
      <div style={s.sectionTitle}>
        <span>✉</span> Send Test Emails
      </div>
      <div style={s.hint}>Send test emails to review layouts before publishing.</div>

      {!isFillMode ? (
        <>
          <textarea
            value={testEmails}
            onChange={(e) => setTestEmails(e.target.value)}
            placeholder="e.g. test@example.com, admin@acharya.ac.in"
            rows={3}
            style={s.textarea}
          />
          <button onClick={handleSendTestClick} style={s.sendBtn}>
            Send Test Email →
          </button>
        </>
      ) : (
        <>
          {detectedVars.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={s.varFillLabel}>Fill in variable values:</div>
              {detectedVars.map((v) => (
                <div key={v} style={{ marginBottom: "8px" }}>
                  <div style={s.varFillFieldLabel}>{v}</div>
                  <input
                    value={varValues[v] || ""}
                    onChange={(e) => setVarValues((prev) => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`Value for ${v}`}
                    style={s.varFillInput}
                  />
                </div>
              ))}
            </div>
          )}
          <div style={s.actionRow}>
            <button
              onClick={() => setIsFillMode(false)}
              disabled={isSending}
              style={s.cancelBtn}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSend}
              disabled={isSending}
              style={s.confirmBtn(isSending)}
            >
              {isSending ? "Sending..." : "✓ Confirm Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

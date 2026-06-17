import { useState, useEffect } from "react";

export interface EmailVariable {
  key: string;
  label: string;
  category?: string;
  isCustom?: boolean;
}

export const DEFAULT_VARIABLES: EmailVariable[] = [
  { label: "First Name", key: "FirstName", category: "Student" },
  { label: "Last Name", key: "LastName", category: "Student" },
  { label: "Course Name", key: "CourseName", category: "Application" },
  { label: "Application ID", key: "ApplicationID", category: "Application" },
  { label: "Parent Name", key: "ParentName", category: "Contact" },
  { label: "Parent Number", key: "ParentNumber", category: "Contact" },
  { label: "Campus Name", key: "CampusName", category: "Institution" },
  { label: "Counsellor Name", key: "CounsellorName", category: "Institution" },
  { label: "Fee Amount", key: "FeeAmount", category: "Finance" },
  { label: "Scholarship Percentage", key: "ScholarshipPercentage", category: "Finance" },
];

export function loadAllVariables(): EmailVariable[] {
  try {
    const stored = localStorage.getItem("email_template_variables");
    if (stored) {
      const parsed: EmailVariable[] = JSON.parse(stored);
      const customOnly = parsed.filter((v) => !DEFAULT_VARIABLES.some((d) => d.key === v.key));
      return [...DEFAULT_VARIABLES, ...customOnly.map((v) => ({ ...v, isCustom: true }))];
    }
  } catch {}
  return [...DEFAULT_VARIABLES];
}

export function buildUnlayerMergeTags(
  vars: EmailVariable[],
): Record<string, { name: string; mergeTags: Record<string, { name: string; value: string; sample: string }> }> {
  const groups: Record<string, EmailVariable[]> = {};
  vars.forEach((v) => {
    const cat = v.category ?? (v.isCustom ? "Custom" : "General");
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(v);
  });
  return Object.fromEntries(
    Object.entries(groups).map(([catName, catVars]) => [
      catName.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      {
        name: catName,
        mergeTags: Object.fromEntries(
          catVars.map((v) => [v.key, { name: v.label, value: `{{${v.key}}}`, sample: v.label }]),
        ),
      },
    ]),
  );
}

export function useEmailVariables() {
  const [variables, setVariables] = useState<EmailVariable[]>(loadAllVariables);

  const addVariable = (label: string, keyInput?: string) => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) return { success: false, error: "Label is required" };

    // Clean key or slugify if not provided
    const key = (keyInput || trimmedLabel)
      .replace(/[^a-zA-Z0-9]/g, "")
      .trim();

    if (!key) return { success: false, error: "Invalid key generated from label" };

    if (variables.some(v => v.key.toLowerCase() === key.toLowerCase())) {
      return { success: false, error: "A variable with this key already exists" };
    }

    const newVar: EmailVariable = {
      label: trimmedLabel,
      key,
      isCustom: true
    };

    const updated = [...variables, newVar];
    setVariables(updated);

    const customOnly = updated.filter(v => v.isCustom);
    localStorage.setItem("email_template_variables", JSON.stringify(customOnly));
    return { success: true, variable: newVar };
  };

  const removeVariable = (key: string) => {
    const updated = variables.filter(v => v.key !== key || !v.isCustom);
    setVariables(updated);
    const customOnly = updated.filter(v => v.isCustom);
    localStorage.setItem("email_template_variables", JSON.stringify(customOnly));
  };

  return {
    variables,
    addVariable,
    removeVariable
  };
}

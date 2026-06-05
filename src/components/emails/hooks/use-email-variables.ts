import { useState, useEffect } from "react";

export interface EmailVariable {
  key: string;
  label: string;
  isCustom?: boolean;
}

export const DEFAULT_VARIABLES: EmailVariable[] = [
  { label: "First Name", key: "FirstName" },
  { label: "Last Name", key: "LastName" },
  { label: "Course Name", key: "CourseName" },
  { label: "Application ID", key: "ApplicationID" },
  { label: "Parent Name", key: "ParentName" },
  { label: "Parent Number", key: "ParentNumber" },
  { label: "Campus Name", key: "CampusName" },
  { label: "Counsellor Name", key: "CounsellorName" },
  { label: "Fee Amount", key: "FeeAmount" },
  { label: "Scholarship Percentage", key: "ScholarshipPercentage" },
];

export function useEmailVariables() {
  const [variables, setVariables] = useState<EmailVariable[]>(() => {
    try {
      const stored = localStorage.getItem("email_template_variables");
      if (stored) {
        const parsed = JSON.parse(stored) as EmailVariable[];
        const customOnly = parsed.filter(v => !DEFAULT_VARIABLES.some(d => d.key === v.key));
        return [...DEFAULT_VARIABLES, ...customOnly.map(v => ({ ...v, isCustom: true }))];
      }
    } catch (e) {
      console.error("Failed to parse stored variables", e);
    }
    return DEFAULT_VARIABLES;
  });

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

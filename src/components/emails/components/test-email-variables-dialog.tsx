import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertCircle } from "lucide-react";

interface TestEmailVariablesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  content: string;
  testEmails: string;
  onSend: (customizedSubject: string, customizedContent: string, params: Record<string, string>) => void;
}

export function extractVariables(subject: string, content: string): string[] {
  const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
  const found = new Set<string>();

  let match;
  // Use a copy to prevent regex cursor locking issues
  const sText = subject || "";
  const cText = content || "";

  while ((match = regex.exec(sText)) !== null) {
    if (match[1]) found.add(match[1].trim());
  }
  regex.lastIndex = 0; // reset
  while ((match = regex.exec(cText)) !== null) {
    if (match[1]) found.add(match[1].trim());
  }

  return Array.from(found);
}

export function TestEmailVariablesDialog({
  isOpen,
  onClose,
  subject,
  content,
  testEmails,
  onSend,
}: TestEmailVariablesDialogProps) {
  const [variables, setVariables] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const vars = extractVariables(subject, content);
      setVariables(vars);

      // Prepopulate empty values
      const initialValues: Record<string, string> = {};
      vars.forEach((v) => {
        initialValues[v] = "";
      });
      setValues(initialValues);
    }
  }, [isOpen, subject, content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalSubject = subject || "";
    let finalContent = content || "";

    // Replace variables
    Object.entries(values).forEach(([key, val]) => {
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, "g");
      finalSubject = finalSubject.replace(regex, val);
      finalContent = finalContent.replace(regex, val);
    });

    onSend(finalSubject, finalContent, values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-display font-bold">
              <Send className="size-5 text-primary" /> Test Email Personalization
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Configure personalization values for the dynamic variables found in your email template.
            </DialogDescription>
          </DialogHeader>

          {variables.length > 0 ? (
            <div className="grid gap-3.5 py-4 max-h-[300px] overflow-y-auto my-2 pr-1">
              {variables.map((v) => (
                <div key={v} className="grid grid-cols-4 items-center gap-3">
                  <label
                    className="text-right text-xs font-semibold text-muted-foreground truncate pr-1"
                    title={v}
                  >
                    {v}
                  </label>
                  <Input
                    value={values[v] || ""}
                    onChange={(e) => setValues({ ...values, [v]: e.target.value })}
                    placeholder={`Enter value for ${v}`}
                    className="col-span-3 h-9 text-sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
              <AlertCircle className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">No variables detected</p>
              <p className="text-xs text-muted-foreground max-w-[320px]">
                This template does not contain any variables in the form of {"{{VariableName}}"}.
                Clicking send will deliver the template as is.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 text-xs font-semibold bg-success hover:bg-success/95 text-white flex items-center gap-1.5"
            >
              <Send className="size-3.5" /> Send Test Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

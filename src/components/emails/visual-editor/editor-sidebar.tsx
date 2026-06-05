import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid, Layout, Settings, Send, Sparkles, Plus, Trash2 } from "lucide-react";
import { useEmailVariables } from "../hooks/use-email-variables";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EditorSidebarProps {
  activeTab: "content" | "rows" | "settings";
  setActiveTab: (tab: "content" | "rows" | "settings") => void;
  selectedType: string;
  testEmails: string;
  setTestEmails: (emails: string) => void;
  handleSendTest: () => void;
  className?: string;
}

export function EditorSidebar({
  activeTab,
  setActiveTab,
  selectedType,
  testEmails,
  setTestEmails,
  handleSendTest,
  className,
}: EditorSidebarProps) {
  const { variables, addVariable, removeVariable } = useEmailVariables();
  const [newVarLabel, setNewVarLabel] = useState("");

  const handleCreateVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarLabel.trim()) return;

    const res = addVariable(newVarLabel);
    if (res.success) {
      toast.success(`Variable {{${res.variable?.key}}} created successfully`);
      setNewVarLabel("");
    } else {
      toast.error(res.error || "Failed to create variable");
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    toast.success(`Copied {{${key}}} to clipboard!`);
  };

  return (
    <div className={`w-[300px] shrink-0 bg-card overflow-y-auto flex flex-col divide-y divide-border h-full hidden lg:flex border-l border-border ${className || ""}`}>
      {/* Tabs Selector */}
      <div className="flex bg-muted/40 p-1.5 shrink-0">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition ${activeTab === "content" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Grid className="size-3.5" /> Content
        </button>
        <button
          onClick={() => setActiveTab("rows")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition ${activeTab === "rows" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Layout className="size-3.5" /> Rows
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition ${activeTab === "settings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Settings className="size-3.5" /> Style
        </button>
      </div>

      {/* Blocks Panel (Shared by Content & Rows tabs) */}
      <div
        className={`flex-grow overflow-y-auto flex flex-col ${activeTab === "content" || activeTab === "rows" ? "block" : "hidden"}`}
      >
        <div className="p-4 shrink-0">
          <div
            id="blocks-container"
            className={`gjs-custom-blocks ${activeTab === "content" ? "active-tab-content" : "active-tab-rows"}`}
          />
        </div>

        {/* Variables & Test Email Section (only on Content tab) */}
        {activeTab === "content" && (
          <div className="flex flex-col border-t border-border mt-auto divide-y divide-border bg-card/50">
            {/* Variables Creator and List */}
            <div className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> Template Variables
              </h3>
              <p className="text-[10px] text-muted-foreground leading-normal mb-3">
                Click any variable to copy its placeholder syntax.
              </p>

              {/* Add Custom Variable Form */}
              <form onSubmit={handleCreateVariable} className="flex gap-1.5 mb-3">
                <Input
                  value={newVarLabel}
                  onChange={(e) => setNewVarLabel(e.target.value)}
                  placeholder="Add variable name..."
                  className="h-8 text-xs bg-muted border-border"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-8 shrink-0 bg-primary text-white"
                  disabled={!newVarLabel.trim()}
                >
                  <Plus className="size-4" />
                </Button>
              </form>

              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                {variables.map((field) => (
                  <div
                    key={field.key}
                    className="group flex items-center justify-between bg-muted hover:bg-primary/10 hover:text-primary transition px-2.5 py-1.5 rounded-md text-xs font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => copyToClipboard(field.key)}
                      className="flex-1 text-left flex items-center justify-between"
                      title="Click to copy placeholder"
                    >
                      <span>{field.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono group-hover:text-primary/70 mr-1.5">
                        {`{{${field.key}}}`}
                      </span>
                    </button>
                    {field.isCustom && (
                      <button
                        type="button"
                        onClick={() => removeVariable(field.key)}
                        className="text-muted-foreground hover:text-destructive opacity-40 hover:opacity-100 p-0.5 rounded transition shrink-0"
                        title="Delete custom variable"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Test Email */}
            <div className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1.5">
                <Send className="size-3.5 text-success" /> Send Test Emails
              </h3>
              <div className="space-y-2">
                <textarea
                  value={testEmails}
                  onChange={(e) => setTestEmails(e.target.value)}
                  placeholder="e.g. test@example.com, developer@acharya.ac.in"
                  className="w-full text-xs bg-muted border border-border rounded p-2 focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                />
                <Button
                  onClick={handleSendTest}
                  className="w-full text-xs h-8 bg-success hover:bg-success/95 text-white flex items-center justify-center gap-1.5"
                >
                  <Send className="size-3.5" /> Send Test Email
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings/Style Tab */}
      <div
        className={`flex-grow overflow-y-auto p-4 ${activeTab === "settings" ? "block" : "hidden"}`}
      >
        <div className="mb-5 p-3.5 rounded-lg border border-primary/10 bg-primary/5 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1">
            <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />{" "}
            Selected Element
          </span>
          <span className="text-sm font-bold text-foreground">
            {selectedType === "None" ? "No Element Selected" : selectedType}
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {selectedType === "None"
              ? "Click on any block inside the canvas area (like text, images, or buttons) to edit its parameters and styles."
              : selectedType === "Video"
                ? "Double-click this video block to paste a web link (YouTube/Vimeo) or upload a local video file. Adjust its size and padding below."
                : selectedType === "Image"
                  ? "Double-click this image block to upload/replace it. Customize borders, shadows, and margins below."
                  : selectedType === "Text"
                    ? "Double-click the text block to edit text contents directly. Use Typography overrides below to adjust fonts, sizes, and colors."
                    : "You can customize dimensions, padding, margins, text alignments, borders, and colors for this block using the panels below."}
          </p>
        </div>
        <div className="space-y-4">
          <div className="border border-border rounded-lg bg-card/50 overflow-hidden shadow-sm">
            <div className="px-3 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                Component Settings
              </h3>
            </div>
            <div className="p-3.5">
              <div
                id="traits-container"
                className="empty:after:content-['No_settings_available_for_this_element'] empty:after:text-xs empty:after:text-muted-foreground empty:after:italic"
              />
            </div>
          </div>
          <div className="border border-border rounded-lg bg-card/50 overflow-hidden shadow-sm">
            <div className="px-3 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                Styling Manager
              </h3>
            </div>
            <div id="styles-container" className="gjs-custom-styles" />
          </div>
        </div>
      </div>
    </div>
  );
}

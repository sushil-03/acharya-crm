import React from "react";
import { Button } from "@/components/ui/button";
import { Grid, Layout, Settings, Send } from "lucide-react";

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
  return (
    <div className={`w-[300px] shrink-0 bg-card overflow-y-auto flex flex-col divide-y divide-border h-full hidden lg:flex border-l border-border ${className || ""}`}>
      {/* Tabs Selector */}
      <div className="flex bg-muted/40 p-1.5 shrink-0">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition ${activeTab === "content" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Grid className="size-3.5" /> Content
        </button>
        <button
          onClick={() => setActiveTab("rows")}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition ${activeTab === "rows" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Layout className="size-3.5" /> Rows
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition ${activeTab === "settings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Settings className="size-3.5" /> Settings
        </button>
      </div>

      {/* Blocks Panel (Shared by Content & Rows tabs) */}
      <div
        className={`flex-1 overflow-y-auto flex flex-col ${activeTab === "content" || activeTab === "rows" ? "block" : "hidden"}`}
      >
        <div className="p-4">
          <div
            id="blocks-container"
            className={`gjs-custom-blocks ${activeTab === "content" ? "active-tab-content" : "active-tab-rows"}`}
          />
        </div>
        {/* Test Email */}
        {activeTab === "content" && (
          <div className="p-4 border-t border-border mt-auto">
            <h3 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1">
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
        )}
      </div>

      {/* Settings/Style Tab */}
      <div
        className={`flex-1 overflow-y-auto p-4 ${activeTab === "settings" ? "block" : "hidden"}`}
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

import React from "react";
import { AppShell } from "@/components/app-shell";
import { useRichTextEditor } from "./use-rich-text-editor";
import { EditorHeader } from "./editor-header";
import { EditorInputs } from "./editor-inputs";
import { EditorPane } from "./editor-pane";
import { EditorSidebar } from "./editor-sidebar";
import { Loader2 } from "lucide-react";

import { CampaignStepper } from "@/components/emails/campaigns/campaign-stepper";
import { CampaignNavBar } from "@/components/emails/campaigns/campaign-nav-bar";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";

export function RichTextEditor({ id }: { id?: string }) {
  const editor = useRichTextEditor(id);
  const campaignStep = useCampaignCreationStore((s) => s.step);

  return (
    <AppShell noPadding>
      {campaignStep > 0 && <CampaignStepper />}
      <div
        className={`flex flex-col overflow-hidden bg-background ${
          campaignStep > 0 ? "flex-1 min-h-0" : "h-[calc(100vh-64px)]"
        }`}
      >
        <EditorHeader
          name={editor.name}
          status={editor.status}
          setStatus={editor.setStatus}
          onSave={editor.handleSave}
          isSaving={editor.isSaving}
          isEditing={!!id}
        />

        <EditorInputs
          name={editor.name}
          setName={editor.setName}
          category={editor.category}
          setCategory={editor.setCategory}
          categories={editor.categories}
          subject={editor.subject}
          setSubject={editor.setSubject}
          onSubjectFocus={() => {
            editor.lastFocusedRef.current = "subject";
          }}
          tags={editor.tags}
          tagInput={editor.tagInput}
          setTagInput={editor.setTagInput}
          handleAddTag={editor.handleAddTag}
          handleRemoveTag={editor.handleRemoveTag}
          isSaving={editor.isSaving}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {id && editor.isLoadingDetails && (
            <div className="absolute inset-0 bg-background/80 z-[10000] flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium">
                Loading rich text template details...
              </p>
            </div>
          )}
          <EditorPane />

          <EditorSidebar
            insertMergeField={editor.insertMergeField}
            testEmails={editor.testEmails}
            setTestEmails={editor.setTestEmails}
            isSaving={editor.isSaving}
            subject={editor.subject}
            content={editor.content}
          />
        </div>

        {campaignStep > 0 && (
          <CampaignNavBar statusText="Save your template then proceed to select recipients." />
        )}
      </div>
    </AppShell>
  );
}

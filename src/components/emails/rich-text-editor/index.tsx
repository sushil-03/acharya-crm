import React from "react";
import { AppShell } from "@/components/app-shell";
import { useRichTextEditor } from "./use-rich-text-editor";
import { EditorHeader } from "./editor-header";
import { EditorInputs } from "./editor-inputs";
import { EditorPane } from "./editor-pane";
import { EditorSidebar } from "./editor-sidebar";
import { Loader2 } from "lucide-react";

interface RichTextEditorProps {
  id?: string;
}

export function RichTextEditor({ id }: RichTextEditorProps) {
  const editor = useRichTextEditor(id);

  return (
    <AppShell noPadding>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
        <EditorHeader
          name={editor.name}
          status={editor.status}
          setStatus={editor.setStatus}
          onSave={editor.handleSave}
          isSaving={editor.isSaving}
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
              <p className="text-muted-foreground text-sm font-medium">Loading rich text template details...</p>
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
      </div>
    </AppShell>
  );
}


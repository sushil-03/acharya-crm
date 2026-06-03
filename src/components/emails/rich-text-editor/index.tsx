import React from "react";
import { AppShell } from "@/components/app-shell";
import { useRichTextEditor } from "./use-rich-text-editor";
import { EditorHeader } from "./editor-header";
import { EditorInputs } from "./editor-inputs";
import { EditorPane } from "./editor-pane";
import { EditorSidebar } from "./editor-sidebar";

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
        />

        <EditorInputs
          name={editor.name}
          setName={editor.setName}
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
        />

        <div className="flex-1 flex overflow-hidden">
          <EditorPane />

          <EditorSidebar
            insertMergeField={editor.insertMergeField}
            testEmails={editor.testEmails}
            setTestEmails={editor.setTestEmails}
            onSendTest={editor.handleSendTest}
          />
        </div>
      </div>
    </AppShell>
  );
}

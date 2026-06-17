import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import EmailEditor, { EditorRef } from "react-email-editor";

import { EditorHeader } from "./editor-header";
import { EditorInputs } from "./editor-inputs";
import { VariablesTabPanel } from "./variables-tab-panel";
import { MergeTagPicker } from "./merge-tag-picker";
import { useGetEmailTemplateDetails } from "../hooks/query/use-get-email-template-details";
import { useGetEmailTemplateCategories } from "../hooks/query/use-get-email-template-categories";
import { useCreateEmailTemplate } from "../hooks/mutation/use-create-email-template";
import { useUpdateEmailTemplate } from "../hooks/mutation/use-update-email-template";
import { CampaignStepper } from "@/components/emails/campaigns/campaign-stepper";
import { CampaignNavBar } from "@/components/emails/campaigns/campaign-nav-bar";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";


export function VisualEditor({ id }: { id?: string }) {
  const campaignStep = useCampaignCreationStore((s) => s.step);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showMergeTagPicker, setShowMergeTagPicker] = useState(false);

  const emailEditorRef = useRef<EditorRef>(null);
  const isLoadedRef = useRef(false);
  const mergeTagCallbackRef = useRef<((text: string) => void) | null>(null);

  const { data: templateDetails, isLoading: isLoadingDetails } = useGetEmailTemplateDetails(id);
  const { data: categoriesData = [] } = useGetEmailTemplateCategories();
  const defaultCategories = ["general", "marketing", "transactional", "admissions", "finance"];
  const categories = categoriesData.length > 0 ? categoriesData : defaultCategories;

  const { mutateAsync: createTemplate, isPending: isCreating } = useCreateEmailTemplate();
  const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateEmailTemplate();
  const isSaving = isCreating || isUpdating;

  const templateKey =
    id && templateDetails?.key
      ? templateDetails.key
      : name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "") || "test_template";

  // Stable refs so the Unlayer custom tab Panel always reads the latest values
  const templateKeyRef = useRef(templateKey);
  const subjectRef = useRef(subject);
  templateKeyRef.current = templateKey;
  subjectRef.current = subject;

  // Load template data once both editor and API data are ready
  useEffect(() => {
    if (isEditorReady && id && templateDetails && !isLoadedRef.current) {
      isLoadedRef.current = true;
      setName(templateDetails.name || "");
      setSubject(templateDetails.subject || "");
      setCategory(templateDetails.category || "");
      setStatus(templateDetails.isActive ? "Published" : "Draft");
      setContent(templateDetails.htmlBody || "");

      const unlayer = emailEditorRef.current?.editor;
      if (!unlayer) return;

      const designJson = templateDetails.designJson;
      if (designJson) {
        try {
          const design = typeof designJson === "string" ? JSON.parse(designJson) : designJson;
          if (design && Object.keys(design).length > 0) {
            unlayer.loadDesign(design);
            return;
          }
        } catch (err) {
          console.error("Error loading design JSON", err);
        }
      }
      // Fall back to blank if no valid design
      unlayer.loadBlank();
    }
  }, [isEditorReady, id, templateDetails]);

  const onReady = (unlayer: any) => {
    setIsEditorReady(true);

    unlayer.addEventListener("design:updated", () => {
      unlayer.exportHtml((data: any) => {
        setContent(data.html || "");
      });
    });

    // Register Template Variables as a custom right-panel tab
    unlayer.registerTab({
      name: "template_variables",
      label: "Variables",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      position: 5,
      renderer: {
        Panel: () => (
          <VariablesTabPanel
            unlayer={unlayer}
            templateKeyRef={templateKeyRef}
            subjectRef={subjectRef}
          />
        ),
      },
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => setTags(tags.filter((_, i) => i !== index));

  const handleSave = () => {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!category) return toast.error("Category is required");

    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return toast.error("Editor not initialized");

    unlayer.exportHtml(async (data) => {
      const { design, html } = data;
      const key = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

      try {
        if (id) {
          toast.loading("Updating template...", { id: "save-template" });
          await updateTemplate({
            id,
            data: {
              name,
              key,
              subject,
              htmlBody: html,
              textBody: name,
              designJson: design,
              category,
              isActive: status === "Published",
            },
          });
          toast.success("Template updated successfully", { id: "save-template" });
        } else {
          toast.loading("Creating template...", { id: "save-template" });
          await createTemplate({
            key,
            name,
            subject,
            htmlBody: html,
            textBody: name,
            editorType: "visual_designer",
            designJson: design,
            variables: [],
            category,
            isActive: status === "Published",
          });
          toast.success("Template created successfully", { id: "save-template" });
        }
        navigate({ to: "/email-templates" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save template";
        toast.error(message, { id: "save-template" });
      }
    });
  };

  const handleMergeTagSelect = (key: string) => {
    if (mergeTagCallbackRef.current) {
      mergeTagCallbackRef.current(`{{${key}}}`);
      mergeTagCallbackRef.current = null;
    }
    setShowMergeTagPicker(false);
  };

  return (
    <AppShell noPadding>
      <MergeTagPicker
        open={showMergeTagPicker}
        onClose={() => setShowMergeTagPicker(false)}
        onSelect={handleMergeTagSelect}
      />
      {campaignStep > 0 && <CampaignStepper />}
      <div
        className={`flex flex-col overflow-hidden bg-background ${
          campaignStep > 0 ? "flex-1 min-h-0" : "flex-1"
        }`}
      >
        <EditorHeader
          name={name}
          status={status}
          setStatus={setStatus}
          handleSave={handleSave}
          isSaving={isSaving}
          isEditing={!!id}
        />
        <EditorInputs
          name={name}
          setName={setName}
          subject={subject}
          setSubject={setSubject}
          category={category}
          setCategory={setCategory}
          categories={categories}
          tags={tags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
        />
        <div className="flex-1 overflow-hidden relative">
          {id && isLoadingDetails && (
            <div className="absolute inset-0 bg-background/80 z-[10000] flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium">
                Loading email template details...
              </p>
            </div>
          )}
          {/* absolute inset-0 gives EmailEditor explicit dimensions so its flex:1 resolves correctly */}
          <div className="absolute inset-0 flex flex-col">
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              minHeight="100%"
              options={{
                displayMode: "email",
                features: {
                  textEditor: {
                    inlineFontControls: true,
                    emojis: true,
                    cleanPaste: "basic",
                    customButtons: [
                      {
                        name: "merge_tags",
                        text: "Merge Tags",
                        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>',
                        onAction: (_data: unknown, callback: (text: string) => void) => {
                          mergeTagCallbackRef.current = callback;
                          setShowMergeTagPicker(true);
                        },
                      },
                    ],
                  },
                  undoRedo: true,
                } as any,
              }}
            />
          </div>
        </div>
        {campaignStep > 0 && (
          <CampaignNavBar statusText="Save your design then proceed to select recipients." />
        )}
      </div>
    </AppShell>
  );
}

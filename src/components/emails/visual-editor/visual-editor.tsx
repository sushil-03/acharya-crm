import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Layout, Eye, EyeOff, Maximize, Minimize, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { EditorHeader } from "./editor-header";
import { EditorInputs } from "./editor-inputs";
import { EditorSidebar } from "./editor-sidebar";
import { EditorModals } from "./editor-modals";
import { useGrapesJsEditor } from "../hooks/controller/use-grapesjs-editor";
import { useGetEmailTemplateDetails } from "../hooks/query/use-get-email-template-details";
import { useGetEmailTemplateCategories } from "../hooks/query/use-get-email-template-categories";
import { useCreateEmailTemplate } from "../hooks/mutation/use-create-email-template";
import { useUpdateEmailTemplate } from "../hooks/mutation/use-update-email-template";


export function VisualEditor({ id }: { id?: string }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [visualData, setVisualData] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [template, setTemplate] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"content" | "rows" | "settings" | "variables">("content");
  const [selectedType, setSelectedType] = useState<string>("None");
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadedRef = useRef(false);

  // Queries & Mutations
  const { data: templateDetails, isLoading: isLoadingDetails } = useGetEmailTemplateDetails(id);
  const { data: categoriesData = [] } = useGetEmailTemplateCategories();
  const defaultCategories = ["general", "marketing", "transactional", "admissions", "finance"];
  const categories = categoriesData.length > 0 ? categoriesData : defaultCategories;

  const { mutateAsync: createTemplate, isPending: isCreating } = useCreateEmailTemplate();
  const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateEmailTemplate();
  const isSaving = isCreating || isUpdating;

  const templateKey = id && templateDetails?.key
    ? templateDetails.key
    : (name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "test_template");

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Synchronize backend data to GrapesJS
  useEffect(() => {
    if (isEditorInitialized && id && templateDetails && !isLoadedRef.current) {
      isLoadedRef.current = true;
      setName(templateDetails.name || "");
      setSubject(templateDetails.subject || "");
      setCategory(templateDetails.category || "");
      setStatus(templateDetails.isActive ? "Published" : "Draft");
      setContent(templateDetails.htmlBody || "");

      const designJson = templateDetails.designJson;
      if (designJson) {
        try {
          const parsedData = typeof designJson === "string" ? JSON.parse(designJson) : designJson;
          if (parsedData && Object.keys(parsedData).length > 0) {
            editorRef.current.loadProjectData(parsedData);
          } else if (templateDetails.htmlBody) {
            editorRef.current.setComponents(templateDetails.htmlBody);
          }
        } catch (err) {
          console.error("Error loading design JSON", err);
          editorRef.current.setComponents(templateDetails.htmlBody);
        }
      } else if (templateDetails.htmlBody) {
        editorRef.current.setComponents(templateDetails.htmlBody);
      }
    }
  }, [isEditorInitialized, id, templateDetails]);

  // Synchronize new template canvas state
  useEffect(() => {
    if (isEditorInitialized && !id) {
      setName("");
      setSubject("");
      setCategory("");
      setTags([]);
      setStatus("Draft");
      editorRef.current.setComponents("");
    }
  }, [isEditorInitialized, id, categories]);

  const togglePreview = () => {
    if (!editorRef.current) return;
    const isCurrentlyPreview = editorRef.current.Commands.isActive("preview");
    if (isCurrentlyPreview) {
      editorRef.current.Commands.stop("preview");
      setIsPreviewActive(false);
    } else {
      editorRef.current.Commands.run("preview");
      setIsPreviewActive(true);
    }

    // Trigger layout/canvas recalculation in GrapesJS after DOM changes
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.refresh();
        editorRef.current.trigger("change:canvasOffset");
      }
    }, 100);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast.error(`Error entering fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [rteInstance, setRteInstance] = useState<any>(null);

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoProvider, setVideoProvider] = useState<"so" | "yt" | "vi">("so");
  const [videoSourceType, setVideoSourceType] = useState<"url" | "file">("url");
  const [selectedVideoComponent, setSelectedVideoComponent] = useState<any>(null);

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);

  const placeholderModelRef = useRef<any>(null);

  const handleCancelTable = () => {
    try {
      if (placeholderModelRef.current) {
        placeholderModelRef.current.remove();
      }
    } catch (err) {
      console.error("Error removing placeholder component:", err);
    } finally {
      placeholderModelRef.current = null;
      setTableModalOpen(false);
    }
  };

  const handleInsertTable = () => {
    if (editorRef.current) {
      let html = `<table style="width: 100%; margin: 15px 0; border-collapse: collapse; font-family: sans-serif; font-size: 13px; color: #475569; border: 1px solid #e2e8f0;">`;

      if (tableHasHeader) {
        html += `<thead><tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">`;
        for (let c = 0; c < tableCols; c++) {
          html += `<th style="padding: 10px; font-weight: 600; border: 1px solid #e2e8f0;" data-gjs-type="text">Header ${c + 1}</th>`;
        }
        html += `</tr></thead>`;
      }

      html += `<tbody>`;
      for (let r = 0; r < tableRows; r++) {
        html += `<tr style="border-bottom: 1px solid #e2e8f0;">`;
        for (let c = 0; c < tableCols; c++) {
          html += `<td style="padding: 10px; border: 1px solid #e2e8f0;" data-gjs-type="text">Cell ${r + 1}-${c + 1}</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table>`;

      try {
        if (placeholderModelRef.current) {
          const parent = placeholderModelRef.current.parent();
          if (parent) {
            const index = parent.components().indexOf(placeholderModelRef.current);
            parent.components().add(html, { at: index });
          } else {
            editorRef.current.addComponents(html);
          }
          placeholderModelRef.current.remove();
        } else {
          const selected = editorRef.current.getSelected();
          if (selected) {
            selected.append(html);
          } else {
            editorRef.current.addComponents(html);
          }
        }
        toast.success("Table inserted successfully!");
      } catch (err) {
        console.error("Error inserting table component:", err);
        toast.error("Failed to insert table component");
      } finally {
        placeholderModelRef.current = null;
        setTableModalOpen(false);
      }
    } else {
      setTableModalOpen(false);
    }
  };

  useGrapesJsEditor({
    id,
    editorRef,
    setContent,
    setVisualData,
    setRteInstance,
    setLinkUrl,
    setLinkModalOpen,
    setActiveTab,
    setSelectedVideoComponent,
    setVideoUrl,
    setVideoProvider,
    setVideoSourceType,
    setVideoModalOpen,
    setSelectedType,
    setName,
    setSubject,
    setTags,
    setStatus,
    setTemplate,
    setTableModalOpen,
    placeholderModelRef,
    setIsEditorInitialized,
  });

  const handleInsertLink = () => {
    if (rteInstance && linkUrl.trim()) {
      rteInstance.insertHTML(
        `<a href="${linkUrl.trim()}" style="color: #800000; text-decoration: underline;" target="_blank">${rteInstance.selection()}</a>`,
      );
    }
    setLinkModalOpen(false);
    setRteInstance(null);
  };

  const handleSaveVideo = () => {
    if (selectedVideoComponent && videoUrl.trim()) {
      let provider = videoProvider;
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) provider = "yt";
      else if (videoUrl.includes("vimeo.com")) provider = "vi";
      else if (videoUrl.startsWith("data:video/")) provider = "so";

      selectedVideoComponent.set({ provider, src: videoUrl.trim() });
      if (editorRef.current) editorRef.current.trigger("change:canvasOffset");
      toast.success("Video settings updated!");
    }
    setVideoModalOpen(false);
    setSelectedVideoComponent(null);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => setTags(tags.filter((_, i) => i !== index));
  const undo = () => editorRef.current?.UndoManager.undo();
  const redo = () => editorRef.current?.UndoManager.redo();



  const getEditorHtmlContent = () => {
    if (editorRef.current) {
      return editorRef.current.getHtml() + `<style>${editorRef.current.getCss()}</style>`;
    }
    return visualData;
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!category) return toast.error("Category is required");

    const key = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    let htmlContent = "";
    let designData: any = {};
    if (editorRef.current) {
      htmlContent = `<style>${editorRef.current.getCss()}</style>${editorRef.current.getHtml()}`;
      designData = editorRef.current.getProjectData();
    }

    try {
      if (id) {
        toast.loading("Updating template...", { id: "save-template" });
        await updateTemplate({
          id,
          data: {
            name,
            key,
            subject,
            htmlBody: htmlContent,
            textBody: name,
            designJson: designData,
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
          htmlBody: htmlContent,
          textBody: name,
          editorType: "visual_designer",
          designJson: designData,
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
  };

  return (
    <AppShell noPadding>
      <div
        ref={containerRef}
        className={`flex flex-col overflow-hidden bg-background ${
          isFullscreen ? "h-screen w-screen" : "h-[calc(100vh-64px)]"
        }`}
      >
        <EditorHeader
          name={name}
          status={status}
          setStatus={setStatus}
          handleSave={handleSave}
          isSaving={isSaving}
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
          className={isPreviewActive ? "hidden" : ""}
        />
        <div className="flex-1 flex overflow-hidden relative">
          {id && isLoadingDetails && (
            <div className="absolute inset-0 bg-background/80 z-[10000] flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium">
                Loading email template details...
              </p>
            </div>
          )}
          <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden relative">
            <div className="px-4 py-2 border-b border-border bg-muted/40 flex items-center gap-2 shrink-0">
              <Button size="icon" variant="ghost" onClick={undo} className="size-7" title="Undo">
                <Undo2 className="size-3.5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={redo} className="size-7" title="Redo">
                <Redo2 className="size-3.5" />
              </Button>
              <span className="h-4 w-px bg-border mx-1" />
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <Layout className="size-3.5 text-primary" /> Drag elements into canvas below
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isPreviewActive ? "secondary" : "ghost"}
                  onClick={togglePreview}
                  className="h-7 px-2 text-xs flex items-center gap-1.5 font-medium"
                  title={isPreviewActive ? "Exit Preview" : "Preview"}
                >
                  {isPreviewActive ? (
                    <EyeOff className="size-3.5 text-primary" />
                  ) : (
                    <Eye className="size-3.5 text-muted-foreground" />
                  )}
                  {isPreviewActive ? "Edit Mode" : "Preview"}
                </Button>
                <Button
                  size="sm"
                  variant={isFullscreen ? "secondary" : "ghost"}
                  onClick={toggleFullscreen}
                  className="h-7 px-2 text-xs flex items-center gap-1.5 font-medium"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize className="size-3.5 text-primary" />
                  ) : (
                    <Maximize className="size-3.5 text-muted-foreground" />
                  )}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </Button>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <div id="gjs" className="gjs-editor-container" />
            </div>
          </div>
          <EditorSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedType={selectedType}
            templateKey={templateKey}
            subject={subject}
            getContent={getEditorHtmlContent}
            disabled={isSaving}
            className={isPreviewActive ? "!hidden" : ""}
          />
        </div>
      </div>
      <EditorModals
        linkModalOpen={linkModalOpen}
        setLinkModalOpen={setLinkModalOpen}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        handleInsertLink={handleInsertLink}
        videoModalOpen={videoModalOpen}
        setVideoModalOpen={setVideoModalOpen}
        videoSourceType={videoSourceType}
        setVideoSourceType={setVideoSourceType}
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        videoProvider={videoProvider}
        setVideoProvider={setVideoProvider}
        handleSaveVideo={handleSaveVideo}
        tableModalOpen={tableModalOpen}
        setTableModalOpen={setTableModalOpen}
        tableRows={tableRows}
        setTableRows={setTableRows}
        tableCols={tableCols}
        setTableCols={setTableCols}
        tableHasHeader={tableHasHeader}
        setTableHasHeader={setTableHasHeader}
        handleInsertTable={handleInsertTable}
        handleCancelTable={handleCancelTable}
      />
    </AppShell>
  );
}

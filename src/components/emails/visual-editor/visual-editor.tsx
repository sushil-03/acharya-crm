import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Layout, Eye, EyeOff, Maximize, Minimize } from "lucide-react";
import { toast } from "sonner";
import { saveEmailTemplate } from "@/store/use-email-templates-store";
import { EmailTemplate } from "@/types/email-templates-types";

import { EditorHeader } from "./editor-header";
import { EditorInputs } from "./editor-inputs";
import { EditorSidebar } from "./editor-sidebar";
import { EditorModals } from "./editor-modals";
import { useGrapesJsEditor } from "../hooks/controller/use-grapesjs-editor";

export function VisualEditor({ id }: { id?: string }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [visualData, setVisualData] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [template, setTemplate] = useState<EmailTemplate | null>(null);

  const [activeTab, setActiveTab] = useState<"content" | "rows" | "settings">("content");
  const [testEmails, setTestEmails] = useState("");
  const [selectedType, setSelectedType] = useState<string>("None");
  
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  const handleSendTest = () => {
    if (!testEmails.trim()) return toast.error("Please enter at least one email address");
    toast.success(`Test email successfully sent to ${testEmails}!`);
    setTestEmails("");
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");

    saveEmailTemplate({
      id: id || `temp-${Math.random().toString(36).slice(2, 10)}`,
      name,
      subject,
      content,
      visualData,
      type: "visual",
      tags,
      status,
      createdBy: template?.createdBy || "Admin",
      modifiedBy: "Admin",
      accessibleTo: template?.accessibleTo || "Everyone",
      createdOn: template?.createdOn || new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    });
    toast.success("Template saved successfully");
    navigate({ to: "/email-templates" });
  };

  return (
    <AppShell noPadding>
      <div
        ref={containerRef}
        className={`flex flex-col overflow-hidden bg-background ${
          isFullscreen ? "h-screen w-screen" : "h-[calc(100vh-64px)]"
        }`}
      >
        <EditorHeader name={name} status={status} setStatus={setStatus} handleSave={handleSave} />
        <EditorInputs
          name={name}
          setName={setName}
          subject={subject}
          setSubject={setSubject}
          tags={tags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          className={isPreviewActive ? "hidden" : ""}
        />
        <div className="flex-1 flex overflow-hidden">
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
                  {isPreviewActive ? <EyeOff className="size-3.5 text-primary" /> : <Eye className="size-3.5 text-muted-foreground" />}
                  {isPreviewActive ? "Edit Mode" : "Preview"}
                </Button>
                <Button
                  size="sm"
                  variant={isFullscreen ? "secondary" : "ghost"}
                  onClick={toggleFullscreen}
                  className="h-7 px-2 text-xs flex items-center gap-1.5 font-medium"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="size-3.5 text-primary" /> : <Maximize className="size-3.5 text-muted-foreground" />}
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
            testEmails={testEmails}
            setTestEmails={setTestEmails}
            handleSendTest={handleSendTest}
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

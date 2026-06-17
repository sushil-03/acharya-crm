import { useState, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { EDITOR_ID, MERGE_FIELDS } from "./constants";

import { useGetEmailTemplateDetails } from "../hooks/query/use-get-email-template-details";
import { useGetEmailTemplateCategories } from "../hooks/query/use-get-email-template-categories";
import { useCreateEmailTemplate } from "../hooks/mutation/use-create-email-template";
import { useUpdateEmailTemplate } from "../hooks/mutation/use-update-email-template";

export function useRichTextEditor(id?: string) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [testEmails, setTestEmails] = useState("");

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const lastFocusedRef = useRef<"subject" | "content">("content");
  const contentValRef = useRef("");
  const isLoadedRef = useRef(false);
  // Kept up-to-date each render so TinyMCE callback is never stale
  const openTemplatePickerRef = useRef(() => setShowTemplatePicker(true));
  openTemplatePickerRef.current = () => setShowTemplatePicker(true);

  // Queries & Mutations
  const { data: templateDetails, isLoading: isLoadingDetails } = useGetEmailTemplateDetails(id);
  const { data: categoriesData = [] } = useGetEmailTemplateCategories();
  const defaultCategories = ["general", "marketing", "transactional", "admissions", "finance"];
  const categories = categoriesData.length > 0 ? categoriesData : defaultCategories;

  const { mutateAsync: createTemplate, isPending: isCreating } = useCreateEmailTemplate();
  const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateEmailTemplate();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    contentValRef.current = content;
  }, [content]);

  // Load existing template details
  useEffect(() => {
    if (id && templateDetails && !isLoadedRef.current) {
      isLoadedRef.current = true;
      setName(templateDetails.name || "");
      setSubject(templateDetails.subject || "");
      setCategory(templateDetails.category || "");
      setStatus(templateDetails.isActive ? "Published" : "Draft");

      const loadedContent = templateDetails.htmlBody || templateDetails.textBody || "";
      setContent(loadedContent);
      setEditorContent(loadedContent);
    }
  }, [id, templateDetails]);

  // Clean initialization for new templates
  useEffect(() => {
    if (!id) {
      setName("");
      setSubject("");
      setCategory("");
      setTags([]);
      setStatus("Draft");
      setContent("");
      setEditorContent("");
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const scriptId = "tinymce-cdn-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initTiny = () => {
      if (!active || !(window as any).tinymce) return;
      (window as any).tinymce.remove(`#${EDITOR_ID}`);
      (window as any).tinymce.init(buildTinyConfig(contentValRef, setContent, lastFocusedRef, openTemplatePickerRef));
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js";
      script.async = true;
      script.onload = () => {
        if (active) initTiny();
      };
      document.body.appendChild(script);
    } else if ((window as any).tinymce) {
      const t = setTimeout(initTiny, 50);
      return () => clearTimeout(t);
    } else {
      script.addEventListener("load", initTiny);
    }

    return () => {
      active = false;
      (window as any).tinymce?.remove(`#${EDITOR_ID}`);
    };
  }, []);

  function handleAddTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!category) return toast.error("Category is required");

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
            htmlBody: content,
            textBody: name, // Plain text description / body can fallback to name or simple tags
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
          htmlBody: content,
          textBody: name,
          editorType: "rich_text",
          designJson: {},
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
  }

  function insertTemplate(htmlBody: string) {
    const editor = (window as any).tinymce?.get(EDITOR_ID);
    if (editor) {
      editor.setContent(htmlBody);
      setContent(htmlBody);
    } else {
      setContent(htmlBody);
    }
  }

  function insertMergeField(key: string) {
    const placeholder = `{{${key}}}`;
    if (lastFocusedRef.current === "subject") {
      setSubject((prev) => prev + " " + placeholder);
    } else {
      const editor = (window as any).tinymce?.get(EDITOR_ID);
      if (editor) {
        editor.insertContent(placeholder);
        setContent(editor.getContent());
      } else {
        setContent((prev) => prev + placeholder);
      }
    }
  }

  function handleSendTest() {
    if (!testEmails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }
    toast.success(`Test email sent to ${testEmails}!`);
    setTestEmails("");
  }

  return {
    name,
    setName,
    subject,
    setSubject,
    category,
    setCategory,
    categories,
    content,
    setContent,
    tags,
    tagInput,
    setTagInput,
    status,
    setStatus,
    testEmails,
    setTestEmails,
    lastFocusedRef,
    handleAddTag,
    handleRemoveTag,
    handleSave,
    insertMergeField,
    insertTemplate,
    handleSendTest,
    isSaving,
    isLoadingDetails,
    showTemplatePicker,
    setShowTemplatePicker,
  };
}

function setEditorContent(html: string) {
  const editor = (window as any).tinymce?.get(EDITOR_ID);
  if (editor) editor.setContent(html);
}

function buildTinyConfig(
  contentValRef: MutableRefObject<string>,
  setContent: (c: string) => void,
  lastFocusedRef: MutableRefObject<"subject" | "content">,
  openTemplatePickerRef: MutableRefObject<() => void>,
) {
  return {
    selector: `#${EDITOR_ID}`,
    height: "100%",
    menubar: false,
    statusbar: false,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "wordcount",
      "emoticons",
    ],
    toolbar: [
      "fontfamily fontsize | forecolor backcolor | bold italic underline strikethrough | subscript superscript | removeformat",
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link anchor | image media table | emoticons charmap | mailmergefields | usetemplatebutton | code fullscreen preview",
    ],
    toolbar_mode: "wrap" as const,
    image_advtab: true,
    automatic_uploads: false,
    file_picker_types: "image",
    file_picker_callback: (
      callback: (url: string, meta: Record<string, string>) => void,
      _value: string,
      meta: { filetype: string },
    ) => {
      if (meta.filetype !== "image") return;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image too large (max 5MB)");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target?.result as string, { alt: file.name });
        reader.readAsDataURL(file);
      };
      input.click();
    },
    content_style:
      "body { font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif; font-size:14px; color: #1e293b; padding: 10px; margin: 0; }",
    branding: false,
    setup: (editor: any) => {
      editor.ui.registry.addButton("usetemplatebutton", {
        text: "Use Template",
        tooltip: "Load content from an existing template",
        onAction: () => openTemplatePickerRef.current(),
      });

      editor.ui.registry.addMenuButton("mailmergefields", {
        text: "Mail Merge Fields",
        tooltip: "Insert a personalization field",
        fetch: (callback: (items: unknown[]) => void) => {
          const items = MERGE_FIELDS.map((field) => ({
            type: "menuitem",
            text: `{{${field.key}}} — ${field.label}`,
            onAction: () => {
              editor.insertContent(`{{${field.key}}}`);
              setContent(editor.getContent());
            },
          }));
          callback(items);
        },
      });

      editor.on("change keyup undo redo", () => setContent(editor.getContent()));
      editor.on("init", () => editor.setContent(contentValRef.current));
      editor.on("focus", () => {
        lastFocusedRef.current = "content";
      });
    },
  };
}

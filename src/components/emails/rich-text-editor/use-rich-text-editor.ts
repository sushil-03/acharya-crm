import { useState, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  getEmailTemplate,
  saveEmailTemplate,
  createBlankEmailTemplate,
} from "@/store/use-email-templates-store";
import { EmailTemplate } from "@/types/email-templates-types";
import { toast } from "sonner";
import {
  EDITOR_ID,
  MERGE_FIELDS,
  DEFAULT_CONTENT,
  DEFAULT_SUBJECT,
} from "./constants";

export function useRichTextEditor(id?: string) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [testEmails, setTestEmails] = useState("");

  const lastFocusedRef = useRef<"subject" | "content">("content");
  const contentValRef = useRef("");

  useEffect(() => {
    contentValRef.current = content;
  }, [content]);

  useEffect(() => {
    if (id) {
      const existing = getEmailTemplate(id);
      if (existing) {
        setTemplate(existing);
        setName(existing.name);
        setSubject(existing.subject);
        setContent(existing.content);
        setTags(existing.tags);
        setStatus(existing.status);
        setEditorContent(existing.content);
      } else {
        toast.error("Template not found");
        navigate({ to: "/email-templates" });
      }
    } else {
      const blank = createBlankEmailTemplate("rich-text");
      setTemplate(blank);
      setName("Scholarship Offer Visual Nudge");
      setSubject(DEFAULT_SUBJECT);
      setContent(DEFAULT_CONTENT);
      setTags(["Scholarship", "Nudge", "Rich-Text"]);
      setEditorContent(DEFAULT_CONTENT);
    }
  }, [id, navigate]);

  useEffect(() => {
    let active = true;
    const scriptId = "tinymce-cdn-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initTiny = () => {
      if (!active || !(window as any).tinymce) return;
      (window as any).tinymce.remove(`#${EDITOR_ID}`);
      (window as any).tinymce.init(
        buildTinyConfig(contentValRef, setContent, lastFocusedRef),
      );
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

  function handleSave() {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!template) return;

    saveEmailTemplate({
      ...template,
      name,
      subject,
      content,
      tags,
      status,
      modifiedBy: "Admin",
    });
    toast.success("Template saved successfully");
    navigate({ to: "/email-templates" });
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
    handleSendTest,
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
) {
  return {
    selector: `#${EDITOR_ID}`,
    height: "100%",
    menubar: false,
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
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link anchor | image media table | emoticons charmap | mailmergefields | code fullscreen preview",
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
        reader.onload = (e) =>
          callback(e.target?.result as string, { alt: file.name });
        reader.readAsDataURL(file);
      };
      input.click();
    },
    content_style:
      "body { font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif; font-size:14px; color: #1e293b; padding: 20px; }",
    branding: false,
    setup: (editor: any) => {
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

      editor.on("change keyup undo redo", () =>
        setContent(editor.getContent()),
      );
      editor.on("init", () => editor.setContent(contentValRef.current));
      editor.on("focus", () => {
        lastFocusedRef.current = "content";
      });
    },
  };
}

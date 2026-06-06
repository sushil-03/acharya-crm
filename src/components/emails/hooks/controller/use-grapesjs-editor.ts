import { useEffect, MutableRefObject, Dispatch, SetStateAction } from "react";
import { getEmailTemplate } from "@/store/use-email-templates-store";
import { EmailTemplate } from "@/types/email-templates-types";

export interface UseGrapesJsEditorProps {
  id?: string;
  editorRef: MutableRefObject<any>;
  setContent: Dispatch<SetStateAction<string>>;
  setVisualData: Dispatch<SetStateAction<string>>;
  setRteInstance: Dispatch<SetStateAction<any>>;
  setLinkUrl: Dispatch<SetStateAction<string>>;
  setLinkModalOpen: Dispatch<SetStateAction<boolean>>;
  setActiveTab: Dispatch<SetStateAction<"content" | "rows" | "settings" | "variables">>;
  setSelectedVideoComponent: Dispatch<SetStateAction<any>>;
  setVideoUrl: Dispatch<SetStateAction<string>>;
  setVideoProvider: Dispatch<SetStateAction<"so" | "yt" | "vi">>;
  setVideoSourceType: Dispatch<SetStateAction<"url" | "file">>;
  setVideoModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedType: Dispatch<SetStateAction<string>>;
  setName: Dispatch<SetStateAction<string>>;
  setSubject: Dispatch<SetStateAction<string>>;
  setTags: Dispatch<SetStateAction<string[]>>;
  setStatus: Dispatch<SetStateAction<"Draft" | "Published">>;
  setTemplate: Dispatch<SetStateAction<EmailTemplate | null>>;
  setTableModalOpen: Dispatch<SetStateAction<boolean>>;
  placeholderModelRef: MutableRefObject<any>;
  setIsEditorInitialized: Dispatch<SetStateAction<boolean>>;
}

export function useGrapesJsEditor({
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
}: UseGrapesJsEditorProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      await import("grapesjs/dist/css/grapes.min.css");
      const { default: grapesjs } = await import("grapesjs");
      if (cancelled) return;

      const editor = grapesjs.init({
        container: "#gjs",
        fromElement: false,
        height: "100%",
        width: "auto",
        storageManager: false,
        panels: { defaults: [] },
        colorPicker: { appendTo: "body" },
        blockManager: { appendTo: "#blocks-container" },
        traitManager: { appendTo: "#traits-container" },
        canvas: {
          styles: ["body { padding: 40px 20px; background-color: #f1f5f9; min-height: 100%; }"],
        },
        styleManager: {
          appendTo: "#styles-container",
          sectors: [
            {
              name: "Dimension",
              open: false,
              buildProps: ["width", "height", "max-width", "min-height", "margin", "padding"],
            },
            {
              name: "Typography",
              open: false,
              buildProps: [
                "font-family",
                "font-size",
                "font-weight",
                "color",
                "text-align",
                "line-height",
              ],
            },
            {
              name: "Decorations",
              open: false,
              buildProps: ["background-color", "border", "border-radius", "box-shadow"],
            },
          ],
        },
      });

      editorRef.current = editor;

      editor.on("component:add", (model) => {
        const attrs = model.getAttributes();
        if (attrs && attrs["data-table-placeholder"] === "true") {
          placeholderModelRef.current = model;
          setTimeout(() => {
            setTableModalOpen(true);
          }, 100);
        }
      });

      const rte = editor.RichTextEditor;
      rte.remove("link");
      rte.add("link", {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
        attributes: { title: "Link" },
        result: (rteInstance) => {
          setRteInstance(rteInstance);
          setLinkUrl("");
          setLinkModalOpen(true);
        },
      });

      const bm = editor.BlockManager;
      bm.add("card-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" stroke-dasharray="3 3"/></svg><span>CARD</span></div>`,
        category: "Content",
        content:
          '<div style="font-family: sans-serif; max-width: 600px; margin: 15px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; min-height: 150px; display: flex; flex-direction: column; gap: 10px;"></div>',
      });
      bm.add("title-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="2.5" rx="1.25"/><rect x="10.75" y="6.5" width="2.5" height="13.5" rx="1.25"/></svg><span>TITLE</span></div>`,
        category: "Content",
        content:
          '<h1 style="color: #800000; font-family: sans-serif; font-size: 28px; margin: 10px 0; text-align: center;">Design Your Email</h1>',
      });
      bm.add("text-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="2" rx="1"/><rect x="3" y="9" width="18" height="2" rx="1"/><rect x="3" y="14" width="18" height="2" rx="1"/><rect x="3" y="19" width="12" height="2" rx="1"/></svg><span>TEXT</span></div>`,
        category: "Content",
        content:
          '<p style="color: #475569; font-family: sans-serif; font-size: 14px; line-height: 1.6; margin: 10px 0;">Let\'s create a beautiful email! You can drag and drop different structure blocks as well as content blocks to arrange your content. You can also customize background colors and fonts to make your content come alive.</p>',
      });
      bm.add("image-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 19h11l-3.54-6.71z"/><circle cx="8" cy="9" r="1.5"/></svg><span>IMAGE</span></div>`,
        category: "Content",
        content: {
          type: "image",
          style: { width: "100%", "max-width": "300px", margin: "10px auto", display: "block" },
        },
      });
      bm.add("button-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M4 7h16a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3zm1 4h8v2H5v-2zm10.5-1.5l3 2.5-3 2.5v-5z"/></svg><span>BUTTON</span></div>`,
        category: "Content",
        content:
          '<div style="text-align: center; margin: 15px 0;"><a href="#" style="background-color: #800000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-family: sans-serif; font-size: 14px; display: inline-block;">Click Here</a></div>',
      });
      bm.add("divider-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5.5" width="18" height="1.5" rx="0.75"/><rect x="3" y="11" width="18" height="2.5" rx="1.25"/><rect x="3" y="17" width="18" height="1.5" rx="0.75"/></svg><span>DIVIDER</span></div>`,
        category: "Content",
        content: '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />',
      });
      bm.add("social-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg><span>SOCIAL</span></div>`,
        category: "Content",
        content:
          '<div style="text-align: center; margin: 15px 0; display: flex; justify-content: center; gap: 10px;"><a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #3b5998; color: white; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none; font-family: sans-serif; font-weight: bold;">F</a><a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #1da1f2; color: white; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none; font-family: sans-serif; font-weight: bold;">X</a><a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #0077b5; color: white; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none; font-family: sans-serif; font-weight: bold;">in</a><a href="#" style="display: inline-block; width: 32px; height: 32px; background-color: #e1306c; color: white; border-radius: 50%; text-align: center; line-height: 32px; text-decoration: none; font-family: sans-serif; font-weight: bold;">I</a></div>',
      });
      bm.add("html-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg><span>HTML</span></div>`,
        category: "Content",
        content:
          '<div style="padding: 10px; border: 1px dashed #cbd5e1; border-radius: 6px; text-align: center; color: #64748b; font-family: sans-serif; font-size: 13px;">Custom HTML code goes here</div>',
      });
      bm.add("video-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg><span>VIDEO</span></div>`,
        category: "Content",
        content: {
          type: "video",
          style: {
            width: "100%",
            height: "300px",
            margin: "15px auto",
            "background-color": "#000",
          },
          attributes: { controls: true },
        },
      });
      bm.add("icons-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>ICONS</span></div>`,
        category: "Content",
        content:
          '<div style="text-align: center; margin: 15px 0; display: flex; justify-content: center; gap: 15px;"><span style="font-size: 24px; color: #800000;">★</span><span style="font-size: 24px; color: #800000;">♥</span><span style="font-size: 24px; color: #800000;">✦</span></div>',
      });
      bm.add("menu-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="5" width="18" height="2" rx="1"/><rect x="3" y="11" width="18" height="2" rx="1"/><rect x="3" y="17" width="18" height="2" rx="1"/></svg><span>MENU</span></div>`,
        category: "Content",
        content:
          '<div style="text-align: center; padding: 10px 0; font-family: sans-serif;"><a href="#" style="color: #475569; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500;">Home</a><a href="#" style="color: #475569; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500;">About</a><a href="#" style="color: #475569; text-decoration: none; margin: 0 15px; font-size: 14px; font-weight: 500;">Contact</a></div>',
      });
      bm.add("table-block", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="9" width="5" height="5" rx="1"/><rect x="9.5" y="9" width="5" height="5" rx="1"/><rect x="16" y="9" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><rect x="9.5" y="16" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/></svg><span>TABLE</span></div>`,
        category: "Content",
        content: `<div data-table-placeholder="true" style="padding: 20px; border: 2px dashed #800000; text-align: center; color: #800000; font-family: sans-serif; font-size: 13px; font-weight: bold; background-color: #fff5f5; border-radius: 6px; margin: 10px 0;">[ Table Configuration - Select rows & columns ]</div>`,
      });

      bm.add("row-1-col", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg><span>1 Column</span></div>`,
        category: "Rows",
        content: '<div style="padding: 10px; display: flex; flex-direction: column;"></div>',
      });
      bm.add("row-2-col", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="9" height="18" rx="2"/><rect x="13" y="3" width="9" height="18" rx="2"/></svg><span>2 Column</span></div>`,
        category: "Rows",
        content:
          '<div style="display: flex; gap: 10px; padding: 10px;"><div style="flex: 1; padding: 10px;">Column 1</div><div style="flex: 1; padding: 10px;">Column 2</div></div>',
      });
      bm.add("row-3-col", {
        label: `<div class="custom-block-label"><svg class="block-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="5.5" height="18" rx="1.5"/><rect x="9.25" y="3" width="5.5" height="18" rx="1.5"/><rect x="16.5" y="3" width="5.5" height="18" rx="1.5"/></svg><span>3 Column</span></div>`,
        category: "Rows",
        content:
          '<div style="display: flex; gap: 10px; padding: 10px;"><div style="flex: 1; padding: 10px;">Column 1</div><div style="flex: 1; padding: 10px;">Column 2</div><div style="flex: 1; padding: 10px;">Column 3</div></div>',
      });

      const addCategoryClasses = () => {
        try {
          const categories = editor.BlockManager.getCategories();
          const models = categories.models || (Array.isArray(categories) ? categories : []);
          models.forEach((category: any) => {
            if (category && category.view && category.view.el) {
              category.view.el.classList.add(`gjs-category-${category.get("id")}`);
            }
          });
        } catch (e) {
          console.error("Error adding category classes:", e);
        }
      };

      const handleCanvasDblClick = () => {
        try {
          const canvasDoc = editor.Canvas.getDocument();
          if (canvasDoc) {
            canvasDoc.addEventListener("dblclick", () => {
              const selected = editor.getSelected();
              if (selected) {
                const type = selected.get("type");
                if (type === "video") {
                  setActiveTab("settings");
                  setSelectedVideoComponent(selected);
                  const src = selected.get("src") || "";
                  setVideoUrl(src);
                  setVideoProvider(selected.get("provider") || "so");
                  setVideoSourceType(src.startsWith("data:video/") ? "file" : "url");
                  setVideoModalOpen(true);
                } else if (
                  type === "image" ||
                  (type !== "text" && type !== "default" && type !== "")
                ) {
                  setActiveTab("settings");
                }
              }
            });
          }
        } catch (err) {
          console.error("Error setting up canvas dblclick:", err);
        }
      };

      editor.on("load", () => {
        addCategoryClasses();
        handleCanvasDblClick();
      });
      addCategoryClasses();
      handleCanvasDblClick();

      editor.on("update", () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        setContent(`<style>${css}</style>${html}`);
        setVisualData(JSON.stringify(editor.getProjectData()));
      });

      editor.on("component:selected", (model) => {
        if (model) {
          const type = model.get("type") || "Element";
          setSelectedType(type.charAt(0).toUpperCase() + type.slice(1));
          // Remove the useless "title" trait (sets HTML tooltip only) from every component
          const traits = model.get("traits");
          if (traits) {
            const titleTrait = traits.where({ name: "title" })[0];
            if (titleTrait) traits.remove(titleTrait);
          }
        }
      });
      editor.on("component:deselected", () => setSelectedType("None"));

      setIsEditorInitialized(true);

      const handlePickerClick = (e: Event) => {
        const replacer = (e.target as Element).closest?.(
          ".sp-replacer, .gjs-field-color, .gjs-field-color-picker",
        ) as HTMLElement | null;
        if (!replacer) return;
        const reposition = () => {
          const container = (document.querySelector(".gjs-color-picker") ||
            document.querySelector(".sp-container:not(.sp-hidden)")) as HTMLElement | null;
          if (!container) return;
          const rect = replacer.getBoundingClientRect();
          const pickerW = container.offsetWidth || 230;
          const pickerH = container.offsetHeight || 250;
          const left = Math.max(0, Math.min(rect.left, window.innerWidth - pickerW - 8));

          let top = rect.bottom + 4;
          if (top + pickerH > window.innerHeight && rect.top - pickerH - 4 > 0) {
            top = rect.top - pickerH - 4;
          }

          container.style.setProperty("position", "fixed", "important");
          container.style.setProperty("top", `${top}px`, "important");
          container.style.setProperty("left", `${left}px`, "important");
          container.style.setProperty("z-index", "99999", "important");
        };
        setTimeout(reposition, 0);
        setTimeout(reposition, 60);
        setTimeout(reposition, 200);
      };
      document.addEventListener("click", handlePickerClick, true);
      (editor as any)._colorPickerClickHandler = handlePickerClick;
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (editorRef.current) {
        const handler = (editorRef.current as any)._colorPickerClickHandler as
          | EventListener
          | undefined;
        if (handler) document.removeEventListener("click", handler, true);
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [id]);
}

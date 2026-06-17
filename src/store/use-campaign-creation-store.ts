import { create } from "zustand";

type CreationMode = "use-template" | "build-from-scratch";
type EditorType = "visual" | "rich-text" | "plain-text" | "html";

interface CampaignCreationState {
  // Wizard position
  step: number;
  // Step 1 — details
  name: string;
  category: string;
  mode: CreationMode;
  selectedTemplateId: string;
  selectedTemplateName: string;
  editorType: EditorType | null;
  // Step 2 — compose
  subject: string;
  previewText: string;
  fromName: string;
  replyTo: string;

  setStep: (step: number) => void;
  setName: (name: string) => void;
  setCategory: (category: string) => void;
  setMode: (mode: CreationMode) => void;
  setSelectedTemplate: (id: string, name: string) => void;
  setEditorType: (type: EditorType) => void;
  setSubject: (subject: string) => void;
  setPreviewText: (text: string) => void;
  setFromName: (name: string) => void;
  setReplyTo: (email: string) => void;
  reset: () => void;
}

const INITIAL: Omit<CampaignCreationState, keyof Pick<CampaignCreationState,
  | "setStep" | "setName" | "setCategory" | "setMode" | "setSelectedTemplate"
  | "setEditorType" | "setSubject" | "setPreviewText" | "setFromName" | "setReplyTo" | "reset"
>> = {
  step: 0,
  name: "",
  category: "",
  mode: "use-template",
  selectedTemplateId: "",
  selectedTemplateName: "",
  editorType: null,
  subject: "",
  previewText: "",
  fromName: "",
  replyTo: "",
};

export const useCampaignCreationStore = create<CampaignCreationState>((set) => ({
  ...INITIAL,
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setCategory: (category) => set({ category }),
  setMode: (mode) => set({ mode, selectedTemplateId: "", selectedTemplateName: "" }),
  setSelectedTemplate: (id, name) => set({ selectedTemplateId: id, selectedTemplateName: name }),
  setEditorType: (editorType) => set({ editorType }),
  setSubject: (subject) => set({ subject }),
  setPreviewText: (previewText) => set({ previewText }),
  setFromName: (fromName) => set({ fromName }),
  setReplyTo: (replyTo) => set({ replyTo }),
  reset: () => set(INITIAL),
}));

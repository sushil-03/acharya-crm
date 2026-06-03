import { createFileRoute } from "@tanstack/react-router";
import { RichTextEditor } from "@/components/emails/rich-text-editor";

export const Route = createFileRoute("/email-templates/create/rich-text")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || undefined,
  }),
  component: function RichTextEditorPage() {
    const { id } = Route.useSearch();
    return <RichTextEditor id={id} />;
  },
});

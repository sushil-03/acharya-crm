import { createFileRoute } from "@tanstack/react-router";
import { HtmlEditor } from "@/components/emails/html-editor/html-editor";

export const Route = createFileRoute("/email-templates/create/html")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search.id as string) || undefined,
    };
  },
  component: HtmlEditorPage,
});

function HtmlEditorPage() {
  const { id } = Route.useSearch();
  return <HtmlEditor id={id} />;
}

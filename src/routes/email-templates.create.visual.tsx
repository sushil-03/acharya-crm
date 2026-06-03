import { VisualEditor } from "@/components/emails/visual-editor/visual-editor";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/email-templates/create/visual")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: (search.id as string) || undefined,
    };
  },
  component: VisualEditorPage,
});

function VisualEditorPage() {
  const { id } = Route.useSearch();
  return <VisualEditor id={id} />;
}

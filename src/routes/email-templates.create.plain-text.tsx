import { createFileRoute } from "@tanstack/react-router";
import { PlainTextEditor } from "@/components/emails/plain-text-editor/plain-text-editor";

export const Route = createFileRoute("/email-templates/create/plain-text")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || undefined,
  }),
  component: PlainTextEditorPage,
});

function PlainTextEditorPage() {
  const { id } = Route.useSearch();
  return <PlainTextEditor id={id} />;
}

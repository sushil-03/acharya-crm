import { createFileRoute } from "@tanstack/react-router";
import { EmailTemplatesList } from "@/components/emails/email-templates-list";

export const Route = createFileRoute("/email-templates/")({
  component: EmailTemplatesPage,
  head: () => ({ meta: [{ title: "Email Library — Acharya One" }] })
});

function EmailTemplatesPage() {
  return <EmailTemplatesList />;
}

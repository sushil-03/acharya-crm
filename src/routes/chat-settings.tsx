import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Palette, LayoutTemplate, Bot, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card } from "@/components/ui-kit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WidgetAppearance } from "@/components/communications/settings/widget-appearance";
import { TemplateManager } from "@/components/communications/settings/template-manager";
import { AutoResponses } from "@/components/communications/settings/auto-responses";
import { AssignmentRules } from "@/components/communications/settings/assignment-rules";

export const Route = createFileRoute("/chat-settings")({
  component: ChatSettingsPage,
  head: () => ({ meta: [{ title: "Chat Settings — Acharya One" }] }),
});

function ChatSettingsPage() {
  return (
    <AppShell>
      <PageHeader
        breadcrumb="Growth"
        title="Chat Settings"
        subtitle="Customize your communication hub appearance, templates, and automation rules."
        actions={
          <Link
            to="/communications"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card hover:bg-muted text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Inbox
          </Link>
        }
      />

      <Card className="p-6">
        <Tabs defaultValue="appearance">
          <TabsList className="mb-6 h-10">
            <TabsTrigger value="appearance" className="flex items-center gap-1.5 px-4">
              <Palette className="size-4" /> Widget Appearance
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1.5 px-4">
              <LayoutTemplate className="size-4" /> Templates
            </TabsTrigger>
            <TabsTrigger value="autoresponses" className="flex items-center gap-1.5 px-4">
              <Bot className="size-4" /> Auto-Responses
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-1.5 px-4">
              <Users className="size-4" /> Assignment Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <WidgetAppearance />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="autoresponses">
            <AutoResponses />
          </TabsContent>

          <TabsContent value="assignment">
            <AssignmentRules />
          </TabsContent>
        </Tabs>
      </Card>
    </AppShell>
  );
}

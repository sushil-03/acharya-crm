import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Mail,
  Sparkles,
  Edit,
  Copy,
  Trash2,
  Settings2,
  FileCode2,
  FileText,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { EditorChoiceDialog } from "@/components/emails/editor-choice-dialog";
import {
  getEmailTemplates,
  deleteEmailTemplate,
  saveEmailTemplate
} from "@/store/use-email-templates-store";
import { EmailTemplate } from "@/types/email-templates-types";
import { toast } from "sonner";


export const Route = createFileRoute("/email-templates/")({
  component: EmailTemplatesPage,
  head: () => ({ meta: [{ title: "Email Library — Acharya One" }] })
});

function EmailTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load templates on mount
  useEffect(() => {
    setTemplates(getEmailTemplates());
  }, []);

  const handleRefresh = () => {
    setTemplates(getEmailTemplates());
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      deleteEmailTemplate(id);
      toast.success("Template deleted successfully");
      handleRefresh();
    }
  };

  const handleClone = (template: EmailTemplate) => {
    const cloned: EmailTemplate = {
      ...template,
      id: `temp-${Math.random().toString(36).slice(2, 10)}`,
      name: `${template.name}_Copy`,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
      status: "Draft"
    };
    saveEmailTemplate(cloned);
    toast.success("Template cloned successfully");
    handleRefresh();
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = React.useMemo(() => {
    const total = templates.length;
    const visual = templates.filter((t) => t.type === "visual").length;
    const richText = templates.filter((t) => t.type === "rich-text").length;
    const html = templates.filter((t) => t.type === "html").length;
    const plain = templates.filter((t) => t.type === "plain-text").length;
    const published = templates.filter((t) => t.status === "Published").length;

    return { total, visual, richText, html, plain, published };
  }, [templates]);

  // Proceed with selected editor
  const handleProceed = (editorType: "visual" | "rich-text" | "plain-text" | "html") => {
    setIsCreateOpen(false);
    navigate({
      to: `/email-templates/create/${editorType}`
    });
  };

  const getEditorTypeName = (type: string) => {
    switch (type) {
      case "visual":
        return "Visual Designer";
      case "rich-text":
        return "Rich Text Editor";
      case "html":
        return "HTML / Code";
      case "plain-text":
        return "Plain Text";
      default:
        return type;
    }
  };

  const getEditorTypeBadgeTone = (type: string) => {
    switch (type) {
      case "visual":
        return "primary-light";
      case "rich-text":
        return "info-light";
      case "html":
        return "gold-light";
      case "plain-text":
        return "muted";
      default:
        return "muted";
    }
  };

  return (
    <AppShell>
      <PageHeader
        breadcrumb="Automation"
        title="Email Library"
        subtitle="Manage, structure, and edit email templates for student communications."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/95 text-white">
            <Plus className="size-4 mr-1.5" /> Add Email Template
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Templates"
          value={stats.total.toString()}
          icon={<Mail className="size-4" />}
          accent="primary"
        />
        <StatCard
          label="Visual Editor"
          value={stats.visual.toString()}
          icon={<Sparkles className="size-4" />}
          accent="info"
        />
        <StatCard
          label="HTML & Rich Text"
          value={(stats.html + stats.richText).toString()}
          icon={<FileCode2 className="size-4" />}
          accent="gold"
        />
        <StatCard
          label="Published Templates"
          value={stats.published.toString()}
          icon={<CheckCircle2 className="size-4" />}
          accent="success"
        />
      </div>

      {/* Filter and Search Section */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, subject, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground/80 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="visual">Visual Designer</option>
                <option value="rich-text">Rich Text Editor</option>
                <option value="html">HTML</option>
                <option value="plain-text">Plain Text</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground/80 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Templates List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Template Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Created By</th>
                <th className="px-5 py-3">Modified By</th>
                <th className="px-5 py-3">Access</th>
                <th className="px-5 py-3">Created On</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Mail className="size-8 opacity-40 text-muted-foreground" />
                      <p className="font-medium">No templates found</p>
                      <p className="text-xs">Create a template to get started with email communications.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            navigate({
                              to: `/email-templates/create/${t.type}`,
                              search: { id: t.id } as any
                            })
                          }
                          className="text-left font-semibold text-primary hover:underline"
                        >
                          {t.name}
                        </button>
                        <span className="text-xs text-muted-foreground truncate max-w-[240px] mt-0.5">
                          {t.subject}
                        </span>
                        {t.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {t.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={getEditorTypeBadgeTone(t.type)}>
                        {getEditorTypeName(t.type)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{t.createdBy}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{t.modifiedBy}</td>
                    <td className="px-5 py-3.5 text-xs font-medium">{t.accessibleTo}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {new Date(t.createdOn).toLocaleDateString([], {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={t.status === "Published" ? "success" : "warning"}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Edit"
                          onClick={() =>
                            navigate({
                              to: `/email-templates/create/${t.type}`,
                              search: { id: t.id } as any
                            })
                          }
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Clone"
                          onClick={() => handleClone(t)}
                          className="h-8 w-8 text-muted-foreground hover:text-info"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete"
                          onClick={() => handleDelete(t.id, t.name)}
                          className="h-8 w-8 text-muted-foreground hover:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editor Choice Dialog (Create From Scratch) */}
      <EditorChoiceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onProceed={handleProceed}
      />
    </AppShell>
  );
}

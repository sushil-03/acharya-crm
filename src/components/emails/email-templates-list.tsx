import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Sparkles, FileCode2, CheckCircle2, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCampaignCreationStore } from "@/store/use-campaign-creation-store";
import { toast } from "sonner";
import { useGetEmailTemplates } from "./hooks/query/use-get-email-templates";
import { useGetEmailTemplateCategories } from "./hooks/query/use-get-email-template-categories";
import { useDeleteEmailTemplate } from "./hooks/mutation/use-delete-email-template";
import { useCreateEmailTemplate } from "./hooks/mutation/use-create-email-template";
import Axios from "@/lib/axios-config";
import { EmailTemplateBackend, CreateEmailTemplatePayload } from "./types";
import { EditorChoiceDialog } from "./editor-choice-dialog";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";
import { getEmailTemplatesColumns } from "./email-template-column";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EmailTemplatesList() {
  const navigate = useNavigate();
  const resetCampaignStore = useCampaignCreationStore((s) => s.reset);

  useEffect(() => {
    resetCampaignStore();
  }, []);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default to 10 rows per page
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Queries
  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useGetEmailTemplates({
    search: search || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    page,
    pageSize,
  });

  const { data: categories = [] } = useGetEmailTemplateCategories();

  // Mutations
  const { mutateAsync: createTemplate } = useCreateEmailTemplate();
  const { mutateAsync: deleteTemplate } = useDeleteEmailTemplate();

  const templates = templatesResponse?.data || [];

  const handleDelete = (id: string, name: string) => {
    setDeleteTemplateTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTemplateTarget) return;
    const { id } = deleteTemplateTarget;
    setDeleteTemplateTarget(null);
    try {
      toast.loading("Deleting template...", { id: "delete-template" });
      await deleteTemplate(id);
      toast.success("Template deleted successfully", { id: "delete-template" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete template";
      toast.error(message, { id: "delete-template" });
    }
  };

  const handleClone = async (id: string, name: string) => {
    try {
      toast.loading("Cloning template...", { id: "clone-template" });
      const { data: detail } = await Axios.get<EmailTemplateBackend>(
        `/api/v1/email-templates/${id}`,
      );

      const clonedPayload: CreateEmailTemplatePayload = {
        key: `${detail.key}_copy_${Math.random().toString(36).slice(2, 6)}`,
        name: `${detail.name} (Copy)`,
        subject: detail.subject,
        htmlBody: detail.htmlBody,
        textBody: detail.textBody,
        editorType: detail.editorType,
        designJson: detail.designJson,
        variables: detail.variables,
        category: detail.category,
        isActive: detail.isActive,
      };

      await createTemplate(clonedPayload);
      toast.success("Template cloned successfully", { id: "clone-template" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clone template";
      toast.error(message, { id: "clone-template" });
    }
  };

  const handleEdit = (id: string, editorType?: string) => {
    const routeType =
      editorType === "visual_designer"
        ? "visual"
        : editorType === "rich_text"
          ? "rich-text"
          : editorType === "html"
            ? "html"
            : editorType === "plain_text"
              ? "plain-text"
              : "visual";
    navigate({
      to: `/email-templates/create/${routeType}`,
      search: { id },
    });
  };

  // Wire up useDataGrid hook with manual (server-side) pagination
  const columns = React.useMemo(
    () =>
      getEmailTemplatesColumns({
        onEdit: handleEdit,
        onClone: handleClone,
        onDelete: handleDelete,
      }),
    [],
  );

  const dataGrid = useDataGrid({
    data: templates,
    columns,
    readOnly: true,
    manualPagination: true,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize });
        setPage(newState.pageIndex + 1);
        setPageSize(newState.pageSize);
      } else {
        setPage(updater.pageIndex + 1);
        setPageSize(updater.pageSize);
      }
    },
  });

  const stats = React.useMemo(() => {
    const total = templatesResponse?.meta?.total || templates.length;
    const visual = templates.filter(
      (t) => t.editorType === "visual_designer" || t.type === "visual",
    ).length;
    const richText = templates.filter(
      (t) => t.editorType === "rich_text" || t.type === "rich-text",
    ).length;
    const html = templates.filter((t) => t.editorType === "html" || t.type === "html").length;
    const plain = templates.filter(
      (t) => t.editorType === "plain_text" || t.type === "plain-text",
    ).length;
    const active = templates.filter((t) => t.isActive).length;

    return { total, visual, richText, html, plain, active };
  }, [templates, templatesResponse]);

  const handleProceed = (editorType: "visual" | "rich-text" | "plain-text" | "html") => {
    setIsCreateOpen(false);
    navigate({ to: `/email-templates/create/${editorType}` });
  };

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
          <p className="text-danger font-semibold">Error loading templates</p>
          <p className="text-muted-foreground text-xs">{error.message || "Something went wrong"}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell noPadding>
      <PageHeader
        title="Email Library"
        // subtitle="Manage, structure, and edit email templates for student communications."
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/95 text-white"
          >
            <Plus className="size-4 mr-1.5" /> Add Email Template
          </Button>
        }
      />
      <div className="p-3 flex flex-col min-h-0 h-full">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
            label="Active Templates"
            value={stats.active.toString()}
            icon={<CheckCircle2 className="size-4" />}
            accent="success"
          />
        </div>

        {/* Filter and Search Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, key, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger size={"sm"} className="w-[130px] ">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger size={"sm"} className="w-[130px] ">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 border-s pl-3 border-border">
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>
        </div>
        {/* DataGrid Component */}
        <div className="flex flex-col h-full min-h-0 flex-1">
          <Card className="overflow-hidden h-full flex flex-col relative">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataGrid
                {...dataGrid}
                stretchColumns
                showPagination
                totalElements={templatesResponse?.meta?.total || templates.length}
                className="flex-1"
              />
            )}
          </Card>
        </div>
      </div>
      <EditorChoiceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onProceed={handleProceed}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deleteTemplateTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTemplateTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the email template
              {deleteTemplateTarget && (
                <strong className="text-foreground"> "{deleteTemplateTarget.name}"</strong>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

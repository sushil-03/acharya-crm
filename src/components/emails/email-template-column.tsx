import { Badge } from "@/components/ui-kit";
import {
  Hash,
  Edit,
  Copy,
  Trash2,
  Mail,
  LayoutGrid,
  Layers,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { EmailTemplateBackendListItem } from "./types";
import { Button } from "@/components/ui/button";
import { getReadableDate } from "@/lib/utils";

interface EmailTemplateColumnsOptions {
  onEdit: (id: string, editorType?: string) => void;
  onClone: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}

const mapEditorTypeToRoute = (editorType?: string): string => {
  switch (editorType) {
    case "visual_designer":
      return "visual";
    case "rich_text":
      return "rich-text";
    case "html":
      return "html";
    case "plain_text":
      return "plain-text";
    default:
      return "visual";
  }
};

const getEditorTypeName = (editorType?: string) => {
  switch (editorType) {
    case "visual_designer":
      return "Visual Designer";
    case "rich_text":
      return "Rich Text Editor";
    case "html":
      return "HTML / Code";
    case "plain_text":
      return "Plain Text";
    default:
      return editorType || "Visual Designer";
  }
};

const getEditorTypeBadgeTone = (editorType?: string) => {
  switch (editorType) {
    case "visual_designer":
      return "primary-light";
    case "rich_text":
      return "info-light";
    case "html":
      return "gold-light";
    case "plain_text":
      return "muted";
    default:
      return "muted";
  }
};

export const getEmailTemplatesColumns = ({
  onEdit,
  onClone,
  onDelete,
}: EmailTemplateColumnsOptions): ColumnDef<EmailTemplateBackendListItem>[] => [
  {
    id: "sno",
    header: "S.No",
    meta: { label: "S.No", cell: { variant: "custom", headerIcon: Hash } },
    size: 60,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination || {
        pageIndex: 0,
        pageSize: 100,
      };
      return (
        <span className="text-[12px] tabular-nums pl-1">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Template Name",
    meta: { label: "Template Name", cell: { variant: "custom", headerIcon: Mail } },
    size: 300,
    cell: ({ row }) => {
      const t = row.original;
      const editorType = t.editorType || t.type || "visual_designer";
      return (
        <div className="flex flex-col py-1">
          <button
            onClick={() => onEdit(t.id, editorType)}
            className="text-left font-semibold text-primary hover:underline truncate max-w-[280px]"
          >
            {t.name}
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    meta: { label: "Category", cell: { variant: "custom", headerIcon: Layers } },
    size: 150,
    cell: ({ row }) => (
      <span className="capitalize text-xs font-medium">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "editorType",
    header: "Type",
    meta: { label: "Type", cell: { variant: "custom", headerIcon: LayoutGrid } },
    size: 160,
    cell: ({ row }) => {
      const editorType =
        row.original.editorType || row.original.type || "visual_designer";
      return (
        <Badge tone={getEditorTypeBadgeTone(editorType)}>{getEditorTypeName(editorType)}</Badge>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    meta: { label: "Last Updated", cell: { variant: "custom", headerIcon: Calendar } },
    size: 150,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {getReadableDate(row.original.updatedAt)}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    meta: { label: "Status", cell: { variant: "custom", headerIcon: CheckCircle2 } },
    size: 120,
    cell: ({ row }) => (
      <Badge tone={row.original.isActive ? "success" : "warning"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => "",
    meta: { label: "Actions" },
    enableSorting: false,
    enableHiding: false,
    size: 120,
    cell: ({ row }) => {
      const t = row.original;
      const editorType = t.editorType || t.type || "visual_designer";
      return (
        <div className="flex items-center justify-end gap-1.5 size-full">
          <Button
            size="icon"
            variant="ghost"
            title="Edit"
            onClick={() => onEdit(t.id, editorType)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Edit className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Clone"
            onClick={() => onClone(t.id, t.name)}
            className="h-8 w-8 text-muted-foreground hover:text-info"
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Delete"
            onClick={() => onDelete(t.id, t.name)}
            className="h-8 w-8 text-muted-foreground hover:text-danger"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      );
    },
  },
];

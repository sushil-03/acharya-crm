import { useState } from "react";
import {
  useGetLeadLists,
  type LeadListMembership,
} from "@/components/lists/hook/query/use-get-lead-lists";
import { AddToListDialog } from "@/components/lists/add-to-list-dialog";
import { ListIconBadge } from "@/components/lists/list-icon";
import { ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadListsCellProps {
  leadId: string;
  leadName?: string;
  listItems?: {
    addedAt: string;
    list: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
    };
  }[];
}

export function LeadListsCell({ leadId, leadName, listItems }: LeadListsCellProps) {
  const [open, setOpen] = useState(false);

  const displayItems = listItems?.map((item) => ({
    id: item.list.id,
    list: item.list,
  }));

  return (
    <div className="flex items-center gap-1 flex-wrap group min-w-0">
      {displayItems?.map((m: any) => (
        <span
          key={m.id}
          className="inline-flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded-md shrink-0"
        >
          <ListIconBadge name={m.list.icon} color={m.list.color} size="xs" />
          <span className="truncate max-w-[80px] font-medium">{m.list.name}</span>
        </span>
      ))}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "size-5 rounded flex items-center justify-center hover:bg-muted shrink-0 transition-opacity",
          displayItems?.length
            ? "opacity-0 group-hover:opacity-100"
            : "opacity-50 hover:opacity-100",
        )}
      >
        <ListPlus className="size-3.5 text-muted-foreground" />
      </button>
      {open && (
        <AddToListDialog
        open={open}
        onOpenChange={setOpen}
        leadId={leadId}
        leadName={leadName}
        listItems={listItems}
      />
      )}
    </div>
  );
}

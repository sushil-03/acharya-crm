import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui-kit";

export type KanbanItem = {
  id: string;
  student: string;
  program: string;
  campus: string;
  status: string;
  progress: number;
  fee: number;
  submitted: string;
};

interface KanbanBoardProps {
  initialItems: KanbanItem[];
  columns: string[];
  readOnly?: boolean;
}

export function KanbanBoard({ initialItems, columns, readOnly = false }: KanbanBoardProps) {
  const [items, setItems] = useState<KanbanItem[]>(initialItems);

  // Sync items when initialItems change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const draggedItem = items.find((i) => i.id === draggableId);
    if (!draggedItem) return;

    // Filter out the dragged item
    const newItems = items.filter((i) => i.id !== draggableId);

    // Create the updated item
    const updatedItem = { ...draggedItem, status: destination.droppableId };

    // Keep items in original order, but insert updatedItem at the correct index for the target column
    const columnItems = newItems.filter((i) => i.status === destination.droppableId);
    const otherItems = newItems.filter((i) => i.status !== destination.droppableId);

    columnItems.splice(destination.index, 0, updatedItem);

    // Reconstruct the array ensuring the dragged item ends up at the correct index relative to its column
    setItems([...otherItems, ...columnItems]);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {columns.map((col) => {
          const colItems = items.filter((a) => a.status === col);
          return (
            <div key={col} className="bg-muted/40 rounded-xl p-2.5 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider">{col}</div>
                <Badge
                  tone={col === "Approved" ? "success" : col === "Rejected" ? "danger" : "muted"}
                >
                  {colItems.length}
                </Badge>
              </div>
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-lg space-y-2 transition-colors min-h-[100px] ${
                      snapshot.isDraggingOver ? "bg-muted/50" : ""
                    }`}
                  >
                    {colItems.map((a, index) => (
                      <Draggable
                        key={a.id}
                        draggableId={a.id}
                        index={index}
                        isDragDisabled={readOnly}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-card rounded-lg p-3 border border-border shadow-elev-1 ${
                              !readOnly
                                ? "hover:shadow-elev-2 cursor-grab active:cursor-grabbing"
                                : ""
                            } ${
                              snapshot.isDragging
                                ? "shadow-elev-3 ring-2 ring-primary/20 opacity-90 scale-105 z-50 relative"
                                : ""
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div className="text-[12.5px] font-semibold mt-0.5">{a.student}</div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {a.program}
                            </div>
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-brand"
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-muted-foreground">
                                {a.progress}%
                              </span>
                              <span className="text-[10px] font-semibold tabular-nums">
                                ₹{(a.fee / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

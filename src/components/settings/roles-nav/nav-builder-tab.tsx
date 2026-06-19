import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Users,
  LayoutGrid,
  GripVertical,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-kit";
import { Card } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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

import { useGetNavModules } from "./hooks/query/use-get-nav-modules";
import { useGetCrmRoles } from "./hooks/query/use-get-crm-roles";
import { useCreateNavModule } from "./hooks/mutation/use-create-nav-module";
import { useUpdateNavModule } from "./hooks/mutation/use-update-nav-module";
import { useDeleteNavModule } from "./hooks/mutation/use-delete-nav-module";
import { useCreateNavMenu } from "./hooks/mutation/use-create-nav-menu";
import { useUpdateNavMenu } from "./hooks/mutation/use-update-nav-menu";
import { useDeleteNavMenu } from "./hooks/mutation/use-delete-nav-menu";
import { useCreateNavSubmenu } from "./hooks/mutation/use-create-nav-submenu";
import { useUpdateNavSubmenu } from "./hooks/mutation/use-update-nav-submenu";
import { useDeleteNavSubmenu } from "./hooks/mutation/use-delete-nav-submenu";
import { useSetSubmenuRoles } from "./hooks/mutation/use-set-submenu-roles";

import { ModuleFormModal, type ModuleFormValues } from "./module-form-modal";
import { MenuFormModal, type MenuFormValues } from "./menu-form-modal";
import { SubmenuFormModal, type SubmenuFormValues } from "./submenu-form-modal";
import { AssignRolesModal } from "./assign-roles-modal";

import type { NavModuleFull, NavMenuFull, NavSubMenuWithRoles } from "@/types/nav";

type DeleteTarget =
  | { type: "module"; item: NavModuleFull }
  | { type: "menu"; item: NavMenuFull }
  | { type: "submenu"; item: NavSubMenuWithRoles };

// ─── Sortable submenu row ────────────────────────────────────────────────────
function SortableSubmenu({
  sub,
  onEdit,
  onDelete,
  onAssign,
}: {
  sub: NavSubMenuWithRoles;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sub.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  console.log("Sub", sub);
  const assignedRoles = (sub.roleAssignments ?? []).map((ra) => ra.role.roleName);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 px-10 py-2 hover:bg-muted/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none transition-opacity"
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon
            icon={sub.icon || "lucide:list"}
            className="size-3.5 text-muted-foreground shrink-0"
          />
          <span className="text-[12px] font-medium">{sub.name}</span>
          <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {sub.path}
          </code>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {assignedRoles.length === 0 ? (
            <span className="text-[10px] text-muted-foreground italic">No roles assigned</span>
          ) : (
            assignedRoles.slice(0, 4).map((rn) => (
              <Badge key={rn} tone="primary" className="text-[10px] py-0 font-mono">
                {rn}
              </Badge>
            ))
          )}
          {assignedRoles.length > 4 && (
            <span className="text-[10px] text-muted-foreground">
              +{assignedRoles.length - 4} more
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="xs"
          variant="outline"
          className="h-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          size="xs"
          variant="outline"
          className="h-6 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <Trash2 className="size-3" />
        </Button>
        <Button size="xs" variant="outline" className="h-6 text-[11px]" onClick={onAssign}>
          <Users className="size-3" /> Roles
        </Button>
      </div>
    </div>
  );
}

// ─── Sortable menu row ───────────────────────────────────────────────────────
function SortableMenu({
  menu,
  isExpanded,
  onToggle,
  onAddSubmenu,
  onEdit,
  onDelete,
  onEditSubmenu,
  onDeleteSubmenu,
  onAssignSubmenu,
  onSubmenuDragEnd,
}: {
  menu: NavMenuFull;
  isExpanded: boolean;
  onToggle: () => void;
  onAddSubmenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditSubmenu: (sub: NavSubMenuWithRoles) => void;
  onDeleteSubmenu: (sub: NavSubMenuWithRoles) => void;
  onAssignSubmenu: (sub: NavSubMenuWithRoles) => void;
  onSubmenuDragEnd: (menuId: number, event: DragEndEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  return (
    <div ref={setNodeRef} style={style}>
      {/* Menu row */}
      <div
        className="group flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none hover:bg-muted/20 transition-colors"
        onClick={onToggle}
      >
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3.5" />
        </button>
        <button
          className="text-muted-foreground shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon
            icon={menu.icon || "lucide:folder"}
            className="size-3.5 text-muted-foreground shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[13px] font-medium">{menu.name}</span>
            <p className="text-[11px] text-muted-foreground">
              {menu.subMenus.length} sub-menu{menu.subMenus.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            size="xs"
            variant="outline"
            className="h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdit}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            size="xs"
            variant="outline"
            className="h-6 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <Trash2 className="size-3" />
          </Button>
          <Button size="xs" variant="outline" className="h-6 text-[11px]" onClick={onAddSubmenu}>
            <Plus className="size-3" /> Sub-menu
          </Button>
        </div>
      </div>

      {/* Submenus */}
      {isExpanded && (
        <div className="bg-muted/10 border-t border-border/30">
          {menu.subMenus.length === 0 ? (
            <p className="text-xs text-muted-foreground px-16 py-2.5 italic">No sub-menus yet.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => onSubmenuDragEnd(menu.id, e)}
            >
              <SortableContext
                items={menu.subMenus.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {menu.subMenus.map((sub) => (
                  <SortableSubmenu
                    key={sub.id}
                    sub={sub}
                    onEdit={() => onEditSubmenu(sub)}
                    onDelete={() => onDeleteSubmenu(sub)}
                    onAssign={() => onAssignSubmenu(sub)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────────────
export function NavBuilderTab() {
  const { data: serverModules = [], isLoading, isFetching, refetch } = useGetNavModules();
  const { data: allRoles = [] } = useGetCrmRoles();

  // Local sorted state for optimistic DnD
  const [modules, setModules] = useState(serverModules);
  useEffect(() => {
    setModules(serverModules);
  }, [serverModules]);

  const { mutateAsync: createModule, isPending: isCreatingModule } = useCreateNavModule();
  const { mutateAsync: updateModule, isPending: isUpdatingModule } = useUpdateNavModule();
  const { mutateAsync: deleteModule, isPending: isDeletingModule } = useDeleteNavModule();
  const { mutateAsync: createMenu, isPending: isCreatingMenu } = useCreateNavMenu();
  const { mutateAsync: updateMenu, isPending: isUpdatingMenu } = useUpdateNavMenu();
  const { mutateAsync: deleteMenu, isPending: isDeletingMenu } = useDeleteNavMenu();
  const { mutateAsync: createSubmenu, isPending: isCreatingSubmenu } = useCreateNavSubmenu();
  const { mutateAsync: updateSubmenu, isPending: isUpdatingSubmenu } = useUpdateNavSubmenu();
  const { mutateAsync: deleteSubmenu, isPending: isDeletingSubmenu } = useDeleteNavSubmenu();
  const { mutateAsync: setSubmenuRoles, isPending: isSettingRoles } = useSetSubmenuRoles();

  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<NavModuleFull | null>(null);

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<NavMenuFull | null>(null);
  const [targetModuleForMenu, setTargetModuleForMenu] = useState<NavModuleFull | null>(null);

  const [submenuModalOpen, setSubmenuModalOpen] = useState(false);
  const [editingSubmenu, setEditingSubmenu] = useState<NavSubMenuWithRoles | null>(null);
  const [targetMenuForSubmenu, setTargetMenuForSubmenu] = useState<NavMenuFull | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningSubmenu, setAssigningSubmenu] = useState<NavSubMenuWithRoles | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const toggleModule = (id: number) =>
    setExpandedModules((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleMenu = (id: number) =>
    setExpandedMenus((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // ── Drag end handlers ──────────────────────────────────────────────────────

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = modules.findIndex((m) => m.id === active.id);
    const newIdx = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIdx, newIdx);
    setModules(reordered);

    await Promise.all(
      reordered
        .map((m, i) =>
          m.position !== i + 1 ? updateModule({ id: m.id, payload: { position: i + 1 } }) : null,
        )
        .filter(Boolean),
    );
  };

  const handleMenuDragEnd = async (moduleId: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const oldIdx = mod.menus.findIndex((m) => m.id === active.id);
        const newIdx = mod.menus.findIndex((m) => m.id === over.id);
        const reordered = arrayMove(mod.menus, oldIdx, newIdx);
        Promise.all(
          reordered
            .map((m, i) =>
              m.position !== i + 1 ? updateMenu({ id: m.id, payload: { position: i + 1 } }) : null,
            )
            .filter(Boolean),
        );
        return { ...mod, menus: reordered };
      }),
    );
  };

  const handleSubmenuDragEnd = async (menuId: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        menus: mod.menus.map((menu) => {
          if (menu.id !== menuId) return menu;
          const oldIdx = menu.subMenus.findIndex((s) => s.id === active.id);
          const newIdx = menu.subMenus.findIndex((s) => s.id === over.id);
          const reordered = arrayMove(menu.subMenus, oldIdx, newIdx);
          Promise.all(
            reordered
              .map((s, i) =>
                s.position !== i + 1
                  ? updateSubmenu({ id: s.id, payload: { position: i + 1 } })
                  : null,
              )
              .filter(Boolean),
          );
          return { ...menu, subMenus: reordered };
        }),
      })),
    );
  };

  // ── Submit handlers ────────────────────────────────────────────────────────

  const handleModuleSubmit = async (values: ModuleFormValues) => {
    if (editingModule) {
      await updateModule({ id: editingModule.id, payload: values });
      toast.success("Module updated");
    } else {
      await createModule(values);
      toast.success("Module created");
    }
  };

  const handleMenuSubmit = async (values: MenuFormValues) => {
    if (editingMenu) {
      await updateMenu({ id: editingMenu.id, payload: values });
      toast.success("Menu updated");
    } else if (targetModuleForMenu) {
      await createMenu({ moduleId: targetModuleForMenu.id, payload: values });
      toast.success("Menu created");
    }
  };

  const handleSubmenuSubmit = async (values: SubmenuFormValues) => {
    if (editingSubmenu) {
      await updateSubmenu({ id: editingSubmenu.id, payload: values });
      toast.success("Sub-menu updated");
    } else if (targetMenuForSubmenu) {
      await createSubmenu({ menuId: targetMenuForSubmenu.id, payload: values });
      toast.success("Sub-menu created");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "module") {
        await deleteModule(deleteTarget.item.id);
        toast.success("Module deleted");
      } else if (deleteTarget.type === "menu") {
        await deleteMenu(deleteTarget.item.id);
        toast.success("Menu deleted");
      } else {
        await deleteSubmenu(deleteTarget.item.id);
        toast.success("Sub-menu deleted");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAssignRoles = async (roleIds: number[]) => {
    if (!assigningSubmenu) return;
    await setSubmenuRoles({ submenuId: assigningSubmenu.id, roleIds });
    toast.success("Role assignments saved");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between shrink-0">
        <p className="text-[13px] text-muted-foreground">
          Drag rows to reorder. Modules → Menus → Sub-menus.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingModule(null);
              setModuleModalOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            Add Module
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Loading navigation tree...
          </div>
        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
            <LayoutGrid className="size-10 opacity-30" />
            <p className="text-sm">No modules yet. Add your first module to get started.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleModuleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {modules.map((mod) => {
                const isModExpanded = expandedModules.has(mod.id);
                return (
                  <SortableModule
                    key={mod.id}
                    mod={mod}
                    isExpanded={isModExpanded}
                    onToggle={() => toggleModule(mod.id)}
                    onAddMenu={() => {
                      setTargetModuleForMenu(mod);
                      setEditingMenu(null);
                      setMenuModalOpen(true);
                    }}
                    onEdit={() => {
                      setEditingModule(mod);
                      setModuleModalOpen(true);
                    }}
                    onDelete={() => setDeleteTarget({ type: "module", item: mod })}
                    expandedMenus={expandedMenus}
                    onToggleMenu={toggleMenu}
                    onAddSubmenu={(menu) => {
                      setTargetMenuForSubmenu(menu);
                      setEditingSubmenu(null);
                      setSubmenuModalOpen(true);
                    }}
                    onEditMenu={(menu) => {
                      setEditingMenu(menu);
                      setMenuModalOpen(true);
                    }}
                    onDeleteMenu={(menu) => setDeleteTarget({ type: "menu", item: menu })}
                    onEditSubmenu={(sub) => {
                      setEditingSubmenu(sub);
                      setSubmenuModalOpen(true);
                    }}
                    onDeleteSubmenu={(sub) => setDeleteTarget({ type: "submenu", item: sub })}
                    onAssignSubmenu={(sub) => {
                      setAssigningSubmenu(sub);
                      setAssignModalOpen(true);
                    }}
                    onMenuDragEnd={handleMenuDragEnd}
                    onSubmenuDragEnd={handleSubmenuDragEnd}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <ModuleFormModal
        open={moduleModalOpen}
        onOpenChange={setModuleModalOpen}
        editingModule={editingModule}
        isPending={isCreatingModule || isUpdatingModule}
        nextPosition={modules.length + 1}
        onSubmit={handleModuleSubmit}
      />
      <MenuFormModal
        open={menuModalOpen}
        onOpenChange={setMenuModalOpen}
        editingMenu={editingMenu}
        isPending={isCreatingMenu || isUpdatingMenu}
        moduleName={targetModuleForMenu?.name}
        nextPosition={editingMenu ? undefined : (targetModuleForMenu?.menus.length ?? 0) + 1}
        onSubmit={handleMenuSubmit}
      />
      <SubmenuFormModal
        open={submenuModalOpen}
        onOpenChange={setSubmenuModalOpen}
        editingSubmenu={editingSubmenu}
        isPending={isCreatingSubmenu || isUpdatingSubmenu}
        menuName={targetMenuForSubmenu?.name}
        nextPosition={editingSubmenu ? undefined : (targetMenuForSubmenu?.subMenus.length ?? 0) + 1}
        onSubmit={handleSubmenuSubmit}
      />
      <AssignRolesModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        submenu={assigningSubmenu}
        allRoles={allRoles}
        onSubmit={handleAssignRoles}
        isPending={isSettingRoles}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type} "{deleteTarget?.item.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "module"
                ? "This will cascade-delete all menus and sub-menus inside."
                : deleteTarget?.type === "menu"
                  ? "This will cascade-delete all sub-menus inside."
                  : "The sub-menu and its role assignments will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingModule || isDeletingMenu || isDeletingSubmenu}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Sortable module card ─────────────────────────────────────────────────────
function SortableModule({
  mod,
  isExpanded,
  onToggle,
  onAddMenu,
  onEdit,
  onDelete,
  expandedMenus,
  onToggleMenu,
  onAddSubmenu,
  onEditMenu,
  onDeleteMenu,
  onEditSubmenu,
  onDeleteSubmenu,
  onAssignSubmenu,
  onMenuDragEnd,
  onSubmenuDragEnd,
}: {
  mod: NavModuleFull;
  isExpanded: boolean;
  onToggle: () => void;
  onAddMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  expandedMenus: Set<number>;
  onToggleMenu: (id: number) => void;
  onAddSubmenu: (menu: NavMenuFull) => void;
  onEditMenu: (menu: NavMenuFull) => void;
  onDeleteMenu: (menu: NavMenuFull) => void;
  onEditSubmenu: (sub: NavSubMenuWithRoles) => void;
  onDeleteSubmenu: (sub: NavSubMenuWithRoles) => void;
  onAssignSubmenu: (sub: NavSubMenuWithRoles) => void;
  onMenuDragEnd: (moduleId: number, event: DragEndEvent) => void;
  onSubmenuDragEnd: (menuId: number, event: DragEndEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden">
        {/* Module header */}
        <div
          className="group flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-muted/30 transition-colors border-b border-border/50"
          onClick={onToggle}
        >
          <button
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4" />
          </button>
          <button
            className="text-muted-foreground shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Icon
              icon={mod.icon || "lucide:layout-grid"}
              className="size-4.5 text-primary shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px]">{mod.name}</span>
                <Badge tone="muted" className="text-[10px] font-mono">
                  {mod.shortName}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {mod.menus.length} menu{mod.menus.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="xs"
              variant="outline"
              className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onEdit}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              size="xs"
              variant="outline"
              className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDelete}
            >
              <Trash2 className="size-3" />
            </Button>
            <Button size="xs" variant="outline" className="h-7" onClick={onAddMenu}>
              <Plus className="size-3" /> Menu
            </Button>
          </div>
        </div>

        {/* Menus */}
        {isExpanded && (
          <div className="divide-y divide-border/50">
            {mod.menus.length === 0 ? (
              <p className="text-xs text-muted-foreground px-12 py-3 italic">No menus yet.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => onMenuDragEnd(mod.id, e)}
              >
                <SortableContext
                  items={mod.menus.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {mod.menus.map((menu) => (
                    <SortableMenu
                      key={menu.id}
                      menu={menu}
                      isExpanded={expandedMenus.has(menu.id)}
                      onToggle={() => onToggleMenu(menu.id)}
                      onAddSubmenu={() => onAddSubmenu(menu)}
                      onEdit={() => onEditMenu(menu)}
                      onDelete={() => onDeleteMenu(menu)}
                      onEditSubmenu={onEditSubmenu}
                      onDeleteSubmenu={onDeleteSubmenu}
                      onAssignSubmenu={onAssignSubmenu}
                      onSubmenuDragEnd={onSubmenuDragEnd}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

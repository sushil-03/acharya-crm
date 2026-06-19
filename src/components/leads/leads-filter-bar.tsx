"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  X,
  ChevronRight,
  CalendarIcon,
  CircleDot,
  Link2,
  Signal,
  BookOpen,
  MapPin,
  User,
  Mail,
  Phone,
  Tag,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { LEAD_STATUS, LEAD_SOURCES, PROGRAMS } from "@/lib/constant";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterFieldType = "text" | "select" | "number" | "date";

export interface FilterFieldDef {
  id: string;
  label: string;
  type: FilterFieldType;
  icon: React.ComponentType<{ className?: string }>;
  options?: { value: string; label: string }[];
}

export interface FilterCondition {
  id: string;
  fieldId: string; // "__advanced__" for the advanced filter block
  operator: string;
  value: string | number | undefined;
  endValue?: string | number;
  subConditions?: FilterCondition[]; // only used when fieldId === "__advanced__"
}

export const ADVANCED_FILTER_ID = "__advanced__";

// ─── Field definitions ────────────────────────────────────────────────────────

export const LEADS_FILTER_FIELDS: FilterFieldDef[] = [
  { id: "status", label: "Status", type: "select", icon: CircleDot, options: LEAD_STATUS },
  { id: "sourceChannel", label: "Source", type: "select", icon: Link2, options: LEAD_SOURCES },
  { id: "program", label: "Program", type: "select", icon: BookOpen, options: PROGRAMS },
  { id: "score", label: "Score", type: "number", icon: Signal },
  { id: "createdAt", label: "Created Date", type: "date", icon: CalendarIcon },
  { id: "city", label: "City", type: "text", icon: MapPin },
  { id: "state", label: "State", type: "text", icon: MapPin },
  { id: "name", label: "Name", type: "text", icon: User },
  { id: "email", label: "Email", type: "text", icon: Mail },
  { id: "mobile", label: "Mobile", type: "text", icon: Phone },
  { id: "utmSource", label: "UTM Source", type: "text", icon: Tag },
  { id: "utmMedium", label: "UTM Medium", type: "text", icon: Tag },
  { id: "utmCampaign", label: "UTM Campaign", type: "text", icon: Tag },
];

// ─── Operators ────────────────────────────────────────────────────────────────

const TEXT_OPERATORS = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
];

const SELECT_OPERATORS = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
];

const NUMBER_OPERATORS = [
  { value: "eq", label: "=" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "between", label: "between" },
];

const DATE_OPERATORS = [
  { value: "on", label: "is" },
  { value: "before", label: "before" },
  { value: "after", label: "after" },
  { value: "between", label: "is between" },
];

function getDefaultOperator(type: FilterFieldType): string {
  if (type === "number") return "eq";
  if (type === "date") return "on";
  return "is";
}

function getOperators(type: FilterFieldType) {
  switch (type) {
    case "text":
      return TEXT_OPERATORS;
    case "select":
      return SELECT_OPERATORS;
    case "number":
      return NUMBER_OPERATORS;
    case "date":
      return DATE_OPERATORS;
  }
}

// ─── ID generator ─────────────────────────────────────────────────────────────

let _counter = 0;
function genId() {
  return `fc-${++_counter}-${Date.now()}`;
}

// ─── LeadsFilterBar ───────────────────────────────────────────────────────────

interface LeadsFilterBarProps {
  filters: FilterCondition[];
  onChange: (filters: FilterCondition[]) => void;
  className?: string;
}

export function LeadsFilterBar({ filters, onChange, className }: LeadsFilterBarProps) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"field" | "value">("field");
  const [activeField, setActiveField] = useState<FilterFieldDef | null>(null);

  const addFilter = useCallback(
    (condition: Omit<FilterCondition, "id">) => {
      onChange([...filters, { ...condition, id: genId() }]);
    },
    [filters, onChange],
  );

  const removeFilter = useCallback(
    (id: string) => onChange(filters.filter((f) => f.id !== id)),
    [filters, onChange],
  );

  const updateFilter = useCallback(
    (id: string, updates: Partial<FilterCondition>) =>
      onChange(filters.map((f) => (f.id === id ? { ...f, ...updates } : f))),
    [filters, onChange],
  );

  const closePopover = () => {
    setOpen(false);
    setStage("field");
    setActiveField(null);
  };

  const hasAdvancedFilter = filters.some((f) => f.fieldId === ADVANCED_FILTER_ID);

  const handleFieldSelect = (field: FilterFieldDef) => {
    if (field.id === ADVANCED_FILTER_ID) {
      addFilter({ fieldId: ADVANCED_FILTER_ID, operator: "advanced", value: undefined, subConditions: [] });
      closePopover();
      return;
    }
    if (field.type === "select" && field.options) {
      setActiveField(field);
      setStage("value");
    } else {
      addFilter({ fieldId: field.id, operator: getDefaultOperator(field.type), value: undefined });
      closePopover();
    }
  };

  const handleValueSelect = (field: FilterFieldDef, optionValue: string) => {
    addFilter({ fieldId: field.id, operator: "is", value: optionValue });
    closePopover();
  };

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {filters.map((filter) => {
        if (filter.fieldId === ADVANCED_FILTER_ID) {
          return (
            <AdvancedFilterChip
              key={filter.id}
              filter={filter}
              onUpdate={(updates) => updateFilter(filter.id, updates)}
              onRemove={() => removeFilter(filter.id)}
            />
          );
        }
        const fieldDef = LEADS_FILTER_FIELDS.find((f) => f.id === filter.fieldId);
        if (!fieldDef) return null;
        return (
          <FilterChip
            key={filter.id}
            filter={filter}
            fieldDef={fieldDef}
            onUpdate={(updates) => updateFilter(filter.id, updates)}
            onRemove={() => removeFilter(filter.id)}
          />
        );
      })}

      {/* Add filter button */}
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setStage("field");
            setActiveField(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 rounded-md gap-1 text-xs border-dashed text-muted-foreground hover:text-foreground",
              filters.length === 0 ? "px-2.5" : "w-7 p-0 justify-center",
            )}
          >
            <Plus className="size-3 shrink-0" />
            {filters.length === 0 && <span>Add filter</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-60 p-0" align="start" side="bottom">
          {stage === "field" ? (
            <FieldPicker
              fields={LEADS_FILTER_FIELDS}
              onSelect={handleFieldSelect}
              showAdvanced={!hasAdvancedFilter}
            />
          ) : activeField ? (
            <ValuePicker
              field={activeField}
              onSelect={(val) => handleValueSelect(activeField, val)}
              onBack={() => setStage("field")}
            />
          ) : null}
        </PopoverContent>
      </Popover>

      {/* Clear / Save */}
      {filters.length > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
            onClick={() => onChange([])}
          >
            Clear
          </button>
          <button className="text-xs font-medium text-foreground hover:text-primary transition-colors px-1">
            Save
          </button>
        </>
      )}
    </div>
  );
}

// ─── FieldPicker ──────────────────────────────────────────────────────────────

const ADVANCED_FILTER_FIELD_DEF: FilterFieldDef = {
  id: ADVANCED_FILTER_ID,
  label: "Advanced filter",
  type: "text",
  icon: SlidersHorizontal,
};

function FieldPicker({
  fields,
  onSelect,
  showAdvanced = true,
}: {
  fields: FilterFieldDef[];
  onSelect: (field: FilterFieldDef) => void;
  showAdvanced?: boolean;
}) {
  return (
    <Command>
      <CommandInput placeholder="Add filter..." className="h-8 text-xs" />
      <CommandList>
        <CommandEmpty className="text-xs py-3 text-center">No fields found.</CommandEmpty>
        {showAdvanced && (
          <CommandGroup>
            <CommandItem
              value={ADVANCED_FILTER_FIELD_DEF.label}
              onSelect={() => onSelect(ADVANCED_FILTER_FIELD_DEF)}
              className="text-xs gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1">Advanced filter</span>
            </CommandItem>
          </CommandGroup>
        )}
        <CommandGroup>
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <CommandItem
                key={field.id}
                value={field.label}
                onSelect={() => onSelect(field)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Icon className="size-3.5 text-muted-foreground shrink-0" />
                <span className="flex-1">{field.label}</span>
                {field.type === "select" && (
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

// ─── ValuePicker (for select fields in the "+" flow) ─────────────────────────

function ValuePicker({
  field,
  onSelect,
  onBack,
}: {
  field: FilterFieldDef;
  onSelect: (value: string) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-2 py-1.5 border-b">
        <button
          onClick={onBack}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
        >
          <ChevronRight className="size-3 rotate-180" />
          Back
        </button>
        <span className="text-xs font-medium text-foreground">{field.label}</span>
      </div>
      <Command>
        <CommandInput placeholder="Search..." className="h-8 text-xs" />
        <CommandList>
          <CommandEmpty className="text-xs py-3 text-center">No options found.</CommandEmpty>
          <CommandGroup>
            {field.options?.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => onSelect(opt.value)}
                className="text-xs cursor-pointer"
              >
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

// ─── AdvancedFilterChip ───────────────────────────────────────────────────────

interface AdvancedFilterChipProps {
  filter: FilterCondition;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}

function getSubConditionSummary(sub: FilterCondition): string {
  const field = LEADS_FILTER_FIELDS.find((f) => f.id === sub.fieldId);
  if (!field) return sub.fieldId;
  const opLabel =
    getOperators(field.type).find((op) => op.value === sub.operator)?.label ?? sub.operator;
  const valueLabel = (() => {
    if (sub.value === undefined || sub.value === "") return "—";
    if (field.type === "select" && field.options) {
      return field.options.find((o) => o.value === sub.value)?.label ?? String(sub.value);
    }
    if (field.type === "date" && typeof sub.value === "string") {
      try {
        const d = new Date(sub.value);
        if (!isNaN(d.getTime())) return formatDate(d, { month: "short" });
      } catch {
        // fallthrough
      }
    }
    return String(sub.value);
  })();
  return `${field.label} ${opLabel} ${valueLabel}`;
}

function AdvancedFilterChip({ filter, onUpdate, onRemove }: AdvancedFilterChipProps) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addStage, setAddStage] = useState<"field" | "value">("field");
  const [addField, setAddField] = useState<FilterFieldDef | null>(null);

  const subs = filter.subConditions ?? [];

  const summaryText =
    subs.length === 0
      ? "Advanced filter"
      : subs.map(getSubConditionSummary).join(" or ");

  const addSub = (condition: Omit<FilterCondition, "id">) => {
    onUpdate({ subConditions: [...subs, { ...condition, id: genId() }] });
  };

  const removeSub = (id: string) => {
    onUpdate({ subConditions: subs.filter((c) => c.id !== id) });
  };

  const updateSub = (id: string, updates: Partial<FilterCondition>) => {
    onUpdate({ subConditions: subs.map((c) => (c.id === id ? { ...c, ...updates } : c)) });
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddStage("field");
    setAddField(null);
  };

  const handleAddFieldSelect = (field: FilterFieldDef) => {
    if (field.type === "select" && field.options) {
      setAddField(field);
      setAddStage("value");
    } else {
      addSub({ fieldId: field.id, operator: getDefaultOperator(field.type), value: undefined });
      closeAdd();
    }
  };

  const handleAddValueSelect = (field: FilterFieldDef, value: string) => {
    addSub({ fieldId: field.id, operator: "is", value });
    closeAdd();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="inline-flex items-center h-7 rounded-md border border-border bg-background text-xs overflow-hidden shadow-sm cursor-pointer select-none"
        >
          <span className="px-2.5 font-medium text-foreground max-w-[320px] truncate">
            {summaryText}
          </span>
          <button
            className="border-l border-border px-1.5 h-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove advanced filter"
          >
            <X className="size-3" />
          </button>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-3 flex flex-col gap-2 w-fit min-w-[260px]"
        align="start"
      >
        {/* Existing sub-conditions */}
        {subs.map((sub, idx) => {
          const fieldDef = LEADS_FILTER_FIELDS.find((f) => f.id === sub.fieldId);
          if (!fieldDef) return null;
          return (
            <div key={sub.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[11px] text-muted-foreground w-6 text-right shrink-0",
                  idx === 0 && "invisible",
                )}
              >
                or
              </span>
              <FilterChip
                filter={sub}
                fieldDef={fieldDef}
                onUpdate={(updates) => updateSub(sub.id, updates)}
                onRemove={() => removeSub(sub.id)}
              />
            </div>
          );
        })}

        {/* Add sub-filter row */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px] text-muted-foreground w-6 text-right shrink-0",
              subs.length === 0 && "invisible",
            )}
          >
            or
          </span>
          <Popover
            open={addOpen}
            onOpenChange={(v) => {
              setAddOpen(v);
              if (!v) {
                setAddStage("field");
                setAddField(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-md px-3 text-xs gap-1.5"
              >
                <Plus className="size-3" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start">
              {addStage === "field" ? (
                <FieldPicker
                  fields={LEADS_FILTER_FIELDS}
                  onSelect={handleAddFieldSelect}
                  showAdvanced={false}
                />
              ) : addField ? (
                <ValuePicker
                  field={addField}
                  onSelect={(val) => handleAddValueSelect(addField, val)}
                  onBack={() => {
                    setAddStage("field");
                    setAddField(null);
                  }}
                />
              ) : null}
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

interface FilterChipProps {
  filter: FilterCondition;
  fieldDef: FilterFieldDef;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}

function FilterChip({ filter, fieldDef, onUpdate, onRemove }: FilterChipProps) {
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);

  const operators = getOperators(fieldDef.type);
  const currentOp = operators.find((op) => op.value === filter.operator) ?? operators[0];
  const Icon = fieldDef.icon;

  const toggleSimpleOperator = () => {
    const ops = operators.slice(0, 2); // "is" / "is not"
    const idx = ops.findIndex((op) => op.value === filter.operator);
    const next = ops[(idx + 1) % 2];
    onUpdate({ operator: next.value });
  };

  const getValueLabel = () => {
    if (filter.value === undefined || filter.value === "") return "—";
    if (fieldDef.type === "select" && fieldDef.options) {
      return fieldDef.options.find((o) => o.value === filter.value)?.label ?? String(filter.value);
    }
    if (fieldDef.type === "date" && typeof filter.value === "string") {
      try {
        const d = new Date(filter.value);
        if (!isNaN(d.getTime())) {
          const label = formatDate(d, { month: "short" });
          if (filter.operator === "between" && filter.endValue && typeof filter.endValue === "string") {
            const end = new Date(filter.endValue);
            return `${label} — ${formatDate(end, { month: "short" })}`;
          }
          return label;
        }
      } catch {
        // fallthrough
      }
    }
    if (fieldDef.type === "number" && filter.operator === "between" && filter.endValue !== undefined) {
      return `${filter.value} — ${filter.endValue}`;
    }
    return String(filter.value);
  };

  const hasValue = filter.value !== undefined && filter.value !== "";
  const needsNumberOrDateOperator = fieldDef.type === "number" || fieldDef.type === "date";

  const segBorder = "border-l border-border";
  const segBase = "h-full transition-colors whitespace-nowrap";
  const segInteractive = "hover:bg-muted/60 text-muted-foreground hover:text-foreground";

  return (
    <div className="inline-flex items-center h-7 rounded-md border border-border bg-background text-xs overflow-hidden shadow-sm">
      {/* Field icon + label */}
      <div className="flex items-center gap-1.5 px-2.5 text-foreground">
        <Icon className="size-3 text-muted-foreground shrink-0" />
        <span className="font-medium whitespace-nowrap">{fieldDef.label}</span>
      </div>

      {/* Operator */}
      {needsNumberOrDateOperator ? (
        <Popover open={operatorOpen} onOpenChange={setOperatorOpen}>
          <PopoverTrigger asChild>
            <button className={cn(segBorder, segBase, segInteractive, "px-2")}>
              {currentOp.label}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="start">
            {operators.map((op) => (
              <button
                key={op.value}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-sm text-xs hover:bg-muted transition-colors flex items-center justify-between",
                  filter.operator === op.value && "bg-muted font-medium",
                )}
                onClick={() => {
                  onUpdate({ operator: op.value });
                  setOperatorOpen(false);
                }}
              >
                {op.label}
                {filter.operator === op.value && <Check className="size-3" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      ) : (
        <button
          className={cn(segBorder, segBase, segInteractive, "px-2")}
          onClick={toggleSimpleOperator}
          title="Click to toggle operator"
        >
          {currentOp.label}
        </button>
      )}

      {/* Value */}
      <Popover open={valueOpen} onOpenChange={setValueOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              segBorder, segBase, segInteractive,
              "px-2.5 max-w-[140px] truncate",
              !hasValue && "italic",
            )}
          >
            {getValueLabel()}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <FilterValueEditor
            filter={filter}
            fieldDef={fieldDef}
            onUpdate={(updates) => {
              onUpdate(updates);
              const keepOpen =
                filter.operator === "between" &&
                (fieldDef.type === "date" || fieldDef.type === "number");
              if (!keepOpen) {
                setValueOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Remove */}
      <button
        className={cn(segBorder, segBase, segInteractive, "px-1.5")}
        onClick={onRemove}
        aria-label="Remove filter"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

// ─── FilterValueEditor ────────────────────────────────────────────────────────

interface FilterValueEditorProps {
  filter: FilterCondition;
  fieldDef: FilterFieldDef;
  onUpdate: (updates: Partial<FilterCondition>) => void;
}

function FilterValueEditor({ filter, fieldDef, onUpdate }: FilterValueEditorProps) {
  const [localValue, setLocalValue] = useState<string>(
    filter.value !== undefined ? String(filter.value) : "",
  );
  const [localEnd, setLocalEnd] = useState<string>(
    filter.endValue !== undefined ? String(filter.endValue) : "",
  );

  if (fieldDef.type === "select" && fieldDef.options) {
    return (
      <Command className="w-48">
        <CommandInput placeholder="Search..." className="h-8 text-xs" />
        <CommandList>
          <CommandEmpty className="text-xs py-3 text-center">No options.</CommandEmpty>
          <CommandGroup>
            {fieldDef.options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => onUpdate({ value: opt.value })}
                className="text-xs cursor-pointer"
              >
                <span className="flex-1">{opt.label}</span>
                {filter.value === opt.value && <Check className="size-3 ml-auto" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }

  if (fieldDef.type === "date") {
    const isBetween = filter.operator === "between";
    const startDate =
      filter.value && typeof filter.value === "string" ? new Date(filter.value) : undefined;
    const endDate =
      filter.endValue && typeof filter.endValue === "string"
        ? new Date(filter.endValue)
        : undefined;

    if (isBetween) {
      return (
        <Calendar
          autoFocus
          captionLayout="dropdown"
          mode="range"
          selected={
            startDate && endDate
              ? { from: startDate, to: endDate }
              : startDate
                ? { from: startDate, to: startDate }
                : undefined
          }
          onSelect={(range) => {
            onUpdate({
              value: range?.from ? range.from.toISOString() : undefined,
              endValue: range?.to ? range.to.toISOString() : undefined,
            });
          }}
        />
      );
    }

    return (
      <Calendar
        autoFocus
        captionLayout="dropdown"
        mode="single"
        selected={startDate}
        onSelect={(date) => {
          onUpdate({ value: date ? date.toISOString() : undefined });
        }}
      />
    );
  }

  if (fieldDef.type === "number") {
    const isBetween = filter.operator === "between";

    if (isBetween) {
      return (
        <div className="flex items-center gap-2 p-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-7 w-20 text-xs"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() =>
              onUpdate({ value: localValue === "" ? undefined : Number(localValue) })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                onUpdate({ value: localValue === "" ? undefined : Number(localValue) });
            }}
            autoFocus
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-7 w-20 text-xs"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            onBlur={() =>
              onUpdate({ endValue: localEnd === "" ? undefined : Number(localEnd) })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                onUpdate({ endValue: localEnd === "" ? undefined : Number(localEnd) });
            }}
          />
        </div>
      );
    }

    return (
      <div className="p-2">
        <Input
          type="number"
          placeholder="Value"
          className="h-7 w-32 text-xs"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() =>
            onUpdate({ value: localValue === "" ? undefined : Number(localValue) })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate({ value: localValue === "" ? undefined : Number(localValue) });
            }
          }}
          autoFocus
        />
      </div>
    );
  }

  // Text
  return (
    <div className="p-2">
      <Input
        type="text"
        placeholder="Value..."
        className="h-7 w-52 text-xs"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() =>
          onUpdate({ value: localValue === "" ? undefined : localValue })
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onUpdate({ value: localValue === "" ? undefined : localValue });
          }
        }}
        autoFocus
      />
    </div>
  );
}

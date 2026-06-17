import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-fields/input-field";
import { SelectField } from "@/components/ui/form-fields/select-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import type { Coupon } from "../hook/query/use-get-coupons";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { MultiSelectTagsField } from "@/components/ui/form-fields/multi-select-tags-field";
import { useGetUsersPaginated } from "@/components/settings/hook/query/use-get-users-paginated";

const couponSchema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.coerce.number().min(0, "Must be ≥ 0"),
  maxDiscountAmt: z.coerce.number().optional().nullable(),
  validFrom: z.date().optional().nullable(),
  validUntil: z.date().optional().nullable(),
  maxUses: z.coerce.number().optional().nullable(),
  isActive: z.boolean(),
  studentIds: z.array(z.string()).optional(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage (%)", value: "PERCENTAGE" },
  { label: "Flat (₹)", value: "FLAT" },
];

interface CouponFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CouponFormValues) => Promise<void>;
  editingCoupon: Coupon | null;
  isPending: boolean;
}

export function CouponFormModal({
  open,
  onOpenChange,
  onSubmit,
  editingCoupon,
  isPending,
}: CouponFormModalProps) {
  const isEditing = !!editingCoupon;

  const { data: usersData, isLoading: isLoadingStudents } = useGetUsersPaginated({
    role: "student",
    page: 1,
    pageSize: 100,
  });
  console.log("user", usersData?.data);
  const studentOptions = useMemo(() => {
    const list = (usersData?.data ?? []).map((user) => {
      const phoneNumber = user.mobile || user.phone || "";

      let label = user.email;
      let selectedLabel = user.username || user.email;

      if (user.username) {
        label = `${user.username} (${user.email})`;
        selectedLabel = user.username;
      } else if (phoneNumber) {
        label = `${phoneNumber} (${user.email})`;
        selectedLabel = phoneNumber;
      }

      const searchKeys = [user.username ?? "", user.email, phoneNumber].filter(Boolean);

      return {
        value: user.id,
        label,
        selectedLabel,
        searchKeys,
      };
    });

    if (
      editingCoupon?.assignedToStudentId &&
      !list.some((opt) => opt.value === editingCoupon.assignedToStudentId)
    ) {
      list.push({
        value: editingCoupon.assignedToStudentId,
        label: editingCoupon.assignedToStudentId,
        selectedLabel: editingCoupon.assignedToStudentId,
        searchKeys: [editingCoupon.assignedToStudentId],
      });
    }

    console.log("usersData:", usersData);
    console.log("studentOptions:", list);
    return list;
  }, [usersData, editingCoupon]);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxDiscountAmt: null,
      validFrom: null,
      validUntil: null,
      maxUses: null,
      isActive: true,
      studentIds: [],
    },
  });

  const discountType = form.watch("discountType");
  const isActive = form.watch("isActive");

  useEffect(() => {
    if (!open) return;
    if (editingCoupon) {
      form.reset({
        code: editingCoupon.code,
        description: editingCoupon.description ?? "",
        discountType: editingCoupon.discountType,
        discountValue: Number(editingCoupon.discountValue),
        maxDiscountAmt: editingCoupon.maxDiscountAmt ? Number(editingCoupon.maxDiscountAmt) : null,
        validFrom: editingCoupon.validFrom ? new Date(editingCoupon.validFrom) : null,
        validUntil: editingCoupon.validUntil ? new Date(editingCoupon.validUntil) : null,
        maxUses: editingCoupon.maxUses ?? null,
        isActive: editingCoupon.isActive,
        studentIds: editingCoupon.assignedToStudentId ? [editingCoupon.assignedToStudentId] : [],
      });
    } else {
      form.reset({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxDiscountAmt: null,
        validFrom: null,
        validUntil: null,
        maxUses: null,
        isActive: true,
        studentIds: [],
      });
    }
  }, [open, editingCoupon]);

  const handleSubmit = async (values: CouponFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update coupon details. The code cannot be changed after creation."
              : "Create a new discount coupon for application fees."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-1"
            onKeyDown={(e) => {
              if (e.key !== "Tab" && e.key !== "Escape") e.stopPropagation();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Row 1 — Code + Type */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                control={form.control}
                name="code"
                label="Code"
                placeholder="e.g. JULY25"
                readOnly={isEditing}
                className={isEditing ? "uppercase opacity-60" : "uppercase"}
              />
              <SelectField
                control={form.control}
                name="discountType"
                label="Type"
                options={DISCOUNT_TYPE_OPTIONS}
                disabled={isEditing}
              />
            </div>

            {/* Row 2 — Value + Max Cap */}
            <div className="grid grid-cols-2 gap-3">
              <InputField
                control={form.control}
                name="discountValue"
                label={discountType === "PERCENTAGE" ? "Discount %" : "Discount Amount (₹)"}
                type="number"
                placeholder="0"
              />
              {discountType === "PERCENTAGE" && (
                <InputField
                  control={form.control}
                  name="maxDiscountAmt"
                  label="Max Discount ₹ (optional)"
                  type="number"
                  placeholder="No cap"
                />
              )}
            </div>

            {/* Row 3 — Description */}
            <TextareaField
              control={form.control}
              name="description"
              label="Description (optional)"
              placeholder="Internal note"
              rows={2}
            />

            {/* Row 4 — Valid From + Until */}
            <div className="grid grid-cols-2 gap-3">
              <DatePickerWithYearField
                control={form.control}
                name="validFrom"
                label="Valid From (optional)"
                includeTime
              />
              <DatePickerWithYearField
                control={form.control}
                name="validUntil"
                label="Valid Until (optional)"
                includeTime
              />
            </div>

            {/* Row 5 — Max Uses */}
            <InputField
              control={form.control}
              name="maxUses"
              label="Max Uses (optional — leave blank for unlimited)"
              type="number"
              placeholder="Unlimited"
            />

            {/* Student selection field */}
            <MultiSelectTagsField
              control={form.control}
              name="studentIds"
              label="Assign to Student (optional)"
              placeholder={isLoadingStudents ? "Loading students..." : "Select student..."}
              isLoading={isLoadingStudents}
              options={studentOptions}
              maxSelect={1}
            />

            {/* Active toggle — edit only */}
            {isEditing && (
              <FormField
                control={form.control}
                name="isActive"
                render={() => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                    <div>
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Active Status
                      </FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Inactive coupons cannot be applied by students.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(v) => form.setValue("isActive", v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                {isEditing ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

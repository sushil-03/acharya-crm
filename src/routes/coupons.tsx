import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui-kit";
// import { CouponsTab } from "@/components/settings/coupons-tab";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useGetCoupons, type Coupon } from "@/components/settings/hook/query/use-get-coupons";
import { useCreateCoupon } from "@/components/settings/hook/mutation/use-create-coupon";
import { useUpdateCoupon } from "@/components/settings/hook/mutation/use-update-coupon";
import { CouponFormModal, CouponFormValues } from "@/components/settings/coupon/coupon-form-modal";
import { CouponsTab } from "@/components/settings/coupon/coupons-tab";
// import { CouponFormModal, type CouponFormValues } from "@/components/settings/coupon-form-modal";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export const Route = createFileRoute("/coupons")({
  beforeLoad: () => {
    const { decodedToken } = getAuthenticatedUser();
    const role = decodedToken?.role;
    if (role === "counsellor" || role === "councellor") {
      throw redirect({
        to: "/chat-settings",
      });
    }
  },
  component: CouponsPage,
  head: () => ({ meta: [{ title: "Coupons — Acharya One" }] }),
});

function CouponsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetCoupons({
    search: search || undefined,
    page,
    pageSize,
  });

  const { mutateAsync: createCoupon, isPending: isCreating } = useCreateCoupon();
  const { mutateAsync: updateCoupon, isPending: isUpdating } = useUpdateCoupon();

  const coupons = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const handleSubmit = async (values: CouponFormValues) => {
    const validFrom = values.validFrom ? new Date(values.validFrom).toISOString() : undefined;
    const validUntil = values.validUntil ? new Date(values.validUntil).toISOString() : undefined;
    const assignedToStudentId = values.studentIds && values.studentIds.length > 0 ? values.studentIds[0] : null;

    if (editingCoupon) {
      await updateCoupon({
        id: editingCoupon.id,
        payload: {
          description: values.description || undefined,
          discountValue: values.discountValue,
          maxDiscountAmt: values.maxDiscountAmt ?? null,
          validUntil: validUntil ?? null,
          maxUses: values.maxUses ?? null,
          isActive: values.isActive,
          assignedToStudentId,
        },
      });
    } else {
      await createCoupon({
        code: values.code.toUpperCase(),
        description: values.description || undefined,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountAmt: values.maxDiscountAmt ?? null,
        validFrom: validFrom ?? null,
        validUntil: validUntil ?? null,
        maxUses: values.maxUses ?? null,
        isActive: values.isActive,
        assignedToStudentId,
      });
    }
    refetch();
  };

  return (
    <AppShell noPadding className="h-screen overflow-hidden">
      <PageHeader
        title="Coupons"
        subtitle="Create and manage discount coupons for application fees."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="h-8"
              onClick={() => {
                setEditingCoupon(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="size-4" />
              Create Coupon
            </Button>
          </div>
        }
      />
      <div className="flex-1 min-h-0 p-0 overflow-hidden flex flex-col border-t">
        <CouponsTab
          coupons={coupons}
          isLoading={isLoading}
          total={total}
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onEditCoupon={(coupon) => {
            setEditingCoupon(coupon);
            setIsModalOpen(true);
          }}
          updateCoupon={updateCoupon}
          refetch={refetch}
        />
      </div>

      <CouponFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingCoupon={editingCoupon}
        isPending={isCreating || isUpdating}
        onSubmit={handleSubmit}
      />
    </AppShell>
  );
}

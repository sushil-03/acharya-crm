import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Card, StatCard, Badge } from "@/components/ui-kit";
import { Wallet, Receipt, AlertCircle, TrendingUp, Download, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { monthlyTrend } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useGetAllPayments } from "@/components/payment/hook/query/use-get-all-payments";
import { useDataGrid } from "@/hooks/use-data-grid";
import { DataGrid } from "@/components/data-grid/data-grid";
import { paymentColumns } from "@/components/payment/payment-column";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputSearch from "@/components/global/input-search";
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu";
import { DataGridRowHeightMenu } from "@/components/data-grid/data-grid-row-height-menu";

export const Route = createFileRoute("/finance")({
  component: FinancePage,
  head: () => ({ meta: [{ title: "Finance & Payments — Acharya One" }] }),
});

function FinancePage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useGetAllPayments();

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    let result = data;
    if (tab !== "all") {
      result = result.filter((p) => p.paymentStatus === tab);
    }
    if (q) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(lowerQ) ||
          p.student?.firstName.toLowerCase().includes(lowerQ) ||
          p.student?.lastName.toLowerCase().includes(lowerQ) ||
          p.student?.email.toLowerCase().includes(lowerQ),
      );
    }
    return result;
  }, [data, tab, q]);

  const stats = React.useMemo(() => {
    if (!data) return { booked: 0, collected: 0, outstanding: 0, avg: 0 };

    let booked = 0;
    let collected = 0;
    let outstanding = 0;

    data.forEach((p) => {
      const amount = Number(p.amount) || 0;
      booked += amount;
      if (p.paymentStatus === "completed") collected += amount;
      if (p.paymentStatus === "initiated") outstanding += amount;
    });

    const avg = data.length > 0 ? booked / data.length : 0;

    return { booked, collected, outstanding, avg };
  }, [data]);

  const formatCompact = (num: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);

  const dataGrid = useDataGrid({
    data: filteredData,
    columns: paymentColumns,
    readOnly: true,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <AppShell>
      <PageHeader
        // breadcrumb="Conversion"
        title="Finance & Payments"
        subtitle="Fee collections, installment plans, refunds and reconciliation."
      />

      <div className="flex flex-col h-full min-h-0 flex-1">
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
          <StatCard
            label="Revenue Booked"
            value={formatCompact(stats.booked)}
            icon={<Wallet className="size-4" />}
            accent="gold"
          />
          <StatCard
            label="Collected"
            value={formatCompact(stats.collected)}
            icon={<Receipt className="size-4" />}
            accent="success"
          />
          <StatCard
            label="Outstanding"
            value={formatCompact(stats.outstanding)}
            icon={<AlertCircle className="size-4" />}
            accent="warning"
          />
          <StatCard
            label="Avg Fee"
            value={formatCompact(stats.avg)}
            icon={<TrendingUp className="size-4" />}
            accent="primary"
          />
        </div> */}

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 shrink-0">
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-display font-semibold text-[15px] mb-1">Collection Trend</h3>
            <p className="text-xs text-muted-foreground mb-3">Booked vs collected revenue (₹ Lakh)</p>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart
                  data={monthlyTrend.map((m) => ({
                    ...m,
                    booked: m.enrolled * 320,
                    collected: m.enrolled * 240,
                  }))}
                >
                  <defs>
                    <linearGradient id="bookedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--success)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="m" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid oklch(0.92 0.01 255)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    dataKey="booked"
                    stroke="var(--gold)"
                    fill="url(#bookedGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="collected"
                    stroke="var(--success)"
                    fill="url(#collectedGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold text-[15px] mb-3">Payment Methods</h3>
            <div className="space-y-3">
              {[
                { l: "UPI", v: 48, c: "bg-primary" },
                { l: "Net Banking", v: 24, c: "bg-secondary" },
                { l: "Credit Card", v: 14, c: "bg-info" },
                { l: "Loan / EMI", v: 9, c: "bg-gold" },
                { l: "Wire Transfer", v: 5, c: "bg-success" },
              ].map((m) => (
                <div key={m.l}>
                  <div className="flex items-center justify-between mb-1 text-[12px]">
                    <span className="font-medium">{m.l}</span>
                    <span className="font-bold tabular-nums">{m.v}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${m.c}`} style={{ width: `${m.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div> */}

        <Card className="overflow-hidden flex flex-col flex-1">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold text-[15px]">Payments & Installments</h3>
            <div className="flex items-center gap-3">
              <InputSearch
                searchTerm={q}
                setSearchTerm={setQ}
                className="h-8"
                placeholder="Search payments..."
              />
              <Select value={tab} onValueChange={setTab}>
                <SelectTrigger size="sm" className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <DataGridViewMenu table={dataGrid.table} />
              <DataGridRowHeightMenu table={dataGrid.table} />
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
            <DataGrid
              {...dataGrid}
              stretchColumns
              showPagination
              totalElements={filteredData.length}
              className="h-full border-0 rounded-none"
            />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

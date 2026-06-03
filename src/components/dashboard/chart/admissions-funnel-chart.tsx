import { FunnelStage } from "@/components/dashboard/hook/query/use-get-funnel";

interface AdmissionsFunnelChartProps {
  data: FunnelStage[];
}

export function AdmissionsFunnelChart({ data }: AdmissionsFunnelChartProps) {
  const maxCount = data.length ? data[0].count : 1;

  return (
    <div className="space-y-3 pt-2 pb-1">
      {data.map((f, i) => {
        const pct = maxCount ? (f.count / maxCount) * 100 : 0;

        return (
          <div key={f.stage} className="relative group">
            <div className="flex justify-between items-end mb-1 px-0.5">
              <span className="text-[13px] font-medium text-foreground/90">{f.stage}</span>
              <span className="text-[13px] font-bold tabular-nums">
                {f.count.toLocaleString()}
                <span className="text-[11px] text-muted-foreground font-normal ml-1.5">
                  ({pct.toFixed(1)}%)
                </span>
              </span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-brand transition-all duration-700 ease-out relative"
                style={{
                  width: `${pct}%`,
                  opacity: Math.max(0.4, 1 - i * 0.12), // Cap opacity so bottom stages are still visible
                }}
              >
                {/* Subtle shimmer on hover */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

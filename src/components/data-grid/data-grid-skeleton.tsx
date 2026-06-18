import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CELL_FILL_WIDTHS = ["40%", "55%", "30%", "70%", "45%", "60%", "35%", "50%"];
const HEADER_FILL_WIDTHS = ["60%", "75%", "50%", "65%", "55%", "70%", "45%", "60%"];

interface DataGridSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  className?: string;
}

export function DataGridSkeleton({
  columnCount = 6,
  rowCount = 12,
  className,
}: DataGridSkeletonProps) {
  const cols = Array.from({ length: columnCount });

  return (
    <div className={cn("flex flex-col w-full overflow-hidden rounded-md border", className)}>
      {/* Shimmer header */}
      <div className="flex border-b bg-muted/30 shrink-0">
        {cols.map((_, i) => (
          <div key={i} className="flex-1 flex items-center px-3 h-9 border-e last:border-e-0">
            {i === 0 ? (
              <Skeleton className="size-3.5 rounded-sm" />
            ) : (
              <Skeleton className="h-3 rounded-sm" style={{ width: HEADER_FILL_WIDTHS[i % HEADER_FILL_WIDTHS.length] }} />
            )}
          </div>
        ))}
      </div>

      {/* Shimmer rows */}
      <div className="flex flex-col divide-y divide-border">
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex h-9">
            {cols.map((_, colIdx) => (
              <div key={colIdx} className="flex-1 flex items-center px-3 border-e last:border-e-0">
                {colIdx === 0 ? (
                  <Skeleton className="size-3.5 rounded-sm" />
                ) : (
                  <Skeleton
                    className="h-3 rounded-sm"
                    style={{ width: CELL_FILL_WIDTHS[(rowIdx * columnCount + colIdx) % CELL_FILL_WIDTHS.length] }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import { notifications } from "@/lib/mock-data";

export function LiveActivityList() {
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className="flex gap-3 text-[12px] group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors cursor-default"
        >
          <div
            className={`mt-1 size-2 rounded-full shrink-0 shadow-sm ${
              n.type === "lead"
                ? "bg-success"
                : n.type === "ai"
                  ? "bg-primary"
                  : n.type === "payment"
                    ? "bg-gold"
                    : "bg-warning"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium leading-tight group-hover:text-foreground transition-colors">
              {n.title}
            </div>
            <div className="text-muted-foreground truncate mt-0.5">
              {n.desc}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium">
              {n.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "oklch(0.55 0.22 264)",
  "oklch(0.65 0.18 195)",
  "oklch(0.70 0.17 145)",
  "oklch(0.76 0.15 75)",
  "oklch(0.62 0.22 320)",
];

interface SourceMixChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function SourceMixChart({ data }: SourceMixChartProps) {
  const chartData = data.length ? data : [{ name: "No Data", value: 1 }];

  return (
    <>
      <div className="h-44 mt-2">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid oklch(0.92 0.01 255)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {data.map((s, i) => {
          const total = data.reduce((acc, curr) => acc + curr.value, 0);
          const pct = total ? ((s.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={s.name} className="flex items-center gap-2 text-[12px]">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1">{s.name}</span>
              <span className="font-semibold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

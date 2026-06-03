import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CampusOverviewChartProps {
  data: {
    metric: string;
    value: number | string;
    fill: string;
  }[];
}

export function CampusOverviewChart({ data }: CampusOverviewChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
          <XAxis dataKey="metric" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(0.92 0.01 255)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

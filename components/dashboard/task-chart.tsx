"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABELS } from "@/lib/types";
import type { Status } from "@/lib/types";

interface TaskChartProps {
  data: { status: Status; count: number }[];
}

const COLORS: Record<Status, string> = {
  OPEN: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  WAITING: "#eab308",
  RESOLVED: "#22c55e",
  CLOSED: "#a855f7",
};

export function TaskChart({ data }: TaskChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status],
    value: d.count,
    color: COLORS[d.status],
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
          No tasks yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, "Tasks"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

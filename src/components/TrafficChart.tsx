"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { t: "00:00", rpm: 12 }, { t: "02:00", rpm: 9 }, { t: "04:00", rpm: 8 },
  { t: "06:00", rpm: 14 }, { t: "08:00", rpm: 21 }, { t: "10:00", rpm: 27 },
  { t: "12:00", rpm: 31 }, { t: "14:00", rpm: 29 }, { t: "16:00", rpm: 33 },
  { t: "18:00", rpm: 26 }, { t: "20:00", rpm: 22 }, { t: "22:00", rpm: 17 },
];

export default function TrafficChart() {
  return (
    <div className="rounded-xl border border-line bg-graphite-800/75 p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Requests / min (k), last 24h
      </p>
      <div className="mt-4 h-44 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2a3446" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke="#8a97ad" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8a97ad" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#0a1428",
                border: "1px solid #2a3446",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#8a97ad" }}
              itemStyle={{ color: "#22d3ee" }}
            />
            <Area
              type="monotone"
              dataKey="rpm"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#cyanFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
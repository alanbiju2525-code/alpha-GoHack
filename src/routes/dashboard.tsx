import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, ShieldCheck, ShieldAlert, Trash2, Link2, Globe, QrCode, FileWarning, MessageSquareWarning } from "lucide-react";
import { getHistory, clearHistory, type HistoryEntry, type ScanKind } from "@/lib/history";
import { severityLabel } from "@/lib/analysis";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Alpha AI" },
      { name: "description", content: "Live overview of your recent scans, safe vs risky breakdown, and analytics." },
    ],
  }),
  component: Dashboard,
});

const KIND_ICON: Record<ScanKind, React.ComponentType<{ className?: string }>> = {
  link: Link2,
  website: Globe,
  qr: QrCode,
  file: FileWarning,
  message: MessageSquareWarning,
};

function Dashboard() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const load = () => setItems(getHistory());
    load();
    window.addEventListener("alpha-history", load);
    return () => window.removeEventListener("alpha-history", load);
  }, []);

  const safe = items.filter((i) => i.trustScore >= 65).length;
  const risky = items.length - safe;

  const pieData = [
    { name: "Safe", value: safe, color: "oklch(0.78 0.19 152)" },
    { name: "Risky", value: risky, color: "oklch(0.65 0.24 22)" },
  ];

  const byKind: { kind: string; count: number }[] = (["link", "website", "qr", "file", "message"] as ScanKind[]).map((k) => ({
    kind: k.toUpperCase(),
    count: items.filter((i) => i.kind === k).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono uppercase tracking-widest text-primary mb-3">
            <Activity className="h-3 w-3" /> Live
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Defense <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-2">All scans you've run are saved locally on this device.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:border-destructive/50 text-sm text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" /> Clear history
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat title="Total Scans" value={items.length} icon={Activity} accent="primary" />
        <Stat title="Safe" value={safe} icon={ShieldCheck} accent="success" />
        <Stat title="Risky" value={risky} icon={ShieldAlert} accent="destructive" />
        <Stat
          title="Avg Trust"
          value={items.length ? Math.round(items.reduce((a, b) => a + b.trustScore, 0) / items.length) : 0}
          icon={ShieldCheck}
          accent="primary"
        />
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No scans yet. Run any scanner to see analytics here.</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Safe vs Risky</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                      {pieData.map((d) => (<Cell key={d.name} fill={d.color} />))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.2 0.03 250 / 0.95)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Scans by type</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={byKind}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                    <XAxis dataKey="kind" stroke="oklch(0.7 0.03 240)" fontSize={11} />
                    <YAxis stroke="oklch(0.7 0.03 240)" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(1 0 0 / 0.05)" }}
                      contentStyle={{
                        background: "oklch(0.2 0.03 250 / 0.95)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="oklch(0.82 0.16 195)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Recent scans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border/40">
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Target</th>
                    <th className="py-2 pr-3">Score</th>
                    <th className="py-2 pr-3">Verdict</th>
                    <th className="py-2 pr-3">When</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 20).map((it) => {
                    const Icon = KIND_ICON[it.kind];
                    const color =
                      it.trustScore >= 65 ? "text-success" : it.trustScore >= 45 ? "text-warning" : "text-destructive";
                    return (
                      <tr key={it.id} className="border-b border-border/20 last:border-0">
                        <td className="py-3 pr-3">
                          <span className="inline-flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="capitalize">{it.kind}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-3 max-w-xs truncate font-mono text-xs" title={it.target}>{it.target}</td>
                        <td className={`py-3 pr-3 font-mono font-semibold ${color}`}>{it.trustScore}</td>
                        <td className={`py-3 pr-3 ${color}`}>{severityLabel(it.severity)}</td>
                        <td className="py-3 pr-3 text-muted-foreground text-xs">{new Date(it.at).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "success" | "destructive";
}) {
  const colors = {
    primary: "from-primary/30 to-accent/20 text-primary",
    success: "from-success/30 to-primary/10 text-success",
    destructive: "from-destructive/30 to-accent/10 text-destructive",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold font-mono">{value}</p>
      </div>
    </motion.div>
  );
}

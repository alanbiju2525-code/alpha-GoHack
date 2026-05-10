import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX, Sparkles, ChevronRight } from "lucide-react";
import type { ScanResult } from "@/lib/analysis";
import { severityLabel } from "@/lib/analysis";

const ICONS = {
  safe: ShieldCheck,
  low: ShieldCheck,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: ShieldX,
};

const SEVERITY_BG = {
  safe: "from-success/30 to-primary/20 text-success border-success/40",
  low: "from-primary/30 to-accent/20 text-primary border-primary/40",
  medium: "from-warning/30 to-warning/10 text-warning border-warning/40",
  high: "from-destructive/30 to-destructive/10 text-destructive border-destructive/40",
  critical: "from-destructive/40 to-accent/20 text-destructive border-destructive/50",
};

export function ResultCard({ result }: { result: ScanResult }) {
  const Icon = ICONS[result.severity];
  const ringColor =
    result.trustScore >= 70
      ? "oklch(0.78 0.19 152)"
      : result.trustScore >= 45
      ? "oklch(0.82 0.17 75)"
      : "oklch(0.65 0.24 22)";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (result.trustScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6"
    >
      <div className={`glass rounded-2xl p-6 sm:p-8 border-l-4 bg-gradient-to-br ${SEVERITY_BG[result.severity]}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r="54" stroke="oklch(1 0 0 / 0.08)" strokeWidth="10" fill="none" />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                stroke={ringColor}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 10px ${ringColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground font-mono">{result.trustScore}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Trust</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Icon className="h-5 w-5" />
              <span className="text-sm font-mono uppercase tracking-widest">{severityLabel(result.severity)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {result.severity === "safe" ? "Looks Safe" : result.severity === "critical" ? "High Threat Detected" : "Caution Advised"}
            </h2>
            <p className="text-muted-foreground">{result.summary}</p>
          </div>
        </div>

        {result.meta && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/40">
            {Object.entries(result.meta).map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p>
                <p className="text-sm font-mono truncate text-foreground" title={v}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Why Alpha AI flagged this</h3>
          </div>
          {result.findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings.</p>
          ) : (
            <ul className="space-y-3">
              {result.findings.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex gap-3"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      f.weight > 0 ? "bg-success" : f.weight < -20 ? "bg-destructive" : "bg-warning"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.detail}</p>
                  </div>
                  <span className={`text-xs font-mono ${f.weight > 0 ? "text-success" : "text-destructive"}`}>
                    {f.weight > 0 ? "+" : ""}{f.weight}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-success" />
            <h3 className="font-semibold">Recommended actions</h3>
          </div>
          <ul className="space-y-3">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export function ScannerHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center mb-10">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono uppercase tracking-widest text-primary mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        {eyebrow}
      </span>
      <h1 className="text-3xl sm:text-5xl font-bold mb-3 tracking-tight">
        <span className="gradient-text">{title}</span>
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <span className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
        Alpha AI analyzing…
      </span>
    </div>
  );
}

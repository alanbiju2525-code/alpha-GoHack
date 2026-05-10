import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Link2,
  Globe,
  QrCode,
  FileWarning,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Eye,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alpha AI — Detect Phishing, Scams & Malware Instantly" },
      {
        name: "description",
        content:
          "AI-powered scanner for suspicious links, websites, QR codes, files and scam messages. Get a trust score and explainable findings in seconds.",
      },
    ],
  }),
  component: Home,
});

const scanners = [
  { to: "/scan/link", icon: Link2, title: "Link Scanner", desc: "URL structure, brand spoofing, redirects, HTTPS." },
  { to: "/scan/website", icon: Globe, title: "Website Inspection", desc: "Fake login forms, password fields, scam wording." },
  { to: "/scan/qr", icon: QrCode, title: "QR Code Scan", desc: "Decode QR images and analyze the destination URL." },
  { to: "/scan/file", icon: FileWarning, title: "Software Checker", desc: ".exe, .apk, .zip risk profiling and reputation." },
  { to: "/scan/message", icon: MessageSquareWarning, title: "Scam Messages", desc: "SMS / WhatsApp phishing and urgency tactics." },
  { to: "/dashboard", icon: ShieldCheck, title: "Live Dashboard", desc: "Recent scans, safe vs risky, analytics charts." },
] as const;

const features = [
  { icon: Sparkles, title: "Explainable AI", desc: "Every flag is backed by a clear reason — never a black box." },
  { icon: Zap, title: "Instant Results", desc: "On-device heuristic engine — no upload, no waiting." },
  { icon: Lock, title: "Privacy First", desc: "Your URLs and files never leave your browser." },
  { icon: Eye, title: "Threat Coverage", desc: "Phishing, smishing, malware, brand impersonation & more." },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-mono uppercase tracking-widest mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-primary">AI Defense Engine — Online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Detect scams before <br className="hidden sm:block" />
            they detect <span className="gradient-text">you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
          >
            Alpha AI is your personal cybersecurity analyst. Paste any link, message, file
            or QR code — get an explainable risk score in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/scan/link"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-7 py-3.5 font-semibold text-primary-foreground shadow-[0_0_30px_-4px_oklch(0.82_0.16_195/0.6)] hover:shadow-[0_0_40px_-2px_oklch(0.82_0.16_195/0.9)] transition-all"
            >
              Scan Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl glass px-7 py-3.5 font-semibold hover:border-primary/50 transition-all"
            >
              View Dashboard
            </Link>
          </motion.div>

          {/* Floating stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { v: "6", l: "Scanner Modes" },
              { v: "<1s", l: "Avg Detection" },
              { v: "30+", l: "Threat Signals" },
              { v: "100%", l: "On-Device" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-xl p-4">
                <p className="text-2xl font-bold gradient-text font-mono">{s.v}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Scanners grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Six scanners. <span className="gradient-text">One shield.</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Pick a tool below — each one analyzes a different attack surface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scanners.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={s.to}
                className="group block glass rounded-2xl p-6 h-full hover:border-primary/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:from-primary/40 group-hover:to-accent/40 transition-all">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="glass rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built like a <span className="gradient-text">real product</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl glass p-10 sm:p-16 text-center">
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-hero)" }} />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Stay one step ahead of <span className="gradient-text-danger">scammers.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Run your first scan now — it takes less than a second.
            </p>
            <Link
              to="/scan/link"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-7 py-3.5 font-semibold text-primary-foreground shadow-[0_0_30px_-4px_oklch(0.82_0.16_195/0.6)]"
            >
              Launch Scanner <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

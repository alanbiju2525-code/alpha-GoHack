import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, Smartphone, KeyRound, Mail, Wifi, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Cyber Safety Tips — Alpha AI" },
      { name: "description", content: "Practical, real-world tips to stay safe online: passwords, phishing, OTPs, public Wi-Fi and more." },
    ],
  }),
  component: Tips,
});

const TIPS = [
  { icon: KeyRound, title: "Use a password manager", body: "Unique 16+ character passwords for every account. 1Password, Bitwarden or your browser's built-in manager are all fine." },
  { icon: Lock, title: "Turn on 2FA everywhere", body: "Use an authenticator app (not SMS) for email, banking and social accounts. Stops 99% of account takeovers." },
  { icon: Eye, title: "Hover before you click", body: "On desktop, hover any link to preview the real URL. On mobile, long-press to inspect." },
  { icon: Mail, title: "Never share OTPs", body: "Banks, courier companies and tax offices never ask for OTPs. If someone does — it's a scam." },
  { icon: Smartphone, title: "Side-load apps with caution", body: "Stick to official app stores. .apk files from random websites often bundle spyware." },
  { icon: Wifi, title: "Treat public Wi-Fi as hostile", body: "Use a VPN on coffee-shop / airport networks. Avoid logging into banking unless absolutely necessary." },
  { icon: AlertTriangle, title: "Slow down on urgency", body: "“Act in 24 hours or your account will be blocked” is the #1 scam tell. Pause, verify, then act." },
  { icon: ShieldCheck, title: "Keep software updated", body: "Most malware exploits known bugs. Auto-update your OS, browser and apps weekly." },
];

function Tips() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-mono uppercase tracking-widest text-primary mb-4">
          <ShieldCheck className="h-3 w-3" /> Stay Safe
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          Cyber Safety <span className="gradient-text">Playbook</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Eight habits that protect you against 95% of everyday online threats.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TIPS.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 mb-4">
              <t.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1.5">{t.title}</h3>
            <p className="text-sm text-muted-foreground">{t.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

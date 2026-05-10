import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquareWarning, Search } from "lucide-react";
import { ResultCard, ScannerHeader, Spinner } from "@/components/scan-ui";
import { analyzeMessage, type ScanResult } from "@/lib/analysis";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/scan/message")({
  head: () => ({
    meta: [
      { title: "Scam Message Detector — Alpha AI" },
      { name: "description", content: "Paste suspicious SMS or WhatsApp messages. Alpha AI detects scam language, urgency tactics and phishing." },
    ],
  }),
  component: MessageScanner,
});

const SAMPLES = [
  "URGENT: Your SBI account has been suspended. Verify KYC now: http://sbi-kyc-update.click/verify or your account will be blocked within 24 hours.",
  "Congratulations! You won an iPhone 15. Claim your prize here: bit.ly/win-now. Share your OTP to confirm.",
  "Hey, are we still on for coffee tomorrow at 4pm?",
];

function MessageScanner() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  function run(t: string) {
    if (!t.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = analyzeMessage(t);
      setResult(r);
      setLoading(false);
      addHistory({
        kind: "message",
        target: t.slice(0, 80) + (t.length > 80 ? "…" : ""),
        trustScore: r.trustScore,
        severity: r.severity,
      });
    }, 700);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <ScannerHeader
        eyebrow="Message Scanner"
        title="Is this message a scam?"
        description="Paste any SMS, WhatsApp, or email body. Alpha AI flags urgency tactics, OTP requests, fake bank pretenses, and embedded malicious links."
      />

      <div className="glass rounded-2xl p-3">
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-input/50">
          <MessageSquareWarning className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste the suspicious message here…"
            className="flex-1 bg-transparent outline-none resize-none text-sm"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => run(text)}
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Search className="h-4 w-4" /> Analyze Message
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Try a sample:</span>
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => { setText(s); run(s); }}
            className="text-xs px-2.5 py-1 rounded-md glass hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
          >
            Sample {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading && <div className="glass rounded-2xl p-8 scan-line"><Spinner /></div>}
        {result && !loading && <ResultCard result={result} />}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link2, Search } from "lucide-react";
import { ResultCard, ScannerHeader, Spinner } from "@/components/scan-ui";
import { analyzeUrl, type ScanResult } from "@/lib/analysis";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/scan/link")({
  head: () => ({
    meta: [
      { title: "Link Scanner — Alpha AI" },
      { name: "description", content: "Paste any URL. Alpha AI checks structure, HTTPS, brand spoofing, redirects and more." },
    ],
  }),
  component: LinkScanner,
});

const SAMPLES = [
  "https://amaz0n-secure-login.click/verify",
  "https://github.com/openai",
  "http://192.168.1.1/admin/account-update",
  "https://bit.ly/3xYzAbC",
];

function LinkScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  function run(target: string) {
    if (!target.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = analyzeUrl(target);
      setResult(r);
      setLoading(false);
      addHistory({ kind: "link", target, trustScore: r.trustScore, severity: r.severity });
    }, 700);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <ScannerHeader
        eyebrow="Link Scanner"
        title="Is this URL safe?"
        description="Paste any link. Alpha AI inspects 15+ signals — HTTPS, brand impersonation, suspicious TLDs, IDN tricks and more."
      />

      <form
        onSubmit={(e) => { e.preventDefault(); run(url); }}
        className="glass rounded-2xl p-3 flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-input/50">
          <Link2 className="h-5 w-5 text-primary flex-shrink-0" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/login"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-mono text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50 transition-all"
        >
          <Search className="h-4 w-4" />
          Analyze
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            onClick={() => { setUrl(s); run(s); }}
            className="text-xs font-mono px-2.5 py-1 rounded-md glass hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
          >
            {s.length > 36 ? s.slice(0, 36) + "…" : s}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading && (
          <div className="glass rounded-2xl p-8 scan-line">
            <Spinner />
          </div>
        )}
        {result && !loading && <ResultCard result={result} />}
      </div>
    </div>
  );
}

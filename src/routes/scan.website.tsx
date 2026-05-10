import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Search } from "lucide-react";
import { ResultCard, ScannerHeader, Spinner } from "@/components/scan-ui";
import { analyzeWebsite, type ScanResult } from "@/lib/analysis";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/scan/website")({
  head: () => ({
    meta: [
      { title: "Website Inspector — Alpha AI" },
      { name: "description", content: "Simulate a deep website inspection: login forms, password fields, brand impersonation, scam wording." },
    ],
  }),
  component: WebsiteScanner,
});

function WebsiteScanner() {
  const [url, setUrl] = useState("");
  const [hasLogin, setHasLogin] = useState(false);
  const [hasPwd, setHasPwd] = useState(false);
  const [popups, setPopups] = useState(0);
  const [brand, setBrand] = useState("");
  const [scamText, setScamText] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  function run() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = analyzeWebsite({
        url,
        hasLoginForm: hasLogin,
        hasPasswordField: hasPwd,
        popupCount: popups,
        brandMentions: brand ? brand.split(",").map(s => s.trim()).filter(Boolean) : [],
        scamWords: scamText ? scamText.split(",").map(s => s.trim()).filter(Boolean) : [],
      });
      setResult(r);
      setLoading(false);
      addHistory({ kind: "website", target: url, trustScore: r.trustScore, severity: r.severity });
    }, 900);
  }

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl glass cursor-pointer hover:border-primary/40 transition-colors">
      <span className="text-sm">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <ScannerHeader
        eyebrow="Website Inspector"
        title="Inspect a website safely"
        description="Tell Alpha AI what you observed on the page — it correlates the signals with the URL to score the site."
      />

      <div className="glass rounded-2xl p-6 grid gap-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-input/50">
          <Globe className="h-5 w-5 text-primary" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://suspicious-site.example/login"
            className="flex-1 bg-transparent outline-none font-mono text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Toggle checked={hasLogin} onChange={setHasLogin} label="Has a login form" />
          <Toggle checked={hasPwd} onChange={setHasPwd} label="Asks for password" />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Popup count</span>
            <input
              type="number"
              min={0}
              value={popups}
              onChange={(e) => setPopups(Number(e.target.value))}
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-input/50 outline-none border border-transparent focus:border-primary/50 font-mono"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Brands mentioned (comma)</span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Amazon, PayPal"
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-input/50 outline-none border border-transparent focus:border-primary/50"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Scam phrases on page (comma separated)</span>
          <input
            value={scamText}
            onChange={(e) => setScamText(e.target.value)}
            placeholder="claim your prize, urgent action required"
            className="mt-1 w-full px-4 py-2.5 rounded-xl bg-input/50 outline-none border border-transparent focus:border-primary/50"
          />
        </label>

        <button
          onClick={run}
          disabled={loading || !url.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> Inspect Website
        </button>
      </div>

      <div className="mt-10">
        {loading && <div className="glass rounded-2xl p-8 scan-line"><Spinner /></div>}
        {result && !loading && <ResultCard result={result} />}
      </div>
    </div>
  );
}

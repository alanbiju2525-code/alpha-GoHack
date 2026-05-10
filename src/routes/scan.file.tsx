import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileWarning, Upload } from "lucide-react";
import { ResultCard, ScannerHeader, Spinner } from "@/components/scan-ui";
import { analyzeFile, type ScanResult } from "@/lib/analysis";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/scan/file")({
  head: () => ({
    meta: [
      { title: "Software File Checker — Alpha AI" },
      { name: "description", content: "Inspect .exe, .apk, .zip and other files for malware indicators based on metadata heuristics." },
    ],
  }),
  component: FileScanner,
});

function FileScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function handleFile(f: File) {
    setFile(f);
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = analyzeFile({ name: f.name, size: f.size, type: f.type });
      setResult(r);
      setLoading(false);
      addHistory({ kind: "file", target: f.name, trustScore: r.trustScore, severity: r.severity });
    }, 900);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <ScannerHeader
        eyebrow="Software Checker"
        title="Is this file safe to open?"
        description=".exe, .apk, .zip, .msi — Alpha AI profiles risk from extension, name patterns, size and packaging tricks."
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        className="glass rounded-2xl p-10 border-2 border-dashed border-border hover:border-primary/60 cursor-pointer text-center transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warning/30 to-destructive/20">
          <FileWarning className="h-8 w-8 text-warning" />
        </div>
        <p className="font-semibold mb-1">Drop a file to inspect</p>
        <p className="text-sm text-muted-foreground">Files are never uploaded — only metadata is analyzed locally</p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-semibold text-primary-foreground">
          <Upload className="h-4 w-4" /> Choose file
        </button>
      </div>

      {file && (
        <div className="mt-6 glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Selected</p>
          <p className="font-mono text-sm break-all">{file.name}</p>
        </div>
      )}

      <div className="mt-10">
        {loading && <div className="glass rounded-2xl p-8 scan-line"><Spinner /></div>}
        {result && !loading && <ResultCard result={result} />}
      </div>
    </div>
  );
}

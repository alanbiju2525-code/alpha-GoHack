import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { QrCode, Upload } from "lucide-react";
import jsQR from "jsqr";
import { ResultCard, ScannerHeader, Spinner } from "@/components/scan-ui";
import { analyzeUrl, type ScanResult } from "@/lib/analysis";
import { addHistory } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/scan/qr")({
  head: () => ({
    meta: [
      { title: "QR Scam Detector — Alpha AI" },
      { name: "description", content: "Upload a QR code image. Alpha AI decodes it and checks the destination URL for scams." },
    ],
  }),
  component: QrScanner,
});

function QrScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setResult(null);
    setDecoded(null);
    setLoading(true);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    setPreview(dataUrl);

    const img = new Image();
    img.src = dataUrl;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height);

    if (!code) {
      toast.error("No QR code detected in this image.");
      setLoading(false);
      return;
    }

    setDecoded(code.data);
    setTimeout(() => {
      const r = analyzeUrl(code.data);
      setResult(r);
      setLoading(false);
      addHistory({ kind: "qr", target: code.data, trustScore: r.trustScore, severity: r.severity });
    }, 600);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <ScannerHeader
        eyebrow="QR Scanner"
        title="Decode any QR code"
        description="Quishing is on the rise. Upload a QR image — Alpha AI extracts the URL and analyzes the destination."
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className="glass rounded-2xl p-10 border-2 border-dashed border-border hover:border-primary/60 cursor-pointer text-center transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
        <p className="font-semibold mb-1">Drop a QR code image here</p>
        <p className="text-sm text-muted-foreground">PNG, JPG, WEBP — analyzed entirely in your browser</p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 font-semibold text-primary-foreground">
          <Upload className="h-4 w-4" /> Choose image
        </button>
      </div>

      {preview && (
        <div className="mt-6 glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
          <img src={preview} alt="QR preview" className="h-32 w-32 object-contain rounded-lg bg-background/40 p-2" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Decoded content</p>
            <p className="font-mono text-sm break-all mt-1">{decoded ?? "—"}</p>
          </div>
        </div>
      )}

      <div className="mt-10">
        {loading && <div className="glass rounded-2xl p-8 scan-line"><Spinner /></div>}
        {result && !loading && <ResultCard result={result} />}
      </div>
    </div>
  );
}

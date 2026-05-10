# Alpha AI — AI-Powered Cyber Defense

A modern, dark-themed cybersecurity website that detects suspicious links, phishing
sites, scam URLs, malicious QR codes, suspicious software files, and scam messages
using an explainable client-side heuristic engine.

> Built for hackathon demos — premium look & feel, runs entirely in the browser.

## Features

- **Link Scanner** — analyzes URL structure, HTTPS, suspicious TLDs, IP hosts,
  punycode tricks, brand impersonation, URL shorteners, phishing keywords.
- **Website Inspector** — combines URL signals with observed page traits
  (login forms, password fields, popups, brand wording).
- **QR Code Scanner** — decodes QR images locally with `jsQR` and runs the URL
  through the link analyzer.
- **Software File Checker** — risk profile for `.exe`, `.apk`, `.zip`, `.msi`,
  double-extension tricks and suspicious filenames.
- **Scam Message Detector** — finds urgency tactics, OTP requests, scam
  vocabulary, embedded links and more.
- **Explainable AI** — every flag includes a human-readable reason and weight.
- **Cyber Safety Tips** — playbook of practical habits.
- **Dashboard** — recent scans, safe-vs-risky pie, scans-by-type bar chart.
  History is stored in `localStorage`.

## Tech Stack

- **TanStack Start** + **React 19** + **Vite 7**
- **Tailwind CSS v4** (semantic design tokens in `src/styles.css`)
- **Framer Motion** for animations
- **Recharts** for dashboard analytics
- **jsQR** for QR decoding
- **Lucide** icons, **shadcn/ui** primitives

## Folder Structure

```
src/
  components/
    layout.tsx         # Navbar + Footer
    scan-ui.tsx        # ResultCard, ScannerHeader, Spinner
    ui/                # shadcn primitives
  lib/
    analysis.ts        # All heuristic scanners (link, message, website, file)
    history.ts         # localStorage scan history
  routes/
    __root.tsx         # Root layout (head, providers, navbar/footer)
    index.tsx          # Homepage
    scan.link.tsx      # /scan/link
    scan.website.tsx   # /scan/website
    scan.qr.tsx        # /scan/qr
    scan.file.tsx      # /scan/file
    scan.message.tsx   # /scan/message
    dashboard.tsx      # /dashboard
    tips.tsx           # /tips
  styles.css           # Design system tokens
```

## Run Locally

```bash
bun install
bun run dev
```

Open http://localhost:8080/.

## How the "AI" Works

This v1 ships a fully client-side, transparent heuristic engine in
`src/lib/analysis.ts`. Each scanner returns a `ScanResult`:

```ts
{
  trustScore: 0..100,
  severity: "safe" | "low" | "medium" | "high" | "critical",
  summary: string,
  findings: { label, detail, weight }[],
  recommendations: string[],
  meta?: Record<string, string>
}
```

To upgrade to real ML or LLM-based detection, swap any analyzer's body with a
call to a server function or the Lovable AI Gateway — the UI contract stays the
same.

## Privacy

Nothing leaves your device. All URL parsing, QR decoding, and file metadata
analysis happens in your browser. Scan history is stored in `localStorage` only.

## License

MIT.

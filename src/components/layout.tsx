import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/scan/link", label: "Link" },
  { to: "/scan/website", label: "Website" },
  { to: "/scan/qr", label: "QR" },
  { to: "/scan/file", label: "File" },
  { to: "/scan/message", label: "Message" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tips", label: "Tips" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/40 blur-md group-hover:blur-lg transition-all" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">Alpha AI</span>
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              Cyber Defense
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                preload="intent"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/scan/link"
          className="hidden sm:inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.82_0.16_195/0.6)] hover:shadow-[0_0_28px_-2px_oklch(0.82_0.16_195/0.8)] transition-all"
        >
          Scan Now
        </Link>

        <button
          className="lg:hidden p-2 rounded-md hover:bg-muted/50"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/50 px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm hover:bg-muted/50"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">Alpha AI</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            AI-powered cyber defense for everyday users. Scan suspicious links, files,
            QR codes, and messages — instantly, in your browser.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-3">Scanners</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/scan/link" className="hover:text-primary">Link Scanner</Link></li>
            <li><Link to="/scan/website" className="hover:text-primary">Website Inspector</Link></li>
            <li><Link to="/scan/qr" className="hover:text-primary">QR Code</Link></li>
            <li><Link to="/scan/file" className="hover:text-primary">Software File</Link></li>
            <li><Link to="/scan/message" className="hover:text-primary">Scam Message</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold mb-3">Resources</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tips" className="hover:text-primary">Cyber Safety Tips</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Alpha AI. Built for a safer internet.</p>
          <p className="font-mono">v1.0 · heuristic engine</p>
        </div>
      </div>
    </footer>
  );
}

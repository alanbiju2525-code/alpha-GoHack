// Heuristic-based "AI" analysis for the Alpha AI scanners.
// Pure client-side; no network calls.

export type Severity = "safe" | "low" | "medium" | "high" | "critical";

export interface Finding {
  label: string;
  detail: string;
  weight: number; // negative = risky, positive = trustworthy
}

export interface ScanResult {
  trustScore: number; // 0-100
  severity: Severity;
  summary: string;
  findings: Finding[];
  recommendations: string[];
  meta?: Record<string, string>;
}

const SUSPICIOUS_TLDS = [".zip", ".mov", ".country", ".kim", ".work", ".click", ".link", ".gq", ".tk", ".ml", ".cf", ".xyz", ".top", ".loan"];
const BRANDS = ["paypal", "amazon", "apple", "microsoft", "google", "facebook", "instagram", "netflix", "whatsapp", "binance", "metamask", "coinbase", "chase", "wellsfargo", "hdfc", "sbi", "icici"];
const URGENCY_WORDS = ["urgent", "immediately", "act now", "verify now", "within 24 hours", "suspended", "locked", "blocked", "final notice", "last warning", "limited time"];
const SCAM_WORDS = ["congratulations", "you won", "claim your prize", "lottery", "free gift", "click here", "kyc update", "refund pending", "tax refund", "bitcoin", "investment opportunity", "double your money", "guaranteed returns", "otp", "share otp", "send code"];
const PHISHING_PHRASES = ["confirm your password", "update your account", "verify your identity", "unusual activity", "sign in to continue", "your account will be"];

function severityFromScore(score: number): Severity {
  if (score >= 85) return "safe";
  if (score >= 65) return "low";
  if (score >= 45) return "medium";
  if (score >= 25) return "high";
  return "critical";
}

export function severityColor(s: Severity) {
  switch (s) {
    case "safe": return "text-success";
    case "low": return "text-primary";
    case "medium": return "text-warning";
    case "high": return "text-destructive";
    case "critical": return "text-destructive";
  }
}

export function severityLabel(s: Severity) {
  return { safe: "Safe", low: "Low Risk", medium: "Suspicious", high: "Dangerous", critical: "Critical Threat" }[s];
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function analyzeUrl(rawUrl: string): ScanResult {
  const findings: Finding[] = [];
  const recommendations: string[] = [];
  let score = 100;

  let url: URL | null = null;
  const trimmed = rawUrl.trim();
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`);
  } catch {
    return {
      trustScore: 0,
      severity: "critical",
      summary: "Invalid URL format. Could not parse.",
      findings: [{ label: "Invalid URL", detail: "The provided string is not a valid URL.", weight: -100 }],
      recommendations: ["Double-check the URL for typos before opening."],
    };
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname + url.search;

  // HTTPS
  if (url.protocol === "https:") {
    findings.push({ label: "HTTPS encryption", detail: "Connection is encrypted via TLS.", weight: +5 });
  } else {
    score -= 25;
    findings.push({ label: "No HTTPS", detail: "Site uses unencrypted HTTP — credentials can be intercepted.", weight: -25 });
    recommendations.push("Avoid entering any data on non-HTTPS websites.");
  }

  // IP address as host
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    score -= 30;
    findings.push({ label: "IP address used as domain", detail: "Legitimate services almost never expose raw IPs to users.", weight: -30 });
  }

  // Suspicious TLD
  const tld = "." + host.split(".").pop()!;
  if (SUSPICIOUS_TLDS.includes(tld)) {
    score -= 18;
    findings.push({ label: `High-abuse TLD (${tld})`, detail: "This TLD is frequently used for short-lived scam sites.", weight: -18 });
  }

  // Excessive subdomains
  const parts = host.split(".");
  if (parts.length > 4) {
    score -= 12;
    findings.push({ label: "Excessive subdomains", detail: `Domain has ${parts.length} parts, often used to disguise the real host.`, weight: -12 });
  }

  // Hyphens / digits density
  const hyphens = (host.match(/-/g) || []).length;
  if (hyphens >= 3) {
    score -= 10;
    findings.push({ label: "Many hyphens in domain", detail: `${hyphens} hyphens — typical of typosquatting domains.`, weight: -10 });
  }
  const digits = (host.match(/\d/g) || []).length;
  if (digits >= 4) {
    score -= 8;
    findings.push({ label: "Digit-heavy domain", detail: "Random digits in domains are commonly seen in phishing.", weight: -8 });
  }

  // Brand impersonation
  const hostNoTld = parts.slice(0, -1).join(".");
  for (const brand of BRANDS) {
    if (hostNoTld.includes(brand) && !host.endsWith(`${brand}.com`) && !host.endsWith(`${brand}.in`) && !host.endsWith(`${brand}.co`)) {
      score -= 28;
      findings.push({
        label: `Possible "${brand}" impersonation`,
        detail: `Domain mentions "${brand}" but is not the official domain.`,
        weight: -28,
      });
      recommendations.push(`Visit ${brand}.com directly instead of clicking links.`);
      break;
    }
  }

  // @ trick / credentials in URL
  if (trimmed.includes("@") && !trimmed.startsWith("mailto:")) {
    score -= 20;
    findings.push({ label: "Credentials trick (@ in URL)", detail: "Attackers hide the real host after an '@' character.", weight: -20 });
  }

  // Punycode
  if (host.startsWith("xn--") || host.includes(".xn--")) {
    score -= 22;
    findings.push({ label: "Punycode / IDN domain", detail: "Could be a homograph attack (e.g. аpple.com using Cyrillic а).", weight: -22 });
  }

  // URL shorteners
  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "shorturl.at"];
  if (shorteners.some(s => host.endsWith(s))) {
    score -= 15;
    findings.push({ label: "URL shortener detected", detail: "Real destination is hidden — could redirect anywhere.", weight: -15 });
    recommendations.push("Expand short links with a preview tool before clicking.");
  }

  // Suspicious keywords in path
  const lowerFull = trimmed.toLowerCase();
  const phishKeywords = ["login", "verify", "secure", "account", "update", "wallet", "confirm", "signin", "bank"];
  const hits = phishKeywords.filter(k => path.toLowerCase().includes(k));
  if (hits.length >= 2) {
    score -= 14;
    findings.push({ label: "Phishing keywords in URL", detail: `Path contains: ${hits.join(", ")}.`, weight: -14 });
  }

  // Long URL
  if (trimmed.length > 100) {
    score -= 8;
    findings.push({ label: "Unusually long URL", detail: `${trimmed.length} characters — often used to hide the destination.`, weight: -8 });
  }

  // Known good signals
  const reputable = ["google.com", "github.com", "microsoft.com", "apple.com", "wikipedia.org", "openai.com", "cloudflare.com"];
  if (reputable.some(r => host === r || host.endsWith(`.${r}`))) {
    score += 10;
    findings.push({ label: "Well-known reputable domain", detail: `${host} is a widely-trusted service.`, weight: +10 });
  }

  // Generic recommendations
  if (recommendations.length === 0) {
    if (score < 70) recommendations.push("Do not enter passwords or payment info on this site.");
    recommendations.push("Hover links to preview the real URL before clicking.");
    recommendations.push("When in doubt, type the brand's official URL by hand.");
  }

  score = clamp(score);
  const severity = severityFromScore(score);

  return {
    trustScore: Math.round(score),
    severity,
    summary:
      severity === "safe"
        ? "No major risk indicators detected by Alpha AI."
        : severity === "critical"
        ? "Multiple severe indicators of phishing or fraud were detected."
        : "Alpha AI flagged potential risks — review the findings carefully.",
    findings,
    recommendations,
    meta: {
      Host: host,
      Protocol: url.protocol.replace(":", "").toUpperCase(),
      Path: url.pathname || "/",
      Length: String(trimmed.length),
    },
  };
}

export function analyzeMessage(text: string): ScanResult {
  const findings: Finding[] = [];
  const recommendations: string[] = [];
  let score = 100;
  const t = text.toLowerCase();

  const urgency = URGENCY_WORDS.filter(w => t.includes(w));
  if (urgency.length) {
    const w = Math.min(30, urgency.length * 12);
    score -= w;
    findings.push({ label: "Urgency / fear tactics", detail: `Phrases like: ${urgency.slice(0, 3).join(", ")}`, weight: -w });
  }

  const scammy = SCAM_WORDS.filter(w => t.includes(w));
  if (scammy.length) {
    const w = Math.min(35, scammy.length * 10);
    score -= w;
    findings.push({ label: "Classic scam vocabulary", detail: `Found: ${scammy.slice(0, 4).join(", ")}`, weight: -w });
  }

  const phish = PHISHING_PHRASES.filter(w => t.includes(w));
  if (phish.length) {
    score -= 22;
    findings.push({ label: "Phishing call-to-action", detail: `Asks you to: ${phish[0]}`, weight: -22 });
  }

  // OTP request
  if (/\botp\b|one[- ]time password|verification code/.test(t) && /(share|send|tell|give|provide)/.test(t)) {
    score -= 35;
    findings.push({ label: "Asks to share OTP / code", detail: "No legitimate company will ever ask for your OTP.", weight: -35 });
    recommendations.push("Never share OTPs, PINs, or passwords with anyone.");
  }

  // Money mentions
  if (/(₹|rs\.?|inr|usd|\$|€|£)\s?\d/.test(t) || /\b(refund|prize|reward|cashback|lottery)\b/.test(t)) {
    score -= 12;
    findings.push({ label: "Money / reward mentioned", detail: "Common bait in financial scam messages.", weight: -12 });
  }

  // Embedded link analysis
  const urlMatches = text.match(/https?:\/\/[^\s)]+|\b[\w.-]+\.[a-z]{2,}\/[^\s)]*/gi) || [];
  if (urlMatches.length && urlMatches[0]) {
    const sub = analyzeUrl(urlMatches[0]);
    const drop = Math.round((100 - sub.trustScore) * 0.4);
    score -= drop;
    findings.push({
      label: "Embedded link risk",
      detail: `${urlMatches[0]} — link trust score ${sub.trustScore}/100.`,
      weight: -drop,
    });
  }

  // ALL CAPS shouting
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 30 && letters === letters.toUpperCase()) {
    score -= 8;
    findings.push({ label: "All caps message", detail: "Shouting style is often used in spam.", weight: -8 });
  }

  // Spelling weirdness (very crude)
  if (/(acount|verfy|recieve|kindlly|congradulation|wining)/i.test(text)) {
    score -= 10;
    findings.push({ label: "Spelling errors", detail: "Misspellings often indicate non-legitimate senders.", weight: -10 });
  }

  if (recommendations.length === 0) {
    recommendations.push("If the message claims to be from a bank, call the number on the back of your card.");
    recommendations.push("Do not click links from unknown senders.");
  }

  score = clamp(score);
  const severity = severityFromScore(score);

  return {
    trustScore: Math.round(score),
    severity,
    summary:
      severity === "safe"
        ? "Message looks normal — no scam indicators detected."
        : "Alpha AI detected scam indicators in this message.",
    findings,
    recommendations,
    meta: { Length: String(text.length), "Embedded links": String(urlMatches.length) },
  };
}

export interface WebsiteSignals {
  url: string;
  title?: string;
  hasPasswordField?: boolean;
  hasLoginForm?: boolean;
  popupCount?: number;
  brandMentions?: string[];
  scamWords?: string[];
}

export function analyzeWebsite(s: WebsiteSignals): ScanResult {
  const base = analyzeUrl(s.url);
  const findings = [...base.findings];
  const recommendations = [...base.recommendations];
  let score = base.trustScore;

  if (s.hasPasswordField) {
    score -= 10;
    findings.push({ label: "Password field present", detail: "Page requests a password — verify the domain carefully.", weight: -10 });
  }
  if (s.hasLoginForm && !s.url.startsWith("https")) {
    score -= 25;
    findings.push({ label: "Login over plain HTTP", detail: "Credentials would be sent unencrypted.", weight: -25 });
  }
  if ((s.popupCount ?? 0) > 1) {
    score -= 10;
    findings.push({ label: "Multiple popups detected", detail: "Aggressive popups often signal scam pages.", weight: -10 });
  }
  if (s.brandMentions?.length) {
    score -= 18;
    findings.push({
      label: "Brand impersonation language",
      detail: `Mentions: ${s.brandMentions.join(", ")} without official domain.`,
      weight: -18,
    });
  }
  if (s.scamWords?.length) {
    score -= 14;
    findings.push({ label: "Scam wording on page", detail: s.scamWords.slice(0, 3).join(", "), weight: -14 });
  }

  score = clamp(score);
  return {
    ...base,
    trustScore: Math.round(score),
    severity: severityFromScore(score),
    findings,
    recommendations,
  };
}

export interface FileSignals {
  name: string;
  size: number;
  type: string;
}

export function analyzeFile(f: FileSignals): ScanResult {
  const findings: Finding[] = [];
  const recommendations: string[] = [];
  let score = 80;

  const name = f.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  const dangerous = ["exe", "scr", "bat", "cmd", "msi", "vbs", "js", "jar", "ps1"];
  const mobile = ["apk", "ipa"];
  const archives = ["zip", "rar", "7z"];

  if (dangerous.includes(ext)) {
    score -= 35;
    findings.push({ label: `Executable file (.${ext})`, detail: "Executables can install malware. Only run if you trust the source.", weight: -35 });
    recommendations.push("Scan with VirusTotal before opening.");
  }
  if (mobile.includes(ext)) {
    score -= 25;
    findings.push({ label: `Mobile app package (.${ext})`, detail: "Side-loaded apps bypass store reviews and may request risky permissions.", weight: -25 });
    recommendations.push("Prefer the official Play Store / App Store.");
  }
  if (archives.includes(ext)) {
    score -= 15;
    findings.push({ label: `Archive (.${ext})`, detail: "Archives can hide executables and bypass scanners.", weight: -15 });
  }

  // Double extension trick
  if (/\.(pdf|doc|jpg|png)\.(exe|scr|js|vbs)$/i.test(name)) {
    score -= 40;
    findings.push({ label: "Double-extension trick", detail: "File pretends to be a document but is actually executable.", weight: -40 });
  }

  // Misleading names
  if (/(crack|keygen|patch|hack|cheat|free.?download|setup_v\d)/i.test(name)) {
    score -= 30;
    findings.push({ label: "Suspicious filename", detail: "Names like crack/keygen are heavily associated with malware.", weight: -30 });
  }

  // Size signals
  if (f.size < 50_000 && dangerous.includes(ext)) {
    score -= 10;
    findings.push({ label: "Tiny executable", detail: "Very small executables are often droppers/loaders.", weight: -10 });
  }
  if (f.size > 500_000_000) {
    score -= 5;
    findings.push({ label: "Very large file", detail: "Bloated installers sometimes hide bundled adware.", weight: -5 });
  }

  if (findings.length === 0) {
    findings.push({ label: "No high-risk indicators", detail: "Filename and type look normal.", weight: +10 });
  }

  if (recommendations.length === 0) {
    recommendations.push("Verify the publisher's signature before installing.");
    recommendations.push("Run unknown installers inside a sandbox or VM.");
  }

  score = clamp(score);
  return {
    trustScore: Math.round(score),
    severity: severityFromScore(score),
    summary: score >= 70 ? "File appears low-risk based on metadata heuristics." : "Alpha AI flagged this file as risky.",
    findings,
    recommendations,
    meta: {
      Name: f.name,
      Type: f.type || "unknown",
      Extension: ext.toUpperCase(),
      Size: `${(f.size / 1024).toFixed(1)} KB`,
    },
  };
}

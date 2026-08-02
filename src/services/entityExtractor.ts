import { CrawledPage, StructuredCompanyData } from "@/types";

const NOISE_PHRASES = [
  "skip to main content",
  "skip to content",
  "trace id",
  "trace id is missing",
  "cookie settings",
  "cookie policy",
  "privacy policy",
  "terms of use",
  "terms of service",
  "all rights reserved",
  "sign in",
  "sign up",
  "log in",
  "log out",
  "register",
  "careers",
  "jobs",
  "accessibility",
  "copyright",
  "toggle navigation",
  "menu",
];

function isNoise(text: string): boolean {
  if (!text || text.trim().length < 2) return true;
  const lower = text.toLowerCase().trim();
  return NOISE_PHRASES.some((phrase) => lower.includes(phrase));
}

export function extractStructuredCompanyData(
  companyName: string,
  website: string,
  pages: CrawledPage[]
): StructuredCompanyData {
  const phoneSet = new Set<string>();
  const emailSet = new Set<string>();
  const addressSet = new Set<string>();
  const productSet = new Set<string>();
  const serviceSet = new Set<string>();
  const socialSet = new Set<string>();
  const importantPagesSet = new Set<string>();

  importantPagesSet.add(website);

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const socialDomains = ["linkedin.com", "twitter.com", "x.com", "facebook.com", "github.com", "youtube.com", "instagram.com"];

  pages.forEach((page) => {
    importantPagesSet.add(page.url);

    // Social Links
    socialDomains.forEach((domain) => {
      if (page.url.includes(domain)) {
        socialSet.add(page.url);
      }
    });

    const content = page.content || "";

    // Emails
    const foundEmails = content.match(emailRegex);
    if (foundEmails) {
      foundEmails.forEach((email) => {
        const lower = email.toLowerCase();
        if (!lower.endsWith(".png") && !lower.endsWith(".jpg") && !lower.endsWith(".svg")) {
          emailSet.add(lower);
        }
      });
    }

    // Phones
    const foundPhones = content.match(phoneRegex);
    if (foundPhones) {
      foundPhones.forEach((phone) => phoneSet.add(phone.trim()));
    }

    // Keyword heuristic extraction
    const lines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 2 && !isNoise(l));

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      // Product signals
      if (
        (lower.includes("product") || lower.includes("platform") || lower.includes("software") || lower.includes("app") || lower.includes("solution")) &&
        line.length < 50 &&
        !line.includes("http")
      ) {
        if (!isNoise(line)) {
          productSet.add(line);
        }
      }

      // Service signals
      if (
        (lower.includes("service") || lower.includes("consulting") || lower.includes("support") || lower.includes("solution") || lower.includes("managed")) &&
        line.length < 50 &&
        !line.includes("http")
      ) {
        if (!isNoise(line)) {
          serviceSet.add(line);
        }
      }

      // Address signals
      if (
        (lower.includes("street") || lower.includes("suite") || lower.includes("avenue") || lower.includes("boulevard") || lower.includes("road") || lower.includes("building")) &&
        line.length < 100
      ) {
        if (!isNoise(line)) {
          addressSet.add(line);
        }
      }
    });
  });

  return {
    companyName,
    website,
    phone: Array.from(phoneSet)[0] || "",
    emails: Array.from(emailSet).slice(0, 5),
    addresses: Array.from(addressSet).slice(0, 3),
    products: Array.from(productSet).filter((p) => !isNoise(p)).slice(0, 8),
    services: Array.from(serviceSet).filter((s) => !isNoise(s)).slice(0, 8),
    socialLinks: Array.from(socialSet).slice(0, 5),
    importantPages: Array.from(importantPagesSet).slice(0, 10),
  };
}

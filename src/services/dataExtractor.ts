import { CrawledPage, StructuredCompanyData } from "@/types";

const SOCIAL_DOMAINS = [
  "linkedin.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "youtube.com",
  "github.com",
  "instagram.com",
];

export function extractStructuredCompanyData(
  companyName: string,
  website: string,
  pages: CrawledPage[]
): StructuredCompanyData {
  const emailsSet = new Set<string>();
  const phonesSet = new Set<string>();
  const addressesSet = new Set<string>();
  const productsSet = new Set<string>();
  const servicesSet = new Set<string>();
  const socialLinksSet = new Set<string>();
  const importantPagesSet = new Set<string>();

  for (const page of pages) {
    importantPagesSet.add(page.url);

    const fullText = `${page.title}\n${page.content}`;

    // 1. Extract Emails
    const emailMatches = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const email of emailMatches) {
      const lower = email.toLowerCase().trim();
      if (!isIgnoredEmail(lower)) {
        emailsSet.add(lower);
      }
    }

    // 2. Extract Phone Numbers
    const phoneMatches = fullText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g) || [];
    for (const phone of phoneMatches) {
      const cleaned = phone.trim();
      const digitsOnly = cleaned.replace(/\D/g, "");
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15 && !digitsOnly.startsWith("202") && !digitsOnly.startsWith("203")) {
        phonesSet.add(cleaned);
      }
    }

    // 3. Extract Social Links
    const urlMatches = fullText.match(/https?:\/\/[^\s"'<>]+/g) || [];
    for (const urlStr of urlMatches) {
      try {
        const parsed = new URL(urlStr);
        if (SOCIAL_DOMAINS.some((domain) => parsed.hostname.includes(domain))) {
          socialLinksSet.add(urlStr.replace(/[.,;:]$/, ""));
        }
      } catch {
        // Ignore invalid URL parse
      }
    }

    // 4. Extract Products & Services based on page topics
    const urlLower = page.url.toLowerCase();
    const titleLower = page.title.toLowerCase();

    if (urlLower.includes("product") || titleLower.includes("product") || urlLower.includes("solution") || titleLower.includes("solution")) {
      const extractedItems = extractListItemsOrHeadings(page.content);
      extractedItems.forEach((item) => productsSet.add(item));
    }

    if (urlLower.includes("service") || titleLower.includes("service")) {
      const extractedItems = extractListItemsOrHeadings(page.content);
      extractedItems.forEach((item) => servicesSet.add(item));
    }

    // 5. Extract Addresses from contact/about sections
    if (urlLower.includes("contact") || urlLower.includes("about") || titleLower.includes("contact") || titleLower.includes("location")) {
      const addressLines = extractAddressLines(page.content);
      addressLines.forEach((addr) => addressesSet.add(addr));
    }
  }

  // Fallback product/service heuristic if specific product pages weren't found
  if (productsSet.size === 0 && servicesSet.size === 0 && pages.length > 0) {
    const mainPage = pages[0];
    const topLines = mainPage.content.split("\n").slice(0, 10);
    topLines.forEach((line) => {
      if (line.length > 10 && line.length < 80 && !line.includes("@") && !line.includes("http")) {
        servicesSet.add(line);
      }
    });
  }

  return {
    companyName: companyName || "Unknown Company",
    website: website || "",
    phone: Array.from(phonesSet)[0] || "Not specified",
    emails: Array.from(emailsSet).slice(0, 5),
    addresses: Array.from(addressesSet).slice(0, 3),
    products: Array.from(productsSet).slice(0, 8),
    services: Array.from(servicesSet).slice(0, 8),
    socialLinks: Array.from(socialLinksSet).slice(0, 6),
    importantPages: Array.from(importantPagesSet),
  };
}

function isIgnoredEmail(email: string): boolean {
  const ignoredDomains = ["example.com", "domain.com", "schema.org", "sentry.io", "w3.org", "png", "jpg"];
  return (
    ignoredDomains.some((d) => email.includes(d)) ||
    email.endsWith(".png") ||
    email.endsWith(".jpg")
  );
}

function extractListItemsOrHeadings(content: string): string[] {
  const lines = content.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Keep lines that look like product titles or concise bullet items
    if (
      trimmed.length >= 3 &&
      trimmed.length <= 60 &&
      !trimmed.includes("Copyright") &&
      !trimmed.includes("Privacy") &&
      !trimmed.includes("All rights reserved")
    ) {
      items.push(trimmed);
    }
  }

  return items;
}

function extractAddressLines(content: string): string[] {
  const lines = content.split("\n");
  const addresses: string[] = [];
  const addressKeywords = ["street", "st.", "avenue", "ave.", "road", "rd.", "blvd", "suite", "floor", "drive", "dr.", "po box", "hq", "headquarters"];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (addressKeywords.some((kw) => lower.includes(kw)) && line.trim().length < 120) {
      addresses.push(line.trim());
    }
  }

  return addresses;
}

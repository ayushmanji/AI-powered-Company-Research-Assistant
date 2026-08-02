export function extractPageTitle(html: string, fallbackUrl: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match && match[1]) {
    const rawTitle = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (rawTitle) {
      return decodeHtmlEntities(rawTitle);
    }
  }
  try {
    const parsed = new URL(fallbackUrl);
    return parsed.pathname === "/" || !parsed.pathname ? parsed.hostname : parsed.pathname;
  } catch {
    return fallbackUrl;
  }
}

export function extractCleanText(html: string): string {
  let cleaned = html;

  // Remove scripts, styles, header, footer, nav, forms, svg, iframe, noscript
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  cleaned = cleaned.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ");
  cleaned = cleaned.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ");
  cleaned = cleaned.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ");
  cleaned = cleaned.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, " ");
  cleaned = cleaned.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, " ");
  cleaned = cleaned.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, " ");
  cleaned = cleaned.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  // Convert block tags and breaks to newlines
  cleaned = cleaned.replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|section|article)>/gi, "\n");
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");

  // Strip all HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Decode entities
  cleaned = decodeHtmlEntities(cleaned);

  // Normalize whitespace: trim lines and remove empty duplicate lines
  const lines = cleaned
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);

  return lines.join("\n");
}

export function extractInternalLinks(html: string, baseUrl: string, rootHostname: string): string[] {
  const links: string[] = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = hrefRegex.exec(html)) !== null) {
    const rawHref = match[1].trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      continue;
    }

    try {
      const resolved = new URL(rawHref, baseUrl);
      
      // Ensure matching HTTP(S) protocol and exact same root domain
      if ((resolved.protocol === "http:" || resolved.protocol === "https:") && isSameDomain(resolved.hostname, rootHostname)) {
        // Strip fragment (#)
        resolved.hash = "";
        const cleanLink = resolved.href;
        if (!links.includes(cleanLink)) {
          links.push(cleanLink);
        }
      }
    } catch {
      // Ignore invalid URL structures
    }
  }

  return links;
}

function isSameDomain(hostname: string, rootHostname: string): boolean {
  const cleanHost = hostname.replace(/^www\./i, "").toLowerCase();
  const cleanRoot = rootHostname.replace(/^www\./i, "").toLowerCase();
  return cleanHost === cleanRoot || cleanHost.endsWith(`.${cleanRoot}`);
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
}

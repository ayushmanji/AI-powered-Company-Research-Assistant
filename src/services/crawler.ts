import { CrawledPage } from "@/types";
import { extractCleanText, extractPageTitle, extractInternalLinks } from "./htmlParser";

const PRIORITY_KEYWORDS = [
  "about",
  "products",
  "product",
  "services",
  "service",
  "solutions",
  "contact",
  "pricing",
];

const IGNORE_KEYWORDS = [
  "login",
  "sign-in",
  "signin",
  "signup",
  "register",
  "privacy",
  "cookies",
  "terms",
  "careers",
  "jobs",
  "blog",
  "press",
];

const IGNORE_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".css", ".js", ".pdf",
  ".zip", ".xml", ".json", ".ico", ".woff", ".woff2", ".ttf", ".mp4", ".mp3"
];

function shouldIgnoreUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname.toLowerCase();

    if (IGNORE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
      return true;
    }

    const pathParts = pathname.split("/").filter(Boolean);
    for (const part of pathParts) {
      if (IGNORE_KEYWORDS.some((kw) => part.includes(kw))) {
        return true;
      }
    }
  } catch {
    return true;
  }
  return false;
}

function isPriorityUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname.toLowerCase();
    if (pathname === "/" || !pathname) {
      return true;
    }
    return PRIORITY_KEYWORDS.some((kw) => pathname.includes(kw));
  } catch {
    return false;
  }
}

async function fetchPageWithTimeout(urlStr: string, timeoutMs: number = 6000): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(urlStr, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Unable to crawl this website (HTTP ${response.status}): ${urlStr}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return null;
    }

    return await response.text();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`Unable to crawl this website (Network/SSL Error): ${urlStr}`, err);
    return null;
  }
}

export async function crawlWebsite(startUrl: string, maxPages: number = 10, maxDepth: number = 2): Promise<CrawledPage[]> {
  let rootUrl = startUrl.trim();
  if (!/^https?:\/\//i.test(rootUrl)) {
    rootUrl = `https://${rootUrl}`;
  }

  let rootHostname = "";
  try {
    rootHostname = new URL(rootUrl).hostname;
  } catch {
    throw new Error("Invalid website URL provided for crawling");
  }

  const visited = new Set<string>();
  const results: CrawledPage[] = [];

  interface QueueItem {
    url: string;
    depth: number;
  }

  let queue: QueueItem[] = [{ url: rootUrl, depth: 0 }];

  while (queue.length > 0 && results.length < maxPages) {
    queue.sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      const aPriority = isPriorityUrl(a.url) ? 0 : 1;
      const bPriority = isPriorityUrl(b.url) ? 0 : 1;
      return aPriority - bPriority;
    });

    const current = queue.shift();
    if (!current) break;

    const normalizedUrl = current.url.replace(/\/$/, "");
    if (visited.has(normalizedUrl) || shouldIgnoreUrl(current.url)) {
      continue;
    }

    visited.add(normalizedUrl);

    const html = await fetchPageWithTimeout(current.url);
    if (!html) {
      continue;
    }

    const title = extractPageTitle(html, current.url);
    const content = extractCleanText(html);

    if (content.length > 30) {
      results.push({
        url: current.url,
        title,
        content,
      });
    }

    if (current.depth < maxDepth && results.length < maxPages) {
      const discoveredLinks = extractInternalLinks(html, current.url, rootHostname);
      for (const link of discoveredLinks) {
        const linkNorm = link.replace(/\/$/, "");
        if (!visited.has(linkNorm) && !shouldIgnoreUrl(link)) {
          queue.push({ url: link, depth: current.depth + 1 });
        }
      }
    }
  }

  return results;
}

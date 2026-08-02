import { ResolveCompanyResponse } from "@/types";

function cleanUrl(input: string): string {
  let urlStr = input.trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`;
  }
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return urlStr;
  }
}

function extractNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hostParts = parsed.hostname.replace(/^www\./i, "").split(".");
    if (hostParts.length > 0 && hostParts[0]) {
      const name = hostParts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  } catch {
  }
  return "Company";
}

function isDirectUrl(query: string): boolean {
  const trimmed = query.trim();
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;
  return urlPattern.test(trimmed);
}

export async function resolveCompanyWebsite(query: string): Promise<ResolveCompanyResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery || trimmedQuery.length < 2 || !/[a-zA-Z]/.test(trimmedQuery)) {
    throw new Error("Company not found.");
  }

  if (/^https?:\/\/?$/i.test(trimmedQuery) || /^htp:\/\//i.test(trimmedQuery)) {
    throw new Error("Company not found.");
  }

  if (isDirectUrl(trimmedQuery)) {
    const website = cleanUrl(trimmedQuery);
    const companyName = extractNameFromUrl(website);
    return {
      companyName,
      website,
    };
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("Serper API key is not configured");
  }

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: `${trimmedQuery} official website`,
      num: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API search failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.organic && data.organic.length > 0) {
    const topResult = data.organic[0];
    const link = topResult.link;
    const website = cleanUrl(link);
    
    let companyName = trimmedQuery;
    if (topResult.title) {
      companyName = topResult.title
        .split(/[:|-]/)[0]
        .replace(/official/i, "")
        .replace(/website/i, "")
        .replace(/site/i, "")
        .replace(/home/i, "")
        .trim() || trimmedQuery;
    }

    return {
      companyName,
      website,
    };
  }

  throw new Error("Company not found.");
}

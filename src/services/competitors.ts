import { VerifiedCompetitor, AiCompetitor } from "@/types";

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

function extractCountry(text: string): string {
  const countries = [
    "United States", "US", "USA", "United Kingdom", "UK", "Canada", "Germany",
    "France", "Netherlands", "Sweden", "Switzerland", "Japan", "Singapore",
    "Australia", "India", "Ireland", "Israel", "China", "Brazil", "Spain", "Italy"
  ];
  for (const country of countries) {
    if (new RegExp(`\\b${country}\\b`, "i").test(text)) {
      return country === "US" || country === "USA" ? "United States" : country === "UK" ? "United Kingdom" : country;
    }
  }
  return "Global";
}

function extractIndustry(text: string, defaultName: string): string {
  const industries = [
    "Financial Technology", "Fintech", "Software", "Cloud Computing", "E-Commerce",
    "Artificial Intelligence", "Cybersecurity", "HealthTech", "Biotechnology",
    "Enterprise Software", "SaaS", "Payments", "Data Analytics", "Marketing Tech"
  ];
  for (const ind of industries) {
    if (new RegExp(`\\b${ind}\\b`, "i").test(text)) {
      return ind;
    }
  }
  return `${defaultName} Sector`;
}

export async function verifyCompetitor(
  comp: AiCompetitor,
  apiKey: string
): Promise<VerifiedCompetitor | null> {
  const trimmed = comp.name.trim();
  if (!trimmed) return null;

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: `${trimmed} company official website`,
        num: 3,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const organic = data.organic?.[0];
    if (!organic || !organic.link) return null;

    const website = cleanUrl(organic.link);

    let officialName = data.knowledgeGraph?.title || organic.title || trimmed;
    officialName = officialName.split(/[:|-]/)[0].trim() || trimmed;

    return {
      name: officialName,
      website,
      category: comp.category || "Competitor",
      whyCompetitor: comp.whyCompetitor || "N/A",
    };
  } catch {
    return null;
  }
}

export async function verifyCompetitorsList(
  competitorSuggestions: AiCompetitor[]
): Promise<VerifiedCompetitor[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY environment variable is not configured");
  }

  const uniqueComps = Array.from(new Map(competitorSuggestions.map(comp => [comp.name.trim(), comp])).values()).slice(0, 5);
  const promises = uniqueComps.map((comp) => verifyCompetitor(comp, apiKey));
  const results = await Promise.all(promises);

  const verified: VerifiedCompetitor[] = [];
  const seenWebsites = new Set<string>();

  for (const comp of results) {
    if (comp && comp.website && !seenWebsites.has(comp.website)) {
      seenWebsites.add(comp.website);
      verified.push(comp);
    }
  }

  return verified;
}

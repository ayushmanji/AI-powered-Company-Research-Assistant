import { VerifiedCompetitor } from "@/types";

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
  compName: string,
  apiKey: string
): Promise<VerifiedCompetitor | null> {
  const trimmed = compName.trim();
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

    // Name extraction from Knowledge Graph or Title
    let officialName = data.knowledgeGraph?.title || organic.title || trimmed;
    officialName = officialName.split(/[:|-]/)[0].trim() || trimmed;

    // Snippet + Knowledge Graph description text
    const contextText = `${data.knowledgeGraph?.description || ""} ${data.knowledgeGraph?.attributes?.Headquarters || ""} ${organic.snippet || ""}`;

    const country = data.knowledgeGraph?.attributes?.Headquarters
      ? extractCountry(data.knowledgeGraph.attributes.Headquarters)
      : extractCountry(contextText);

    const industry = data.knowledgeGraph?.type
      ? data.knowledgeGraph.type
      : extractIndustry(contextText, officialName);

    return {
      name: officialName,
      website,
      industry,
      country,
    };
  } catch {
    return null;
  }
}

export async function verifyCompetitorsList(
  competitorNames: string[]
): Promise<VerifiedCompetitor[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY environment variable is not configured");
  }

  const uniqueNames = Array.from(new Set(competitorNames.map((n) => n.trim()))).slice(0, 5);
  const promises = uniqueNames.map((name) => verifyCompetitor(name, apiKey));
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

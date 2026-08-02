import { resolveCompanyWebsite } from "./serper";
import { crawlWebsite } from "./crawler";
import { extractStructuredCompanyData } from "./entityExtractor";
import { analyzeCompanyData } from "./llm";
import { verifyCompetitorsList } from "./competitors";
import { UnifiedResearchResponse, VerifiedCompetitor, CrawledPage } from "@/types";

export async function runResearchPipeline(query: string): Promise<UnifiedResearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Query cannot be empty");
  }

  // 1. Resolve company & website
  const company = await resolveCompanyWebsite(trimmed);

  // 2. Crawl website (with fallback if crawling fails)
  let pages: CrawledPage[] = [];
  try {
    pages = await crawlWebsite(company.website, 10, 2);
  } catch (crawlErr) {
    console.error("Crawling failed, proceeding with base company info:", crawlErr);
    pages = [];
  }

  // 3. Extract structured data
  const structuredData = extractStructuredCompanyData(
    company.companyName,
    company.website,
    pages
  );

  // 4. Analyze with OpenRouter (gracefully handles missing key or LLM error)
  const analysis = await analyzeCompanyData(structuredData);

  // 5. Verify competitors (if suggestions exist)
  let competitors: VerifiedCompetitor[] = [];
  if (analysis.competitorSuggestions && analysis.competitorSuggestions.length > 0) {
    try {
      competitors = await verifyCompetitorsList(analysis.competitorSuggestions);
    } catch {
      competitors = [];
    }
  }

  const sources = Array.from(
    new Set([
      company.website,
      ...pages.map((p) => p.url),
      ...structuredData.importantPages,
    ])
  ).slice(0, 8);

  return {
    company,
    analysis,
    competitors,
    sources,
    metrics: {
      pagesCrawled: pages.length || 1,
      productsFound: (analysis.products && analysis.products.length) || structuredData.products.length,
      servicesFound: (analysis.services && analysis.services.length) || structuredData.services.length,
      competitorsFound: competitors.length,
    },
  };
}

import { resolveCompanyWebsite } from "./serper";
import { crawlWebsite } from "./crawler";
import { extractStructuredCompanyData } from "./dataExtractor";
import { analyzeCompanyData } from "./llm";
import { verifyCompetitorsList } from "./competitors";
import { UnifiedResearchResponse, VerifiedCompetitor } from "@/types";

export async function runResearchPipeline(query: string): Promise<UnifiedResearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Query cannot be empty");
  }

  // 1. Resolve company & website
  const company = await resolveCompanyWebsite(trimmed);

  // 2. Crawl website
  const pages = await crawlWebsite(company.website, 10, 2);

  // 3. Extract structured data
  const structuredData = extractStructuredCompanyData(
    company.companyName,
    company.website,
    pages
  );

  // 4. Analyze with OpenRouter
  const analysis = await analyzeCompanyData(structuredData);

  // 5. Verify competitors
  let competitors: VerifiedCompetitor[] = [];
  if (analysis.competitorSuggestions && analysis.competitorSuggestions.length > 0) {
    try {
      competitors = await verifyCompetitorsList(analysis.competitorSuggestions);
    } catch {
      competitors = [];
    }
  }

  return {
    company,
    analysis,
    competitors,
  };
}

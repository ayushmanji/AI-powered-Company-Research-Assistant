import { resolveCompanyWebsite } from "./serper";
import { crawlWebsite } from "./crawler";
import { extractStructuredCompanyData } from "./dataExtractor";
import { analyzeCompanyData } from "./llm";
import { verifyCompetitorsList } from "./competitors";
import { FinalResearchReport, VerifiedCompetitor } from "@/types";

export async function runResearchPipeline(query: string): Promise<FinalResearchReport> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Query cannot be empty");
  }

  // Step 1: Resolve Company & Website via Serper
  const company = await resolveCompanyWebsite(trimmed);

  // Step 2: Crawl Company Website
  const pages = await crawlWebsite(company.website, 10, 2);

  // Step 3: Extract Structured Data from Pages
  const structuredData = extractStructuredCompanyData(
    company.companyName,
    company.website,
    pages
  );

  // Step 4: AI Analysis via OpenRouter
  const analysis = await analyzeCompanyData(structuredData);

  // Step 5: Verify Competitors via Serper
  let competitors: VerifiedCompetitor[] = [];
  if (analysis.competitorSuggestions && analysis.competitorSuggestions.length > 0) {
    try {
      competitors = await verifyCompetitorsList(analysis.competitorSuggestions);
    } catch {
      // Graceful fallback if competitor verification fails
      competitors = [];
    }
  }

  return {
    company,
    structuredData,
    analysis,
    competitors,
    generatedAt: new Date().toISOString(),
  };
}

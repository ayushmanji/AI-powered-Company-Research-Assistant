"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import {
  ResolveCompanyResponse,
  CrawledPage,
  StructuredCompanyData,
  AiResearchAnalysis,
  VerifiedCompetitor,
} from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveCompanyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pipeline states
  const [crawling, setCrawling] = useState(false);
  const [crawlingText, setCrawlingText] = useState("Processing Pipeline...");
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Data states
  const [crawledPages, setCrawledPages] = useState<CrawledPage[] | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredCompanyData | null>(null);
  const [analysis, setAnalysis] = useState<AiResearchAnalysis | null>(null);
  const [verifiedCompetitors, setVerifiedCompetitors] = useState<VerifiedCompetitor[] | null>(null);

  const handleResolve = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a company name or website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCrawledPages(null);
    setStructuredData(null);
    setAnalysis(null);
    setVerifiedCompetitors(null);
    setPipelineError(null);

    try {
      const response = await fetch("/api/company/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve company website.");
      }

      setResult(data as ResolveCompanyResponse);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullPipeline = async () => {
    if (!result?.website) return;

    setCrawling(true);
    setPipelineError(null);
    setCrawledPages(null);
    setStructuredData(null);
    setAnalysis(null);
    setVerifiedCompetitors(null);

    try {
      // Step 1: Crawl Website
      setCrawlingText("Crawling website pages...");
      const crawlRes = await fetch("/api/company/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: result.website }),
      });
      const crawlData = await crawlRes.json();
      if (!crawlRes.ok) throw new Error(crawlData.error || "Failed to crawl website.");
      const pages = crawlData.pages as CrawledPage[];
      setCrawledPages(pages);

      // Step 2: Extract Structured Data
      setCrawlingText("Structuring company data...");
      const extractRes = await fetch("/api/company/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: result.companyName,
          website: result.website,
          pages,
        }),
      });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || "Failed to extract structured data.");
      const sData = extractData.structuredData as StructuredCompanyData;
      setStructuredData(sData);

      // Step 3: AI Analysis
      setCrawlingText("Synthesizing AI Research Analysis...");
      const analyzeRes = await fetch("/api/company/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: sData }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Failed to generate AI analysis.");
      const aiAnalysis = analyzeData.analysis as AiResearchAnalysis;
      setAnalysis(aiAnalysis);

      // Step 4: Automatically Verify Competitors via Serper
      if (aiAnalysis.competitorSuggestions && aiAnalysis.competitorSuggestions.length > 0) {
        setCrawlingText("Verifying competitors via Serper...");
        const compRes = await fetch("/api/company/competitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competitorSuggestions: aiAnalysis.competitorSuggestions }),
        });
        const compData = await compRes.json();
        if (compRes.ok && compData.competitors) {
          setVerifiedCompetitors(compData.competitors as VerifiedCompetitor[]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred in the pipeline.";
      setPipelineError(msg);
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-base text-gray-600">{APP_DESCRIPTION}</p>

        <form onSubmit={handleResolve} className="mt-8 flex gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or URL..."
            disabled={loading || crawling}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || crawling || !query.trim()}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Resolving..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 max-w-md mx-auto text-left">
            <p className="font-medium">Resolution Error</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-md mx-auto space-y-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Resolved Company Details
            </h2>
            <div>
              <p className="text-sm font-medium text-gray-500">Company Name</p>
              <p className="text-lg font-bold text-gray-900">{result.companyName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Official Website</p>
              <a
                href={result.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-blue-600 hover:underline break-all"
              >
                {result.website}
              </a>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleRunFullPipeline}
                disabled={crawling}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
              >
                {crawling ? "Running Pipeline..." : "Run Research Pipeline"}
              </button>
            </div>
          </div>
        )}

        {crawling && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 border border-blue-200 text-sm text-blue-700 max-w-xl mx-auto text-center">
            <p className="font-medium">{crawlingText}</p>
          </div>
        )}

        {pipelineError && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 max-w-xl mx-auto text-left">
            <p className="font-medium">Pipeline Error</p>
            <p className="mt-1 text-red-600">{pipelineError}</p>
          </div>
        )}

        {/* AI Research Analysis Output */}
        {analysis && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-xl mx-auto space-y-6 shadow-sm">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">AI Company Research Report</h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                AI Synthesized
              </span>
            </div>

            {analysis.summary && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Executive Summary
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              {analysis.industry && (
                <div>
                  <p className="font-semibold text-gray-500">Industry</p>
                  <p className="text-sm font-medium text-gray-900">{analysis.industry}</p>
                </div>
              )}
              {analysis.targetAudience && (
                <div>
                  <p className="font-semibold text-gray-500">Target Audience</p>
                  <p className="text-sm font-medium text-gray-900">{analysis.targetAudience}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {analysis.products.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Products</p>
                  <ul className="list-disc list-inside text-gray-800 space-y-0.5">
                    {analysis.products.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.services.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Services</p>
                  <ul className="list-disc list-inside text-gray-800 space-y-0.5">
                    {analysis.services.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SWOT Matrix */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                SWOT Matrix
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded">
                  <p className="font-bold text-emerald-800 mb-1">Strengths</p>
                  <ul className="list-disc list-inside text-emerald-950 space-y-0.5">
                    {analysis.strengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3 rounded">
                  <p className="font-bold text-amber-800 mb-1">Weaknesses</p>
                  <ul className="list-disc list-inside text-amber-950 space-y-0.5">
                    {analysis.weaknesses.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded">
                  <p className="font-bold text-blue-800 mb-1">Opportunities</p>
                  <ul className="list-disc list-inside text-blue-950 space-y-0.5">
                    {analysis.opportunities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-3 rounded">
                  <p className="font-bold text-rose-800 mb-1">Threats</p>
                  <ul className="list-disc list-inside text-rose-950 space-y-0.5">
                    {analysis.threats.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Verified Competitors Section replacing raw suggestions */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Verified Competitors & Market Landscape
                </h4>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                  Serper Verified
                </span>
              </div>

              {verifiedCompetitors && verifiedCompetitors.length > 0 ? (
                <div className="space-y-2">
                  {verifiedCompetitors.map((comp, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{comp.name}</p>
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline break-all"
                        >
                          {comp.website}
                        </a>
                      </div>
                      <div className="text-right space-x-1">
                        <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-[10px] font-medium">
                          {comp.industry}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-medium">
                          {comp.country}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Verifying competitors list...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

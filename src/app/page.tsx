"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { ResolveCompanyResponse, CrawledPage, StructuredCompanyData } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveCompanyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Crawl state
  const [crawling, setCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[] | null>(null);

  // Structured Data state
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<StructuredCompanyData | null>(null);

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
    setCrawlError(null);
    setStructuredData(null);
    setExtractError(null);

    try {
      const response = await fetch("/api/company/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleCrawl = async () => {
    if (!result?.website) return;

    setCrawling(true);
    setCrawlError(null);
    setCrawledPages(null);
    setStructuredData(null);
    setExtractError(null);

    try {
      const response = await fetch("/api/company/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ website: result.website }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to crawl website.");
      }

      const pages = data.pages as CrawledPage[];
      setCrawledPages(pages);

      // Automatically trigger structured data extraction
      await handleExtractData(pages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while crawling.";
      setCrawlError(msg);
    } finally {
      setCrawling(false);
    }
  };

  const handleExtractData = async (pages: CrawledPage[]) => {
    setExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch("/api/company/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: result?.companyName || "",
          website: result?.website || "",
          pages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract structured data.");
      }

      setStructuredData(data.structuredData as StructuredCompanyData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during extraction.";
      setExtractError(msg);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-base text-gray-600">
          {APP_DESCRIPTION}
        </p>

        <form onSubmit={handleResolve} className="mt-8 flex gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or URL..."
            disabled={loading || crawling || extracting}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || crawling || extracting || !query.trim()}
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
                onClick={handleCrawl}
                disabled={crawling || extracting}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
              >
                {crawling ? "Crawling & Extracting..." : "Crawl & Extract Data"}
              </button>
            </div>
          </div>
        )}

        {(crawling || extracting) && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 border border-blue-200 text-sm text-blue-700 max-w-xl mx-auto text-center">
            <p className="font-medium">
              {crawling ? "Crawling website pages..." : "Processing & structuring company data..."}
            </p>
          </div>
        )}

        {(crawlError || extractError) && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 max-w-xl mx-auto text-left">
            <p className="font-medium">Processing Error</p>
            <p className="mt-1 text-red-600">{crawlError || extractError}</p>
          </div>
        )}

        {structuredData && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-xl mx-auto space-y-5 shadow-sm">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">
                Structured Company Profile
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                Normalized Data
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium">{structuredData.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-500">Emails ({structuredData.emails.length})</p>
                {structuredData.emails.length > 0 ? (
                  <ul className="text-gray-900 space-y-0.5">
                    {structuredData.emails.map((email, idx) => (
                      <li key={idx} className="truncate">{email}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">None found</p>
                )}
              </div>
            </div>

            {structuredData.addresses.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold text-gray-500">Addresses</p>
                <ul className="text-gray-900 space-y-1 mt-0.5">
                  {structuredData.addresses.map((addr, idx) => (
                    <li key={idx} className="bg-gray-50 p-1.5 rounded border border-gray-100">{addr}</li>
                  ))}
                </ul>
              </div>
            )}

            {structuredData.products.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold text-gray-500">Key Products</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {structuredData.products.map((item, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {structuredData.services.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold text-gray-500">Services & Solutions</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {structuredData.services.map((item, idx) => (
                    <span key={idx} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {structuredData.socialLinks.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold text-gray-500">Social Profiles</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {structuredData.socialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline bg-gray-50 px-2 py-0.5 rounded border border-gray-200"
                    >
                      {new URL(link).hostname.replace("www.", "")}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {structuredData.importantPages.length > 0 && (
              <div className="text-xs pt-2 border-t border-gray-100">
                <p className="font-semibold text-gray-500 mb-1">
                  Important Pages Discovered ({structuredData.importantPages.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {structuredData.importantPages.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block truncate text-[11px]"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {crawledPages && !structuredData && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Raw Crawled Pages ({crawledPages.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {crawledPages.map((page, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                  <p className="font-semibold text-gray-900">{page.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{page.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

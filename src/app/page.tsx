"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { ResolveCompanyResponse, CrawledPage } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveCompanyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Crawl state
  const [crawling, setCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [crawledPages, setCrawledPages] = useState<CrawledPage[] | null>(null);

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

      setCrawledPages(data.pages as CrawledPage[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while crawling.";
      setCrawlError(msg);
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
        <p className="text-base text-gray-600">
          {APP_DESCRIPTION}
        </p>

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
                onClick={handleCrawl}
                disabled={crawling}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
              >
                {crawling ? "Crawling Website..." : "Crawl Website"}
              </button>
            </div>
          </div>
        )}

        {crawling && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 border border-blue-200 text-sm text-blue-700 max-w-xl mx-auto text-center">
            <p className="font-medium">Crawling in progress...</p>
            <p className="text-xs text-blue-600 mt-1">Discovering priority internal pages & extracting text content.</p>
          </div>
        )}

        {crawlError && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 max-w-xl mx-auto text-left">
            <p className="font-medium">Crawling Error</p>
            <p className="mt-1 text-red-600">{crawlError}</p>
          </div>
        )}

        {crawledPages && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Crawled Pages ({crawledPages.length})
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                Discovery Complete
              </span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {crawledPages.map((page, index) => (
                <div key={index} className="rounded-md border border-gray-100 p-3 bg-gray-50 space-y-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {page.title || "Untitled Page"}
                  </p>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:underline block truncate"
                  >
                    {page.url}
                  </a>
                  <p className="text-xs text-gray-600 line-clamp-3 pt-1">
                    {page.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

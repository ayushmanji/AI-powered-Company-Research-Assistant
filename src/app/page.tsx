"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { UnifiedResearchResponse } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [report, setReport] = useState<UnifiedResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a company name or website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/company/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to execute research pipeline.");
      }

      setReport(data as UnifiedResearchResponse);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during research.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;

    setDownloadingPdf(true);
    try {
      const response = await fetch("/api/company/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF report.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (report.company.companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "-");
      a.download = `${cleanName}-research-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download PDF report.";
      alert(msg);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-base text-gray-600">{APP_DESCRIPTION}</p>

        <form onSubmit={handleSearch} className="mt-8 flex gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or URL (e.g. Microsoft, Stripe)..."
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Researching..." : "Search"}
          </button>
        </form>

        {loading && (
          <div className="mt-6 rounded-md bg-blue-50 p-6 border border-blue-200 text-sm text-blue-700 max-w-xl mx-auto text-center space-y-2">
            <p className="font-semibold text-base">Executing Research Pipeline...</p>
            <p className="text-xs text-blue-600">
              Resolving website • Crawling pages • Extracting data • AI Analysis • Verifying competitors
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 max-w-xl mx-auto text-left">
            <p className="font-medium">Research Error</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}

        {/* Complete Unified Research Output */}
        {report && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-xl mx-auto space-y-6 shadow-sm">
            {/* Header / Company Resolved Details */}
            <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Company Research Report
                </p>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                  {report.company.companyName}
                </h2>
                <a
                  href={report.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {report.company.website}
                </a>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  Pipeline Complete
                </span>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {downloadingPdf ? "Generating PDF..." : "Download PDF Report"}
                </button>
              </div>
            </div>

            {/* Executive Summary */}
            {report.analysis.summary && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Executive Summary
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed">{report.analysis.summary}</p>
              </div>
            )}

            {/* Industry & Target Audience */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {report.analysis.industry && (
                <div>
                  <p className="font-semibold text-gray-500">Industry</p>
                  <p className="text-sm font-medium text-gray-900">{report.analysis.industry}</p>
                </div>
              )}
              {report.analysis.targetAudience && (
                <div>
                  <p className="font-semibold text-gray-500">Target Audience</p>
                  <p className="text-sm font-medium text-gray-900">{report.analysis.targetAudience}</p>
                </div>
              )}
            </div>

            {/* Products & Services */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {report.analysis.products && report.analysis.products.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Products</p>
                  <ul className="list-disc list-inside text-gray-800 space-y-0.5">
                    {report.analysis.products.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.analysis.services && report.analysis.services.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Services</p>
                  <ul className="list-disc list-inside text-gray-800 space-y-0.5">
                    {report.analysis.services.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Customer Pain Points */}
            {report.analysis.painPoints && report.analysis.painPoints.length > 0 && (
              <div className="space-y-1 text-xs">
                <h3 className="font-semibold text-gray-500">Customer Pain Points Solved</h3>
                <ul className="list-disc list-inside text-gray-800 space-y-0.5">
                  {report.analysis.painPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SWOT Matrix */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                SWOT Matrix
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded">
                  <p className="font-bold text-emerald-800 mb-1">Strengths</p>
                  <ul className="list-disc list-inside text-emerald-950 space-y-0.5">
                    {report.analysis.strengths?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3 rounded">
                  <p className="font-bold text-amber-800 mb-1">Weaknesses</p>
                  <ul className="list-disc list-inside text-amber-950 space-y-0.5">
                    {report.analysis.weaknesses?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded">
                  <p className="font-bold text-blue-800 mb-1">Opportunities</p>
                  <ul className="list-disc list-inside text-blue-950 space-y-0.5">
                    {report.analysis.opportunities?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-3 rounded">
                  <p className="font-bold text-rose-800 mb-1">Threats</p>
                  <ul className="list-disc list-inside text-rose-950 space-y-0.5">
                    {report.analysis.threats?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Verified Competitors */}
            {report.competitors && report.competitors.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Verified Competitors & Market Landscape
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                    Serper Verified
                  </span>
                </div>
                <div className="space-y-2">
                  {report.competitors.map((comp, idx) => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

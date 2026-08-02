"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { UnifiedResearchResponse } from "@/types";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { ReportDashboard } from "@/components/ReportDashboard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [report, setReport] = useState<UnifiedResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setError("Input cannot be empty. Please enter a company name or website URL.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }
    if (trimmed.length > 200) {
      setError("Input is too long.");
      return;
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      setError("Company not found. Please enter a valid company name or website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setActiveStepIndex(0);

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      const response = await fetch("/api/company/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok) {
        throw new Error(data.error || "Unable to complete research pipeline. Please verify the company name or API configuration.");
      }

      setActiveStepIndex(7);
      setReport(data as UnifiedResearchResponse);
    } catch (err: unknown) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Network error. Please check your internet connection.";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network error")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(msg);
      }
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
        const data = await response.json();
        throw new Error(data.error || "Failed to generate PDF report.");
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

  const isAiUnavailable = report?.analysis.summary?.includes("temporarily unavailable") || report?.analysis.summary?.includes("not configured") || false;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {APP_NAME}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          {APP_DESCRIPTION}
        </p>

        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or URL (e.g. Microsoft, Stripe)..."
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            {loading ? "Researching..." : "Search"}
          </button>
        </form>
      </div>

      {loading && <ProgressTimeline activeStepIndex={activeStepIndex} />}

      {error && (
        <div className="rounded-md bg-red-50 p-5 border border-red-200 text-sm text-red-800 max-w-xl mx-auto text-left shadow-sm">
          <div>
            <p className="font-bold text-red-900 mb-1">Unable to complete company research.</p>
            {error === "Company not found. Please enter a valid company name or website URL." || error === "Input cannot be empty. Please enter a company name or website URL." || error === "Enter at least 2 characters." || error === "Input is too long." ? (
              <div className="mt-1 text-red-700 space-y-2">
                <p className="font-bold">Company not found.</p>
                <p>Please enter a valid company name or website URL.</p>
              </div>
            ) : (
              <>
                <p className="mt-1 text-red-700 font-medium">{error}</p>
                <div className="mt-3 text-red-700/80 text-xs space-y-1">
                  <p>Possible reasons:</p>
                  <ul className="list-disc list-inside">
                    <li>Invalid company name</li>
                    <li>Website unavailable</li>
                    <li>API temporarily unavailable</li>
                  </ul>
                  <p className="mt-2">Please try another company or URL.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {report && (
        <ReportDashboard
          report={report}
          isAiUnavailable={isAiUnavailable}
          downloadingPdf={downloadingPdf}
          onDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
}

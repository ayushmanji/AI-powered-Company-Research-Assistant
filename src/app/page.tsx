"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { UnifiedResearchResponse } from "@/types";

interface TimelineStep {
  id: string;
  label: string;
  icon: string;
}

const PIPELINE_STEPS: TimelineStep[] = [
  { id: "resolve", label: "Resolving company website...", icon: "🔍" },
  { id: "resolved", label: "Company resolved", icon: "✅" },
  { id: "crawl", label: "Crawling website pages...", icon: "🌐" },
  { id: "extract", label: "Extracting company data...", icon: "📄" },
  { id: "analyze", label: "AI analyzing company intelligence...", icon: "🤖" },
  { id: "competitors", label: "Verifying competitors...", icon: "🏢" },
  { id: "prepare", label: "Preparing final report...", icon: "📑" },
  { id: "complete", label: "Research completed!", icon: "✅" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [report, setReport] = useState<UnifiedResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Discord Form state
  const [discordOpen, setDiscordOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [sendingDiscord, setSendingDiscord] = useState(false);
  const [discordSuccess, setDiscordSuccess] = useState<string | null>(null);
  const [discordError, setDiscordError] = useState<string | null>(null);

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
    setActiveStepIndex(0);
    setDiscordSuccess(null);
    setDiscordError(null);

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

  const handleSendDiscord = async (e: FormEvent) => {
    e.preventDefault();
    if (!report) return;
    if (!channelId.trim()) {
      setDiscordError("Please enter a valid Discord Channel ID.");
      return;
    }

    setSendingDiscord(true);
    setDiscordSuccess(null);
    setDiscordError(null);

    try {
      const response = await fetch("/api/company/send-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: botToken.trim() || undefined,
          channelId: channelId.trim(),
          applicantName: applicantName.trim(),
          applicantEmail: applicantEmail.trim(),
          report,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send report to Discord.");
      }

      setDiscordSuccess("Research report & PDF successfully posted to Discord channel!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit to Discord.";
      setDiscordError(msg);
    } finally {
      setSendingDiscord(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          {APP_DESCRIPTION}
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or URL (e.g. Microsoft, Stripe)..."
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            {loading ? "Researching..." : "Search"}
          </button>
        </form>

        {/* Live ChatGPT-Style Research Progress Timeline */}
        {loading && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-md mx-auto space-y-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
              Live Research Progress Timeline
            </h3>
            <div className="space-y-2.5 pt-1">
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 text-xs transition-opacity ${
                      isDone
                        ? "text-gray-900 font-medium"
                        : isCurrent
                        ? "text-blue-600 font-semibold"
                        : "text-gray-400 opacity-60"
                    }`}
                  >
                    <span className="text-base leading-none">
                      {isDone ? "✅" : isCurrent ? "⏳" : step.icon}
                    </span>
                    <span className="flex-1">{step.label}</span>
                    {isCurrent && (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 max-w-xl mx-auto text-left">
            <p className="font-semibold">Research Error</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}

        {/* Complete Unified Research Output */}
        {report && (
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-2xl mx-auto space-y-6 shadow-sm">
            {/* Header / Company Resolved Details */}
            <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
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
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 self-start sm:self-auto">
                  Pipeline Complete
                </span>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="w-full sm:w-auto rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded border border-gray-200 text-xs gap-2">
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
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
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

            {/* Collapsible Discord Integration Section */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDiscordOpen(!discordOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 p-3 rounded border border-gray-200 transition-colors"
              >
                <span>Discord Integration</span>
                <span>{discordOpen ? "▲" : "▼"}</span>
              </button>

              {discordOpen && (
                <form onSubmit={handleSendDiscord} className="mt-3 p-4 bg-gray-50 rounded border border-gray-200 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Applicant Name</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Applicant Email</label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Discord Bot Token (Optional if set in .env)</label>
                    <input
                      type="password"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      placeholder="Enter bot token..."
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Discord Channel ID *</label>
                    <input
                      type="text"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      placeholder="e.g. 123456789012345678"
                      required
                      className="w-full rounded border border-gray-300 px-3 py-1.5 text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {discordSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-medium">
                      {discordSuccess}
                    </div>
                  )}

                  {discordError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                      {discordError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sendingDiscord || !channelId.trim()}
                    className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingDiscord ? "Sending to Discord..." : "Send to Discord"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { UnifiedResearchResponse } from "@/types";
import { DiscordIntegration } from "./DiscordIntegration";

interface ReportDashboardProps {
  report: UnifiedResearchResponse;
  isAiUnavailable: boolean;
  downloadingPdf: boolean;
  onDownloadPdf: () => void;
}

export function ReportDashboard({
  report,
  isAiUnavailable,
  downloadingPdf,
  onDownloadPdf,
}: ReportDashboardProps) {
  return (
    <div className="rounded-md bg-white p-6 border border-gray-200 text-left max-w-3xl mx-auto space-y-6 shadow-sm">
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Company Research Report
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Research Complete
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
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

        <div className="w-full sm:w-auto flex justify-end">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={downloadingPdf}
            className="w-full sm:w-auto rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 focus:outline-none disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>{downloadingPdf ? "Generating PDF..." : "Download PDF Report"}</span>
          </button>
        </div>
      </div>

      {report.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400">Pages Crawled</p>
            <p className="text-lg font-bold text-gray-900">{report.metrics.pagesCrawled}</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400">Products Found</p>
            <p className="text-lg font-bold text-gray-900">{report.metrics.productsFound}</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400">Services Found</p>
            <p className="text-lg font-bold text-gray-900">{report.metrics.servicesFound}</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
            <p className="text-[10px] font-bold uppercase text-gray-400">Competitors</p>
            <p className="text-lg font-bold text-gray-900">{report.metrics.competitorsFound}</p>
          </div>
        </div>
      )}

      {isAiUnavailable ? (
        <div className="rounded-md bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <div>
            <p className="font-bold text-amber-950">AI Analysis Notice</p>
            <p className="mt-0.5 text-amber-800">
              AI analysis is temporarily unavailable. Please configure the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">OPENROUTER_API_KEY</code> environment variable to enable automated AI synthesis.
            </p>
          </div>
        </div>
      ) : (
        <>
          {report.analysis.keyMetrics && Object.values(report.analysis.keyMetrics).some(v => v) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
                Quick Facts & Key Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-xs">
                <div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Founded</p>
                  <p className="text-gray-900 font-semibold">{report.analysis.keyMetrics.founded || "N/A"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Headquarters</p>
                  <p className="text-gray-900 font-semibold">{report.analysis.keyMetrics.headquarters || "N/A"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Industry</p>
                  <p className="text-gray-900 font-semibold">{report.analysis.keyMetrics.industry || "N/A"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Business Model</p>
                  <p className="text-gray-900 font-semibold">{report.analysis.keyMetrics.businessModel || "N/A"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Countries</p>
                  <p className="text-gray-900 font-semibold">{report.analysis.keyMetrics.operatingCountries || "N/A"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Website</p>
                  <p className="text-blue-600 font-semibold truncate">{report.analysis.keyMetrics.website || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {report.analysis.summary && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 mb-2">
                Executive Summary
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed">{report.analysis.summary}</p>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Industry</p>
          <p className="text-sm font-semibold text-gray-900">{report.analysis.industry || "Not analyzed"}</p>
        </div>
        <div>
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Target Audience</p>
          <p className="text-sm font-semibold text-gray-900">{report.analysis.targetAudience || "Not analyzed"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1.5">Products</p>
          {report.analysis.products && report.analysis.products.length > 0 ? (
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {report.analysis.products.map((item, idx) => (
                <li key={idx} className="font-medium">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No data available.</p>
          )}
        </div>
        <div>
          <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1.5">Services</p>
          {report.analysis.services && report.analysis.services.length > 0 ? (
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {report.analysis.services.map((item, idx) => (
                <li key={idx} className="font-medium">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No data available.</p>
          )}
        </div>
      </div>

      {report.analysis.painPoints && report.analysis.painPoints.length > 0 && (
        <div className="space-y-1.5 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-gray-500 text-[10px]">Customer Pain Points Solved</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            {report.analysis.painPoints.map((point, idx) => (
              <li key={idx} className="font-medium">{point}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 border-t border-gray-100 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          SWOT Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded">
            <p className="font-bold text-emerald-800 mb-1">Strengths</p>
            {report.analysis.strengths && report.analysis.strengths.length > 0 ? (
              <ul className="list-disc list-inside text-emerald-950 space-y-0.5">
                {report.analysis.strengths.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-700/70 italic text-[11px]">No analysis available</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 p-3.5 rounded">
            <p className="font-bold text-amber-800 mb-1">Weaknesses</p>
            {report.analysis.weaknesses && report.analysis.weaknesses.length > 0 ? (
              <ul className="list-disc list-inside text-amber-950 space-y-0.5">
                {report.analysis.weaknesses.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-700/70 italic text-[11px]">No analysis available</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3.5 rounded">
            <p className="font-bold text-blue-800 mb-1">Opportunities</p>
            {report.analysis.opportunities && report.analysis.opportunities.length > 0 ? (
              <ul className="list-disc list-inside text-blue-950 space-y-0.5">
                {report.analysis.opportunities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-blue-700/70 italic text-[11px]">No analysis available</p>
            )}
          </div>

          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded">
            <p className="font-bold text-rose-800 mb-1">Threats</p>
            {report.analysis.threats && report.analysis.threats.length > 0 ? (
              <ul className="list-disc list-inside text-rose-950 space-y-0.5">
                {report.analysis.threats.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-rose-700/70 italic text-[11px]">No analysis available</p>
            )}
          </div>
        </div>
      </div>

      {report.analysis.businessRisks && report.analysis.businessRisks.length > 0 && (
        <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-gray-500 text-[10px]">Business Risks</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            {report.analysis.businessRisks.map((risk, idx) => (
              <li key={idx} className="font-medium">{risk}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-3 border-t border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Verified Competitors & Market Landscape
          </h3>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
            Serper Verified
          </span>
        </div>
        {report.competitors && report.competitors.length > 0 ? (
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
                  <p className="text-gray-700 mt-1">{comp.whyCompetitor}</p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-200">
                    {comp.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs italic">No data available.</p>
        )}
      </div>

      {report.sources && report.sources.length > 0 && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Sources & Crawled Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
            {report.sources.map((src, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="text-emerald-600 text-xs">✓</span>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 hover:underline truncate"
                >
                  {src.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <DiscordIntegration report={report} />
    </div>
  );
}

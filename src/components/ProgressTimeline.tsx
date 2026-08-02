import React from "react";

interface TimelineStep {
  id: string;
  label: string;
}

const PIPELINE_STEPS: TimelineStep[] = [
  { id: "resolve", label: "Resolving company website..." },
  { id: "resolved", label: "Company resolved" },
  { id: "crawl", label: "Crawling website pages..." },
  { id: "extract", label: "Extracting company data..." },
  { id: "analyze", label: "AI analyzing company intelligence..." },
  { id: "competitors", label: "Verifying competitors..." },
  { id: "prepare", label: "Preparing final report..." },
  { id: "complete", label: "Research completed!" },
];

interface ProgressTimelineProps {
  activeStepIndex: number;
}

export function ProgressTimeline({ activeStepIndex }: ProgressTimelineProps) {
  return (
    <div className="rounded-md bg-white p-5 border border-gray-200 text-left max-w-md mx-auto space-y-3 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
        Live Research Progress Timeline
      </h3>
      <div className="space-y-2 pt-1">
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
              <span className="text-xs font-bold w-4 text-center leading-none">
                {isDone ? "✓" : "•"}
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
  );
}

"use client";

import { useState, FormEvent } from "react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { ResolveCompanyResponse } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveCompanyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a company name or website URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-base text-gray-600">
          {APP_DESCRIPTION}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter company name or URL..."
            disabled={loading}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
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
          <div className="mt-6 rounded-md bg-white p-6 border border-gray-200 text-left max-w-md mx-auto space-y-3 shadow-sm">
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
          </div>
        )}
      </div>
    </div>
  );
}

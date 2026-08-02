import React, { useState, FormEvent } from "react";
import { UnifiedResearchResponse } from "@/types";

interface DiscordIntegrationProps {
  report: UnifiedResearchResponse | null;
}

export function DiscordIntegration({ report }: DiscordIntegrationProps) {
  const [discordOpen, setDiscordOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [sendingDiscord, setSendingDiscord] = useState(false);
  const [discordSuccess, setDiscordSuccess] = useState<string | null>(null);
  const [discordError, setDiscordError] = useState<string | null>(null);

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
  );
}

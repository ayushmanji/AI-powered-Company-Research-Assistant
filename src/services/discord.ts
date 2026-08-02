import { generatePdfReport } from "./pdfGenerator";
import { UnifiedResearchResponse } from "@/types";

export interface SendDiscordParams {
  botToken?: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
  report: UnifiedResearchResponse;
}

export async function sendReportToDiscord(params: SendDiscordParams): Promise<boolean> {
  const { botToken, channelId, applicantName, applicantEmail, report } = params;

  const token = (botToken || process.env.DISCORD_BOT_TOKEN || "").trim();
  if (!token) {
    throw new Error("Discord Bot Token is required");
  }

  const cleanChannelId = channelId.trim();
  if (!cleanChannelId) {
    throw new Error("Discord Channel ID is required");
  }

  if (!report || !report.company) {
    throw new Error("Valid research report is required");
  }

  // Generate PDF buffer using existing PDF generator service
  const pdfBuffer = await generatePdfReport(report);

  const messageText = [
    "📋 **Company Research Report Submission**",
    `👤 **Applicant Name:** ${applicantName || "N/A"}`,
    `✉️ **Applicant Email:** ${applicantEmail || "N/A"}`,
    `🏢 **Company Name:** ${report.company.companyName || "N/A"}`,
    `🌐 **Company Website:** ${report.company.website || "N/A"}`,
  ].join("\n");

  const companyNameClean = (report.company.companyName || "company")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const fileName = `${companyNameClean}-research-report.pdf`;

  // Construct multipart/form-data for Discord API
  const formData = new FormData();
  formData.append(
    "payload_json",
    JSON.stringify({
      content: messageText,
    })
  );

  const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
  formData.append("files[0]", pdfBlob, fileName);

  const discordUrl = `https://discord.com/api/v10/channels/${cleanChannelId}/messages`;

  const res = await fetch(discordUrl, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = "";
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text();
    }

    if (res.status === 401) {
      throw new Error("Invalid Discord Bot Token");
    }
    if (res.status === 404) {
      throw new Error("Invalid Discord Channel ID or channel not found");
    }
    if (res.status === 403) {
      throw new Error("Bot lacks permissions to post messages/attachments in this channel");
    }

    throw new Error(`Discord API error (${res.status}): ${errorDetail}`);
  }

  return true;
}

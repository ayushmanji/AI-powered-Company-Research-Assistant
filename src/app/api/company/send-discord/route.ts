import { NextResponse } from "next/server";
import { sendReportToDiscord } from "@/services/discord";
import { DiscordSendRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: DiscordSendRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { botToken, channelId, applicantName, applicantEmail, report } = body;

    if (!channelId || typeof channelId !== "string" || !channelId.trim()) {
      return NextResponse.json(
        { error: "Discord Channel ID is required" },
        { status: 400 }
      );
    }

    if (!report || !report.company) {
      return NextResponse.json(
        { error: "Valid unified research report object is required" },
        { status: 400 }
      );
    }

    await sendReportToDiscord({
      botToken,
      channelId,
      applicantName,
      applicantEmail,
      report,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during Discord submission";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { verifyCompetitorsList } from "@/services/competitors";
import { VerifyCompetitorsRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: VerifyCompetitorsRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { competitors } = body;
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return NextResponse.json(
        { error: "Competitors array is required" },
        { status: 400 }
      );
    }

    const verifiedCompetitors = await verifyCompetitorsList(competitors);
    return NextResponse.json({ verifiedCompetitors }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during competitor verification";

    if (errorMessage.includes("SERPER_API_KEY environment variable is not configured")) {
      return NextResponse.json(
        { error: "SERPER_API_KEY environment variable is not configured on the server" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 502 }
    );
  }
}

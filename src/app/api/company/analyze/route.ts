import { NextResponse } from "next/server";
import { analyzeCompanyData } from "@/services/llm";
import { AnalyzeCompanyRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: AnalyzeCompanyRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { company } = body;
    if (!company || typeof company !== "object") {
      return NextResponse.json(
        { error: "Structured company object is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompanyData(company);
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during AI analysis";

    if (errorMessage.includes("OPENROUTER_API_KEY environment variable is not configured")) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY environment variable is not configured on the server" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 502 }
    );
  }
}

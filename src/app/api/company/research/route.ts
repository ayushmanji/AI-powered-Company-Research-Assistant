import { NextResponse } from "next/server";
import { runResearchPipeline } from "@/services/researchPipeline";
import { ResearchPipelineRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: ResearchPipelineRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { query } = body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const result = await runResearchPipeline(query);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during research pipeline execution";

    if (errorMessage.includes("Serper API key is not configured")) {
      return NextResponse.json(
        { error: "Serper API key is not configured on the server" },
        { status: 500 }
      );
    }

    if (errorMessage.includes("OPENROUTER_API_KEY environment variable is not configured")) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY environment variable is not configured on the server" },
        { status: 500 }
      );
    }

    if (errorMessage.includes("Company not found") || errorMessage.includes("No organic results") || errorMessage.includes("No official website found")) {
      return NextResponse.json(
        { success: false, error: "Company not found.", message: "Company not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage, message: errorMessage },
      { status: 500 }
    );
  }
}

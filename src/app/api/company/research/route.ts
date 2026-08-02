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

    const report = await runResearchPipeline(query);
    return NextResponse.json({ report }, { status: 200 });
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

    return NextResponse.json(
      { error: errorMessage },
      { status: 502 }
    );
  }
}

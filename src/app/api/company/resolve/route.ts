import { NextResponse } from "next/server";
import { resolveCompanyWebsite } from "@/services/serper";
import { ResolveCompanyRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: ResolveCompanyRequest;
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

    const result = await resolveCompanyWebsite(query);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    if (errorMessage.includes("Serper API key is not configured")) {
      return NextResponse.json(
        { error: "Serper API key is not configured on the server" },
        { status: 500 }
      );
    }

    if (errorMessage.includes("No official website found")) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 502 }
    );
  }
}

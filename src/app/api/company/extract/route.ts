import { NextResponse } from "next/server";
import { extractStructuredCompanyData } from "@/services/dataExtractor";
import { ExtractDataRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: ExtractDataRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { companyName, website, pages } = body;
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: "Crawled pages array is required for extraction" },
        { status: 400 }
      );
    }

    const structuredData = extractStructuredCompanyData(
      companyName || "",
      website || "",
      pages
    );

    return NextResponse.json({ structuredData }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during extraction";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

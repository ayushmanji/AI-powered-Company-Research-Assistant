import { NextResponse } from "next/server";
import { crawlWebsite } from "@/services/crawler";
import { CrawlCompanyRequest } from "@/types";

export async function POST(request: Request) {
  try {
    let body: CrawlCompanyRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { website } = body;
    if (!website || typeof website !== "string" || !website.trim()) {
      return NextResponse.json(
        { error: "Website parameter is required" },
        { status: 400 }
      );
    }

    const pages = await crawlWebsite(website, 10, 2);
    
    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Failed to crawl website or no readable content found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ pages }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during crawling";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

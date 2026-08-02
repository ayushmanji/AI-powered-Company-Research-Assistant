import { NextResponse } from "next/server";
import { generatePdfReport } from "@/services/pdfGenerator";
import { UnifiedResearchResponse } from "@/types";

export async function POST(request: Request) {
  try {
    let body: { report: UnifiedResearchResponse };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { report } = body;
    if (!report || !report.company) {
      return NextResponse.json(
        { error: "Valid unified research report object is required" },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePdfReport(report);

    const companyNameClean = (report.company.companyName || "company")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${companyNameClean}-research-report.pdf"`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during PDF generation";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

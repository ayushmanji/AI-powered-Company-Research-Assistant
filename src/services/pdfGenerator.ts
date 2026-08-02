import PDFDocument from "pdfkit";
import { UnifiedResearchResponse } from "@/types";

export function generatePdfReport(data: UnifiedResearchResponse): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const primaryColor = "#1E293B"; // Dark slate
      const accentColor = "#2563EB";  // Royal blue
      const textColor = "#334155";    // Slate text
      const lightBg = "#F8FAFC";      // Soft background

      const { company, analysis, competitors } = data;
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // --- HEADER / COVER TITLE SECTION ---
      doc.rect(40, 40, 515, 80).fill(lightBg);

      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(company.companyName || "Company Research Report", 55, 52);

      doc
        .fillColor(accentColor)
        .fontSize(11)
        .font("Helvetica")
        .text(`Website: ${company.website || "N/A"}`, 55, 80);

      doc
        .fillColor(textColor)
        .fontSize(9)
        .text(`Generated on: ${dateStr}`, 55, 95);

      let yPos = 140;

      // Helper function to check page overflow
      const checkNewPage = (neededHeight: number = 40) => {
        if (yPos + neededHeight > 750) {
          doc.addPage();
          yPos = 40;
        }
      };

      // Helper function for section headings
      const renderSectionHeader = (title: string) => {
        checkNewPage(40);
        doc
          .fillColor(primaryColor)
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(title, 40, yPos);
        yPos += 20;

        doc
          .strokeColor("#E2E8F0")
          .lineWidth(1)
          .moveTo(40, yPos)
          .lineTo(555, yPos)
          .stroke();
        yPos += 10;
      };

      // --- EXECUTIVE SUMMARY ---
      if (analysis.summary) {
        renderSectionHeader("1. Executive Summary");
        doc
          .fillColor(textColor)
          .fontSize(10)
          .font("Helvetica")
          .text(analysis.summary, 40, yPos, { width: 515, align: "justify", lineGap: 3 });
        yPos += doc.heightOfString(analysis.summary, { width: 515 }) + 20;
      }

      // --- INDUSTRY & TARGET AUDIENCE ---
      if (analysis.industry || analysis.targetAudience) {
        renderSectionHeader("2. Market & Industry Positioning");

        if (analysis.industry) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor).text("Industry Sector: ", 40, yPos, { continued: true });
          doc.font("Helvetica").fillColor(textColor).text(analysis.industry);
          yPos += 16;
        }

        if (analysis.targetAudience) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor).text("Target Audience: ", 40, yPos, { continued: true });
          doc.font("Helvetica").fillColor(textColor).text(analysis.targetAudience);
          yPos += 16;
        }
        yPos += 10;
      }

      // --- PRODUCTS & SERVICES ---
      const hasProducts = analysis.products && analysis.products.length > 0;
      const hasServices = analysis.services && analysis.services.length > 0;
      if (hasProducts || hasServices) {
        renderSectionHeader("3. Products & Services Offerings");

        if (hasProducts) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor).text("Key Products:", 40, yPos);
          yPos += 14;
          analysis.products.forEach((prod) => {
            checkNewPage(20);
            doc.font("Helvetica").fontSize(9.5).fillColor(textColor).text(`• ${prod}`, 55, yPos);
            yPos += 14;
          });
          yPos += 6;
        }

        if (hasServices) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor).text("Services & Solutions:", 40, yPos);
          yPos += 14;
          analysis.services.forEach((serv) => {
            checkNewPage(20);
            doc.font("Helvetica").fontSize(9.5).fillColor(textColor).text(`• ${serv}`, 55, yPos);
            yPos += 14;
          });
          yPos += 6;
        }
        yPos += 10;
      }

      // --- CUSTOMER PAIN POINTS ---
      if (analysis.painPoints && analysis.painPoints.length > 0) {
        renderSectionHeader("4. Customer Pain Points Solved");
        analysis.painPoints.forEach((point) => {
          checkNewPage(20);
          doc.font("Helvetica").fontSize(9.5).fillColor(textColor).text(`• ${point}`, 50, yPos, { width: 505 });
          yPos += doc.heightOfString(`• ${point}`, { width: 505 }) + 4;
        });
        yPos += 10;
      }

      // --- SWOT ANALYSIS ---
      renderSectionHeader("5. SWOT Analysis");
      const swotSections = [
        { label: "Strengths", items: analysis.strengths || [], color: "#065F46" },
        { label: "Weaknesses", items: analysis.weaknesses || [], color: "#92400E" },
        { label: "Opportunities", items: analysis.opportunities || [], color: "#1E40AF" },
        { label: "Threats", items: analysis.threats || [], color: "#991B1B" },
      ];

      swotSections.forEach((sec) => {
        if (sec.items.length > 0) {
          checkNewPage(30);
          doc.font("Helvetica-Bold").fontSize(10).fillColor(sec.color).text(sec.label, 40, yPos);
          yPos += 14;
          sec.items.forEach((item) => {
            checkNewPage(18);
            doc.font("Helvetica").fontSize(9).fillColor(textColor).text(`- ${item}`, 55, yPos, { width: 500 });
            yPos += doc.heightOfString(`- ${item}`, { width: 500 }) + 3;
          });
          yPos += 6;
        }
      });
      yPos += 10;

      // --- VERIFIED COMPETITORS ---
      if (competitors && competitors.length > 0) {
        renderSectionHeader("6. Verified Market Competitors");

        // Table Header
        checkNewPage(50);
        doc.rect(40, yPos, 515, 20).fill("#EDF2F7");
        doc.font("Helvetica-Bold").fontSize(9).fillColor(primaryColor);
        doc.text("Company", 48, yPos + 5, { width: 120 });
        doc.text("Official Website", 170, yPos + 5, { width: 160 });
        doc.text("Industry", 335, yPos + 5, { width: 110 });
        doc.text("Country", 450, yPos + 5, { width: 100 });
        yPos += 22;

        // Table Rows
        competitors.forEach((comp, idx) => {
          checkNewPage(24);
          if (idx % 2 === 1) {
            doc.rect(40, yPos - 2, 515, 20).fill("#F8FAFC");
          }
          doc.font("Helvetica-Bold").fontSize(8.5).fillColor(textColor).text(comp.name || "N/A", 48, yPos, { width: 115, height: 16 });
          doc.font("Helvetica").fontSize(8.5).fillColor(accentColor).text(comp.website || "N/A", 170, yPos, { width: 155, height: 16 });
          doc.font("Helvetica").fontSize(8.5).fillColor(textColor).text(comp.industry || "N/A", 335, yPos, { width: 105, height: 16 });
          doc.font("Helvetica").fontSize(8.5).fillColor(textColor).text(comp.country || "N/A", 450, yPos, { width: 95, height: 16 });
          yPos += 20;
        });
      }

      // --- FOOTER FOR ALL PAGES ---
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc
          .strokeColor("#CBD5E1")
          .lineWidth(0.5)
          .moveTo(40, 800)
          .lineTo(555, 800)
          .stroke();

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#94A3B8")
          .text("Generated by Company Research Assistant", 40, 808, { align: "left" })
          .text(`Page ${i + 1} of ${totalPages}`, 40, 808, { align: "right", width: 515 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

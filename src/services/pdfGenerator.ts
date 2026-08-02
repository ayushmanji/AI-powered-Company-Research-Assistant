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

      const primaryColor = "#1E293B";
      const accentColor = "#2563EB";
      const textColor = "#334155";
      const lightBg = "#F8FAFC";

      const { company, analysis, competitors, sources, metrics } = data;
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.rect(40, 40, 515, 120).fill(lightBg);

      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Company Research Report", 55, 55);

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Company: ${company.companyName || "N/A"}`, 55, 85);

      doc
        .fillColor(accentColor)
        .fontSize(10)
        .font("Helvetica")
        .text(`Website: ${company.website || "N/A"}`, 55, 102);

      const modelName = process.env.OPENROUTER_MODEL || "Moonshot Kimi K2";
      
      doc
        .fillColor(textColor)
        .fontSize(9)
        .text(`Sources Crawled: ${metrics?.pagesCrawled || 0}`, 350, 85)
        .text(`AI Model: ${modelName}`, 350, 100)
        .text(`Generated: ${dateStr}`, 350, 115)
        .text(`Report Version: 1.0`, 350, 130);

      let yPos = 180;

      const checkNewPage = (neededHeight: number = 40) => {
        if (yPos + neededHeight > 730) {
          doc.addPage();
          yPos = 40;
        }
      };

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

      if (analysis.keyMetrics && Object.values(analysis.keyMetrics).some(v => v)) {
        renderSectionHeader("1. Quick Facts & Key Metrics");
        
        const km = analysis.keyMetrics;
        const leftColX = 40;
        const rightColX = 300;
        
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(primaryColor);
        doc.text("Founded:", leftColX, yPos);
        doc.font("Helvetica").fillColor(textColor).text(km.founded || "N/A", leftColX + 80, yPos);
        
        doc.font("Helvetica-Bold").fillColor(primaryColor).text("Headquarters:", rightColX, yPos);
        doc.font("Helvetica").fillColor(textColor).text(km.headquarters || "N/A", rightColX + 80, yPos);
        yPos += 16;
        
        doc.font("Helvetica-Bold").fillColor(primaryColor).text("Industry:", leftColX, yPos);
        doc.font("Helvetica").fillColor(textColor).text(km.industry || "N/A", leftColX + 80, yPos);
        
        doc.font("Helvetica-Bold").fillColor(primaryColor).text("Business Model:", rightColX, yPos);
        doc.font("Helvetica").fillColor(textColor).text(km.businessModel || "N/A", rightColX + 80, yPos);
        yPos += 16;
        
        doc.font("Helvetica-Bold").fillColor(primaryColor).text("Countries:", leftColX, yPos);
        doc.font("Helvetica").fillColor(textColor).text(km.operatingCountries || "N/A", leftColX + 80, yPos, { width: 150 });
        
        doc.font("Helvetica-Bold").fillColor(primaryColor).text("Website:", rightColX, yPos);
        doc.font("Helvetica").fillColor(accentColor).text(km.website || "N/A", rightColX + 80, yPos);
        yPos += 24;
      }

      if (analysis.summary) {
        renderSectionHeader("2. Executive Summary");
        doc
          .fillColor(textColor)
          .fontSize(10)
          .font("Helvetica")
          .text(analysis.summary, 40, yPos, { width: 515, align: "justify", lineGap: 3 });
        yPos += doc.heightOfString(analysis.summary, { width: 515 }) + 20;
      }

      if (analysis.industry || analysis.targetAudience) {
        renderSectionHeader("3. Market & Industry Positioning");

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

      const hasProducts = analysis.products && analysis.products.length > 0;
      const hasServices = analysis.services && analysis.services.length > 0;
      if (hasProducts || hasServices) {
        renderSectionHeader("4. Products & Services Offerings");

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

      if (analysis.painPoints && analysis.painPoints.length > 0) {
        renderSectionHeader("5. Customer Pain Points Solved");
        analysis.painPoints.forEach((point) => {
          checkNewPage(20);
          doc.font("Helvetica").fontSize(9.5).fillColor(textColor).text(`• ${point}`, 50, yPos, { width: 505 });
          yPos += doc.heightOfString(`• ${point}`, { width: 505 }) + 4;
        });
        yPos += 10;
      }

      renderSectionHeader("6. SWOT Analysis");
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
      
      if (analysis.businessRisks && analysis.businessRisks.length > 0) {
        renderSectionHeader("7. Business Risks");
        analysis.businessRisks.forEach((risk) => {
          checkNewPage(20);
          doc.font("Helvetica").fontSize(9.5).fillColor(textColor).text(`• ${risk}`, 50, yPos, { width: 505 });
          yPos += doc.heightOfString(`• ${risk}`, { width: 505 }) + 4;
        });
        yPos += 10;
      }

      if (competitors && competitors.length > 0) {
        renderSectionHeader("8. Verified Market Competitors");

        checkNewPage(50);
        doc.rect(40, yPos, 515, 20).fill("#EDF2F7");
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(primaryColor);
        doc.text("Company", 45, yPos + 5, { width: 100 });
        doc.text("Website", 150, yPos + 5, { width: 130 });
        doc.text("Category", 290, yPos + 5, { width: 90 });
        doc.text("Why Competitor", 390, yPos + 5, { width: 160 });
        yPos += 22;

        competitors.forEach((comp, idx) => {
          checkNewPage(30);
          
          doc.fontSize(8);
          const rowHeight = Math.max(
            doc.heightOfString(comp.name || "N/A", { width: 100 }),
            doc.heightOfString(comp.website || "N/A", { width: 130 }),
            doc.heightOfString(comp.category || "N/A", { width: 90 }),
            doc.heightOfString(comp.whyCompetitor || "N/A", { width: 160 })
          ) + 8;
          
          if (idx % 2 === 1) {
            doc.rect(40, yPos - 2, 515, rowHeight).fill("#F8FAFC");
          }
          doc.font("Helvetica-Bold").fontSize(8).fillColor(textColor).text(comp.name || "N/A", 45, yPos, { width: 100 });
          doc.font("Helvetica").fontSize(8).fillColor(accentColor).text(comp.website || "N/A", 150, yPos, { width: 130 });
          doc.font("Helvetica").fontSize(8).fillColor(textColor).text(comp.category || "N/A", 290, yPos, { width: 90 });
          doc.font("Helvetica").fontSize(8).fillColor(textColor).text(comp.whyCompetitor || "N/A", 390, yPos, { width: 160 });
          yPos += rowHeight;
        });
      }

      if (sources && sources.length > 0) {
        renderSectionHeader("9. Sources Crawled");
        sources.forEach((src) => {
          checkNewPage(15);
          doc.font("Helvetica").fontSize(8.5).fillColor(accentColor).text(`✓ ${src}`, 50, yPos, { width: 505 });
          yPos += 14;
        });
        yPos += 10;
      }
      
      checkNewPage(40);
      doc.rect(40, yPos, 515, 35).fill("#FFFBEB");
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#92400E").text("Disclaimer: ", 50, yPos + 10, { continued: true });
      doc.font("Helvetica").text("This report is AI-generated from publicly available information and should be reviewed before making business decisions.", { width: 495 });
      yPos += 45;

      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc
          .strokeColor("#CBD5E1")
          .lineWidth(0.5)
          .moveTo(40, 780)
          .lineTo(555, 780)
          .stroke();

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#94A3B8")
          .text("Company Research Assistant", 40, 790, { align: "left" })
          .text(`Generated on ${dateStr}`, 0, 790, { align: "center", width: 595 })
          .text(`Page ${i + 1} of ${totalPages}`, 40, 790, { align: "right", width: 515 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

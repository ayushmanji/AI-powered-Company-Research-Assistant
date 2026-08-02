import { StructuredCompanyData, AiResearchAnalysis } from "@/types";

export async function analyzeCompanyData(
  company: StructuredCompanyData
): Promise<AiResearchAnalysis> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      summary: "AI analysis is temporarily unavailable. Please configure the OpenRouter API key and try again.",
      industry: "Not analyzed",
      targetAudience: "Not analyzed",
      products: company.products || [],
      services: company.services || [],
      painPoints: [],
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      competitorSuggestions: [],
    };
  }

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

  const systemPrompt = `You are a corporate intelligence analyst. Analyze the provided structured company data and return a JSON object with EXACTLY the following keys:
{
  "summary": "Executive summary of the company",
  "industry": "Primary industry sector",
  "targetAudience": "Target customers and market segment",
  "products": ["Product 1", "Product 2"],
  "services": ["Service 1", "Service 2"],
  "painPoints": ["Customer pain point 1"],
  "strengths": ["Strength 1"],
  "weaknesses": ["Weakness 1"],
  "opportunities": ["Opportunity 1"],
  "threats": ["Threat 1"],
  "competitorSuggestions": ["Competitor 1", "Competitor 2"]
}

Rules:
1. Return VALID JSON ONLY.
2. Do NOT use markdown formatting, code fences (\`\`\`json), or explanations.
3. If information cannot be inferred, use empty string "" or empty array [].`;

  const userPrompt = `Company Data:
Name: ${company.companyName}
Website: ${company.website}
Phone: ${company.phone}
Emails: ${company.emails.join(", ")}
Products Discovered: ${company.products.join(", ")}
Services Discovered: ${company.services.join(", ")}
Social Links: ${company.socialLinks.join(", ")}
Important Discovered Pages: ${company.importantPages.join(", ")}`;

  try {
    const response = await callOpenRouter(apiKey, model, systemPrompt, userPrompt);
    return parseAndValidateAiResponse(response);
  } catch {
    try {
      const retryPrompt = `${systemPrompt}\nCRITICAL: Your previous response failed JSON parsing. Output ONLY raw JSON without any markdown formatting or prefix text.`;
      const response = await callOpenRouter(apiKey, model, retryPrompt, userPrompt);
      return parseAndValidateAiResponse(response);
    } catch (retryError: unknown) {
      const msg = retryError instanceof Error ? retryError.message : "AI service unavailable";
      console.error("OpenRouter LLM analysis error:", msg);
      return {
        summary: "AI analysis is temporarily unavailable. Please configure the OpenRouter API key and try again.",
        industry: "Not analyzed",
        targetAudience: "Not analyzed",
        products: company.products || [],
        services: company.services || [],
        painPoints: [],
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
        competitorSuggestions: [],
      };
    }
  }
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Company Research Assistant",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error("Empty response received from OpenRouter API");
  }

  return choice;
}

function parseAndValidateAiResponse(rawContent: string): AiResearchAnalysis {
  let cleaned = rawContent.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  }

  const parsed = JSON.parse(cleaned);

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    industry: typeof parsed.industry === "string" ? parsed.industry : "",
    targetAudience: typeof parsed.targetAudience === "string" ? parsed.targetAudience : "",
    products: Array.isArray(parsed.products) ? parsed.products : [],
    services: Array.isArray(parsed.services) ? parsed.services : [],
    painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
    threats: Array.isArray(parsed.threats) ? parsed.threats : [],
    competitorSuggestions: Array.isArray(parsed.competitorSuggestions) ? parsed.competitorSuggestions : [],
  };
}

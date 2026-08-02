import { StructuredCompanyData, AiResearchAnalysis } from "@/types";

export async function analyzeCompanyData(
  company: StructuredCompanyData
): Promise<AiResearchAnalysis> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      isCompanyFound: false,
      summary: "AI analysis is temporarily unavailable. Please configure the OpenRouter API key and try again.",
      industry: "Not analyzed",
      targetAudience: "Not analyzed",
      keyMetrics: { founded: "", headquarters: "", industry: "", businessModel: "", operatingCountries: "", website: "" },
      products: company.products || [],
      services: company.services || [],
      painPoints: [],
      businessRisks: [],
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
  "isCompanyFound": true,
  "summary": "Executive summary of the company",
  "industry": "Primary industry sector",
  "targetAudience": "Target customers and market segment",
  "keyMetrics": {
    "founded": "Year founded",
    "headquarters": "HQ location",
    "industry": "Industry",
    "businessModel": "B2B, B2C, etc.",
    "operatingCountries": "Regions active",
    "website": "URL"
  },
  "products": ["Product 1", "Product 2"],
  "services": ["Service 1", "Service 2"],
  "painPoints": ["Customer pain point 1"],
  "businessRisks": ["Risk 1", "Risk 2"],
  "strengths": ["Strength 1"],
  "weaknesses": ["Weakness 1"],
  "opportunities": ["Opportunity 1"],
  "threats": ["Threat 1"],
  "competitorSuggestions": [
    {
      "name": "Competitor 1",
      "category": "Direct Competitor",
      "whyCompetitor": "Targeting the same market segment"
    }
  ]
}

Rules:
1. If the provided data appears to be random text, unrelated to a real company, or incomplete garbage (e.g. a random Wikipedia page instead of a company), set "isCompanyFound": false and leave the rest empty.
2. Return VALID JSON ONLY.
3. Do NOT use markdown formatting, code fences (\`\`\`json), or explanations.
4. If information cannot be inferred, use empty string "" or empty array [].`;

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
    const parsed = parseAndValidateAiResponse(response);
    if (!parsed.isCompanyFound) {
      throw new Error("Company not found. Please enter a valid company name or website URL.");
    }
    return parsed;
  } catch (err: any) {
    if (err.message.includes("Company not found")) throw err;
    try {
      const retryPrompt = `${systemPrompt}\nCRITICAL: Your previous response failed JSON parsing. Output ONLY raw JSON without any markdown formatting or prefix text.`;
      const response = await callOpenRouter(apiKey, model, retryPrompt, userPrompt);
      const parsed = parseAndValidateAiResponse(response);
      if (!parsed.isCompanyFound) {
        throw new Error("Company not found. Please enter a valid company name or website URL.");
      }
      return parsed;
    } catch (retryError: unknown) {
      console.error("OpenRouter LLM analysis error:", retryError);
      return {
        isCompanyFound: false,
        summary: "Unable to analyze this company. Please try another company.",
        industry: "Not analyzed",
        targetAudience: "Not analyzed",
        keyMetrics: { founded: "", headquarters: "", industry: "", businessModel: "", operatingCountries: "", website: "" },
        products: company.products || [],
        services: company.services || [],
        painPoints: [],
        businessRisks: [],
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
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    if (res.status === 400) throw new Error("Invalid request.");
    if (res.status === 401) throw new Error("Invalid API key.");
    if (res.status === 402) throw new Error("Insufficient credits.");
    if (res.status === 403) throw new Error("Access denied.");
    if (res.status === 404) throw new Error("Company not found / Model not found.");
    if (res.status === 429) throw new Error("Too many requests. Please wait.");
    if (res.status >= 500) throw new Error("Server error. Please try again later.");
    
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
    isCompanyFound: typeof parsed.isCompanyFound === "boolean" ? parsed.isCompanyFound : true,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    industry: typeof parsed.industry === "string" ? parsed.industry : "",
    targetAudience: typeof parsed.targetAudience === "string" ? parsed.targetAudience : "",
    keyMetrics: {
      founded: typeof parsed.keyMetrics?.founded === "string" ? parsed.keyMetrics.founded : "",
      headquarters: typeof parsed.keyMetrics?.headquarters === "string" ? parsed.keyMetrics.headquarters : "",
      industry: typeof parsed.keyMetrics?.industry === "string" ? parsed.keyMetrics.industry : "",
      businessModel: typeof parsed.keyMetrics?.businessModel === "string" ? parsed.keyMetrics.businessModel : "",
      operatingCountries: typeof parsed.keyMetrics?.operatingCountries === "string" ? parsed.keyMetrics.operatingCountries : "",
      website: typeof parsed.keyMetrics?.website === "string" ? parsed.keyMetrics.website : "",
    },
    products: Array.isArray(parsed.products) ? parsed.products : [],
    services: Array.isArray(parsed.services) ? parsed.services : [],
    painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
    businessRisks: Array.isArray(parsed.businessRisks) ? parsed.businessRisks : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
    threats: Array.isArray(parsed.threats) ? parsed.threats : [],
    competitorSuggestions: Array.isArray(parsed.competitorSuggestions) ? parsed.competitorSuggestions : [],
  };
}

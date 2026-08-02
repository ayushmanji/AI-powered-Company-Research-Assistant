export interface HealthStatus {
  status: string;
}

export interface ResolveCompanyRequest {
  query: string;
}

export interface ResolveCompanyResponse {
  companyName: string;
  website: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
}

export interface CrawlCompanyRequest {
  website: string;
}

export interface CrawlCompanyResponse {
  pages: CrawledPage[];
}

export interface StructuredCompanyData {
  companyName: string;
  website: string;
  phone: string;
  emails: string[];
  addresses: string[];
  products: string[];
  services: string[];
  socialLinks: string[];
  importantPages: string[];
}

export interface ExtractDataRequest {
  companyName: string;
  website: string;
  pages: CrawledPage[];
}

export interface ExtractDataResponse {
  structuredData: StructuredCompanyData;
}

export interface AiResearchAnalysis {
  summary: string;
  industry: string;
  targetAudience: string;
  products: string[];
  services: string[];
  painPoints: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitorSuggestions: string[];
}

export interface AnalyzeCompanyRequest {
  company: StructuredCompanyData;
}

export interface AnalyzeCompanyResponse {
  analysis: AiResearchAnalysis;
}

export interface VerifiedCompetitor {
  name: string;
  website: string;
  industry: string;
  country: string;
}

export interface VerifyCompetitorsRequest {
  competitorSuggestions: string[];
}

export interface VerifyCompetitorsResponse {
  competitors: VerifiedCompetitor[];
}

export interface UnifiedResearchResponse {
  company: ResolveCompanyResponse;
  analysis: AiResearchAnalysis;
  competitors: VerifiedCompetitor[];
}

export interface ResearchPipelineRequest {
  query: string;
}

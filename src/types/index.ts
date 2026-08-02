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

export interface AiCompetitor {
  name: string;
  category: string;
  whyCompetitor: string;
}

export interface AiResearchAnalysis {
  isCompanyFound: boolean;
  summary: string;
  industry: string;
  targetAudience: string;
  keyMetrics: {
    founded: string;
    headquarters: string;
    industry: string;
    businessModel: string;
    operatingCountries: string;
    website: string;
  };
  products: string[];
  services: string[];
  painPoints: string[];
  businessRisks: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitorSuggestions: AiCompetitor[];
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
  category: string;
  whyCompetitor: string;
}

export interface VerifyCompetitorsRequest {
  competitorSuggestions: AiCompetitor[];
}

export interface VerifyCompetitorsResponse {
  competitors: VerifiedCompetitor[];
}

export interface UnifiedResearchResponse {
  company: ResolveCompanyResponse;
  analysis: AiResearchAnalysis;
  competitors: VerifiedCompetitor[];
  sources?: string[];
  metrics?: {
    pagesCrawled: number;
    productsFound: number;
    servicesFound: number;
    competitorsFound: number;
  };
}

export interface ResearchPipelineRequest {
  query: string;
}

export interface DiscordSendRequest {
  botToken?: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
  report: UnifiedResearchResponse;
}

export interface DiscordSendResponse {
  success: boolean;
}

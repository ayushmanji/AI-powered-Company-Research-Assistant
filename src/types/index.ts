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

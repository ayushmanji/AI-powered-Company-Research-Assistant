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

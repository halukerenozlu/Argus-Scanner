export interface ScanResult {
  title: string;
  url: string;
  total_links: number;
  suspicious_count: number;
  risk_score: number;
  detected_keywords: string[];
  is_sponsored: boolean;
}

export interface ScanApiError {
  error: string;
  error_code?: string; // absent on 400 validation errors, present on 502/504
  details?: string;
}

export type AnalyzeResponse = ScanResult | ScanApiError;

/** Type guard: narrows AnalyzeResponse to ScanApiError via the 'error' discriminant. */
export function isScanApiError(r: AnalyzeResponse): r is ScanApiError {
  return "error" in r;
}

export interface ScanResult {
  title: string;
  url: string;
  total_links: number;
  risk_score: number;
  detected_keywords: string[];
  is_sponsored: boolean;
}

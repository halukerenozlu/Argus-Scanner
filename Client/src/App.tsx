import { useState } from "react";
import axios from "axios";
import {
  isScanApiError,
  type ScanResult,
  type ScanApiError,
  type AnalyzeResponse,
} from "./types";
import Header from "./components/Header";
import SearchInput from "./components/SearchInput";
import ResultCards from "./components/ResultCards";
import DetailModal from "./components/DetailModal";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000/api";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<ScanApiError | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleScan = async () => {
    const normalized = normalizeUrl(url);
    if (!normalized || loading) return;

    setLoading(true);
    setScanError(null);
    setResult(null);

    try {
      const response = await axios.post<AnalyzeResponse>(
        `${API_BASE_URL}/analyze/`,
        { url: normalized },
        { validateStatus: () => true },
      );

      if (isScanApiError(response.data)) {
        setScanError(response.data);
      } else {
        setResult(response.data);
      }
    } catch (e) {
      console.error(e);
      setScanError({ error: "Sunucuya ulaşılamadı. Backend çalışıyor mu?" });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setScanError(null);
  };

  const canSubmit = !!normalizeUrl(url) && !loading;

  return (
    <div className="page">
      <div className="glow" />

      <div className="main">
        <Header />

        <SearchInput
          url={url}
          loading={loading}
          canSubmit={canSubmit}
          scanError={scanError}
          onUrlChange={handleUrlChange}
          onScan={handleScan}
        />

        {result && (
          <ResultCards result={result} onShowDetail={() => setShowDetail(true)} />
        )}
      </div>

      <DetailModal
        open={showDetail && !!(result || scanError)}
        onClose={() => setShowDetail(false)}
        result={result}
        scanError={scanError}
      />
    </div>
  );
}

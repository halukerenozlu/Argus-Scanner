import { useState, type KeyboardEvent } from "react";
import axios from "axios";
import { Globe, Link as LinkIcon, ShieldAlert } from "lucide-react";
import {
  isScanApiError,
  type ScanResult,
  type ScanApiError,
  type AnalyzeResponse,
} from "./types";
import DetailModal from "./components/DetailModal";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function Spinner() {
  return (
    <svg className="spinner" viewBox="0 0 50 50" fill="none" aria-hidden="true">
      <circle cx="25" cy="25" r="18" className="spinnerTrack" />
      <path d="M43 25c0-9.94-8.06-18-18-18" className="spinnerHead">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
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
      // validateStatus: () => true prevents Axios from throwing on 4xx/5xx so
      // the type guard below handles every status code in one place.
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
      // Only true network failures reach here (no connection, CORS, etc.)
      console.error(e);
      setScanError({ error: "Sunucuya ulaşılamadı. Backend çalışıyor mu?" });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleScan();
  };

  const canSubmit = !!normalizeUrl(url) && !loading;

  return (
    <div className="page">
      <div className="glow" />

      <div className="main">
        {/* Header */}
        <header className="header">
          <img
            className="logo"
            src="/logo.png"
            alt="Argus Logo"
            width={90}
            height={90}
          />
          <h1 className="title font-bungee">ARGUS SCANNER</h1>
          <p className="subtitle ">
            Gizli reklamları ve şüpheli yönlendirmeleri saniyeler içinde tespit
            edin.
          </p>
        </header>

        {/* Input */}
        <section className="inputShell">
          <div className="inputRow">
            <input
              className="urlInput"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setScanError(null);
              }}
              onKeyDown={onKeyDown}
              placeholder="URL gir (ör. example.com)"
            />

            <button
              className="submitButton"
              disabled={!canSubmit}
              onClick={handleScan}
              aria-label="Analiz Et"
              title="Analiz Et"
            >
              {loading ? (
                <Spinner />
              ) : (
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 14V4M9 4L5 8M9 4L13 8"
                    className="arrow"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {scanError && (
            <div className="error">
              {scanError.error}
              {scanError.details && (
                <span className="errorDetail">{scanError.details}</span>
              )}
            </div>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="resultsGrid">
            <div className="card">
              <div className="cardHeader cardHeader--blue">
                <Globe size={20} />
                <div className="cardTitle">Sayfa Bilgisi</div>
              </div>
              <div className="cardValue">{result.title}</div>
              <div className="cardSub">{result.url}</div>
            </div>

            <div className="card">
              <div className="cardHeader cardHeader--green">
                <LinkIcon size={20} />
                <div className="cardTitle">Bağlantı Analizi</div>
              </div>
              <div className="bigNumber">{result.total_links}</div>
              <div className="cardSub">Tespit edilen toplam link</div>
            </div>

            <div
              className={[
                "riskBanner",
                result.is_sponsored ? "riskBanner--danger" : "riskBanner--safe",
              ].join(" ")}
            >
              <ShieldAlert size={22} className="riskIcon" />
              <div className="riskBody">
                <div className="riskTitle">
                  Risk Analizi: %{result.risk_score}
                </div>
                <div className="riskText">
                  {result.is_sponsored
                    ? "Bildirilmemiş sponsorlu içerik / gizli yönlendirme sinyalleri olabilir."
                    : "Belirgin bir gizli reklam sinyali yakalanmadı."}
                </div>
              </div>
              <button className="detailBtn" onClick={() => setShowDetail(true)}>
                Daha fazla detay
              </button>
            </div>
          </section>
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

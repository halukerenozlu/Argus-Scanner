import { X } from "lucide-react";
import type { ScanResult, ScanApiError } from "../types";
import { copyToClipboard } from "../utils/clipboard";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  result: ScanResult | null;
  scanError: ScanApiError | null;
}

export default function DetailModal({
  open,
  onClose,
  result,
  scanError,
}: DetailModalProps) {
  useBodyScrollLock(open);
  useEscapeKey(open, onClose);

  if (!open) return null;

  const isSuccess = !!result;
  const displayUrl = result?.url ?? "";
  const jsonPayload = JSON.stringify(result ?? scanError, null, 2);

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalHeader">
          <h2 className="modalTitle">Detaylı Analiz</h2>
          <button className="modalClose" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        {/* URL + status */}
        <div className="modalUrlRow">
          {displayUrl && <span className="modalUrl">{displayUrl}</span>}
          <span
            className={`modalBadge ${isSuccess ? "modalBadge--ok" : "modalBadge--err"}`}
          >
            {isSuccess ? "Başarılı" : "Hata"}
          </span>
        </div>

        {/* Success metrics */}
        {result && (
          <>
            <div className="modalMetrics">
              <div className="metricItem">
                <span className="metricLabel">Toplam Link</span>
                <span className="metricValue">{result.total_links}</span>
              </div>
              <div className="metricItem">
                <span className="metricLabel">Şüpheli Link</span>
                <span className="metricValue">{result.suspicious_count}</span>
              </div>
              <div className="metricItem">
                <span className="metricLabel">Risk Skoru</span>
                <span className="metricValue">%{result.risk_score}</span>
              </div>
              <div className="metricItem">
                <span className="metricLabel">Sponsorlu</span>
                <span className="metricValue">
                  {result.is_sponsored ? "Evet" : "Hayır"}
                </span>
              </div>
              <div className="metricItem">
                <span className="metricLabel">Anahtar Kelime</span>
                <span className="metricValue">{result.detected_keywords.length}</span>
              </div>
            </div>

            {result.detected_keywords.length > 0 && (
              <div className="modalSection">
                <div className="modalSectionTitle">Tespit Edilen Anahtar Kelimeler</div>
                <div className="chipList">
                  {result.detected_keywords.map((kw) => (
                    <span key={kw} className="chip">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Error details */}
        {scanError && (
          <div className="modalSection">
            <div className="modalSectionTitle">Hata Detayları</div>
            <div className="modalErrorBlock">
              <div>{scanError.error}</div>
              {scanError.error_code && (
                <div className="modalErrorCode">{scanError.error_code}</div>
              )}
              {scanError.details && (
                <div className="modalErrorDetails">{scanError.details}</div>
              )}
            </div>
          </div>
        )}

        {/* Raw JSON */}
        <div className="modalSection">
          <div className="modalSectionTitle">Ham JSON</div>
          <pre className="modalJson">{jsonPayload}</pre>
        </div>

        {/* Actions */}
        <div className="modalActions">
          {displayUrl && (
            <button className="modalBtn" onClick={() => copyToClipboard(displayUrl)}>
              URL Kopyala
            </button>
          )}
          <button className="modalBtn" onClick={() => copyToClipboard(jsonPayload)}>
            JSON Kopyala
          </button>
        </div>
      </div>
    </div>
  );
}

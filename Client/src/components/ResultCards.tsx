import { Globe, Link as LinkIcon, ShieldAlert } from "lucide-react";
import type { ScanResult } from "../types";

interface ResultCardsProps {
  result: ScanResult;
  onShowDetail: () => void;
}

export default function ResultCards({ result, onShowDetail }: ResultCardsProps) {
  return (
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
        <button className="detailBtn" onClick={onShowDetail}>
          Daha fazla detay
        </button>
      </div>
    </section>
  );
}

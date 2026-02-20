import { useState } from "react";
import {
  Search,
  ShieldAlert,
  Globe,
  Link as LinkIcon,
  Activity,
} from "lucide-react";
import axios from "axios";
import type { ScanResult } from "../src/types";

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!url) return;

    setLoading(true);
    try {
      // Django API'sine POST isteği gönderiyoruz
      const response = await axios.post("http://127.0.0.1:8000/api/analyze/", {
        url: url,
      });

      // Gelen veriyi ekrana basıyoruz
      setResult(response.data);
    } catch (error) {
      console.error("Tarama hatası:", error);
      alert(
        "Analiz sırasında bir hata oluştu. Django sunucusunun çalıştığından emin olun.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <img src="../public/logo.png" alt="Argus Logo" width={100} height={100} className="mx-auto mb-4 flex justify-center items-center" />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          ARGUS SCANNER
        </h1>
        <p className="text-slate-400 text-lg">
          Gizli reklamları ve şüpheli yönlendirmeleri saniyeler içinde tespit
          edin.
        </p>
      </header>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex gap-2 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
          <input
            type="text"
            placeholder="URL Giriniz"
            className="flex-1 bg-transparent border-none outline-none px-4 text-white"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-8 font-bold"
          >
            {loading ? (
              <Activity className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            {loading ? "Taranıyor..." : "Analiz Et"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <Globe size={24} />
              <h3 className="font-bold uppercase tracking-wider">
                Sayfa Bilgisi
              </h3>
            </div>
            <p className="text-xl font-semibold mb-2">{result.title}</p>
            <p className="text-slate-500 text-sm truncate">{result.url}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <LinkIcon size={24} />
              <h3 className="font-bold uppercase tracking-wider">
                Bağlantı Analizi
              </h3>
            </div>
            <p className="text-4xl font-black">{result.total_links}</p>
            <p className="text-slate-500">Tespit edilen toplam link</p>
          </div>

          <div
            className={`col-span-1 md:col-span-2 p-8 rounded-3xl border-2 flex items-center justify-between ${result.is_sponsored ? "border-red-900/50 bg-red-950/20" : "border-emerald-900/50 bg-emerald-950/20"}`}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert
                  className={
                    result.is_sponsored ? "text-red-500" : "text-emerald-500"
                  }
                  size={32}
                />
                <h2 className="text-2xl font-bold">
                  Risk Analizi: %{result.risk_score}
                </h2>
              </div>
              <p className="text-slate-400">
                {result.is_sponsored
                  ? "Bu sayfada yüksek ihtimalle bildirilmemiş sponsorlu içerik ve gizli yönlendirmeler bulundu."
                  : "Sayfa temiz görünüyor, herhangi bir gizli reklam izine rastlanmadı."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

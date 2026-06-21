import type { KeyboardEvent } from "react";
import type { ScanApiError } from "../types";
import Spinner from "./Spinner";

interface SearchInputProps {
  url: string;
  loading: boolean;
  canSubmit: boolean;
  scanError: ScanApiError | null;
  onUrlChange: (value: string) => void;
  onScan: () => void;
}

export default function SearchInput({
  url,
  loading,
  canSubmit,
  scanError,
  onUrlChange,
  onScan,
}: SearchInputProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onScan();
  };

  return (
    <section className="inputShell">
      <div className="inputRow">
        <input
          className="urlInput"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="URL gir (ör. example.com)"
        />

        <button
          className="submitButton"
          disabled={!canSubmit}
          onClick={onScan}
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
          {scanError.details && <span className="errorDetail">{scanError.details}</span>}
        </div>
      )}
    </section>
  );
}

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ResultCards from "./ResultCards";
import type { ScanResult } from "../types";

const safeResult: ScanResult = {
  title: "Example Page",
  url: "https://example.com",
  total_links: 42,
  suspicious_count: 0,
  detected_keywords: [],
  risk_score: 0,
  is_sponsored: false,
};

const riskyResult: ScanResult = {
  ...safeResult,
  suspicious_count: 3,
  risk_score: 60,
  is_sponsored: true,
};

describe("ResultCards", () => {
  it("renders page title and url", () => {
    render(<ResultCards result={safeResult} onShowDetail={vi.fn()} />);
    expect(screen.getByText("Example Page")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  it("renders total link count", () => {
    render(<ResultCards result={safeResult} onShowDetail={vi.fn()} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows safe banner when not sponsored", () => {
    const { container } = render(
      <ResultCards result={safeResult} onShowDetail={vi.fn()} />,
    );
    expect(container.querySelector(".riskBanner--safe")).toBeInTheDocument();
    expect(screen.getByText(/gizli reklam sinyali yakalanmadı/i)).toBeInTheDocument();
  });

  it("shows danger banner when sponsored", () => {
    const { container } = render(
      <ResultCards result={riskyResult} onShowDetail={vi.fn()} />,
    );
    expect(container.querySelector(".riskBanner--danger")).toBeInTheDocument();
    expect(screen.getByText(/sponsorlu içerik/i)).toBeInTheDocument();
  });

  it("displays risk score", () => {
    render(<ResultCards result={riskyResult} onShowDetail={vi.fn()} />);
    expect(screen.getByText(/%60/)).toBeInTheDocument();
  });

  it("calls onShowDetail when detail button is clicked", () => {
    const onShowDetail = vi.fn();
    render(<ResultCards result={safeResult} onShowDetail={onShowDetail} />);
    fireEvent.click(screen.getByText("Daha fazla detay"));
    expect(onShowDetail).toHaveBeenCalled();
  });
});

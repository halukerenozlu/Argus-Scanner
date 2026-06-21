import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchInput from "./SearchInput";

const defaultProps = {
  url: "",
  loading: false,
  canSubmit: false,
  scanError: null,
  onUrlChange: vi.fn(),
  onScan: vi.fn(),
};

describe("SearchInput", () => {
  it("renders the input with placeholder", () => {
    render(<SearchInput {...defaultProps} />);
    expect(screen.getByPlaceholderText(/URL gir/)).toBeInTheDocument();
  });

  it("calls onUrlChange when typing", () => {
    const onUrlChange = vi.fn();
    render(<SearchInput {...defaultProps} onUrlChange={onUrlChange} />);
    fireEvent.change(screen.getByPlaceholderText(/URL gir/), {
      target: { value: "example.com" },
    });
    expect(onUrlChange).toHaveBeenCalledWith("example.com");
  });

  it("disables button when canSubmit is false", () => {
    render(<SearchInput {...defaultProps} canSubmit={false} />);
    expect(screen.getByRole("button", { name: /analiz et/i })).toBeDisabled();
  });

  it("enables button when canSubmit is true", () => {
    render(<SearchInput {...defaultProps} canSubmit={true} />);
    expect(screen.getByRole("button", { name: /analiz et/i })).toBeEnabled();
  });

  it("calls onScan when button is clicked", () => {
    const onScan = vi.fn();
    render(<SearchInput {...defaultProps} canSubmit={true} onScan={onScan} />);
    fireEvent.click(screen.getByRole("button", { name: /analiz et/i }));
    expect(onScan).toHaveBeenCalled();
  });

  it("calls onScan on Enter key", () => {
    const onScan = vi.fn();
    render(<SearchInput {...defaultProps} onScan={onScan} />);
    fireEvent.keyDown(screen.getByPlaceholderText(/URL gir/), { key: "Enter" });
    expect(onScan).toHaveBeenCalled();
  });

  it("displays scan error", () => {
    render(
      <SearchInput {...defaultProps} scanError={{ error: "Sunucuya ulaşılamadı." }} />,
    );
    expect(screen.getByText("Sunucuya ulaşılamadı.")).toBeInTheDocument();
  });

  it("displays error details when present", () => {
    render(
      <SearchInput
        {...defaultProps}
        scanError={{
          error: "Failed to load",
          details: "net::ERR_NAME_NOT_RESOLVED",
        }}
      />,
    );
    expect(screen.getByText("net::ERR_NAME_NOT_RESOLVED")).toBeInTheDocument();
  });
});

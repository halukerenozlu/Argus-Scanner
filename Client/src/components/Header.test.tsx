import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Header from "./Header";

describe("Header", () => {
  it("renders the title", () => {
    render(<Header />);
    expect(screen.getByText("ARGUS SCANNER")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<Header />);
    expect(screen.getByText(/gizli reklamları/i)).toBeInTheDocument();
  });

  it("renders the logo image", () => {
    render(<Header />);
    const logo = screen.getByAltText("Argus Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.png");
  });
});

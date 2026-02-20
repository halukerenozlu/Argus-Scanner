"use client"

import { useState } from "react"

export default function Home() {
  const [inputValue, setInputValue] = useState("")

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Subtle ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "300px",
          background:
            "radial-gradient(ellipse, rgba(50, 205, 50, 0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main container */}
      <div
        style={{
          width: "100%",
          maxWidth: "780px",
          background:
            "linear-gradient(135deg, rgba(35, 35, 35, 0.6) 0%, rgba(28, 28, 28, 0.8) 100%)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "14px 20px",
          boxShadow:
            "0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          position: "relative",
        }}
      >
        {/* Input row with submit button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Text input */}
          <div style={{ flex: 1 }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your 3D object or scene..."
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "1.4",
                fontFamily: "inherit",
                minHeight: "22px",
                padding: "0",
              }}
              rows={1}
            />
          </div>

          {/* Submit button */}
          <button
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: inputValue
                ? "linear-gradient(135deg, #32CD32 0%, #28a428 100%)"
                : "rgba(75, 75, 75, 0.8)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: inputValue ? "pointer" : "default",
              transition: "all 0.25s ease",
              flexShrink: 0,
              boxShadow: inputValue
                ? "0 4px 16px rgba(50, 205, 50, 0.3)"
                : "none",
            }}
            onMouseEnter={(e) => {
              if (inputValue) {
                e.currentTarget.style.transform = "scale(1.08)"
                e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(50, 205, 50, 0.4)"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = inputValue
                ? "0 4px 16px rgba(50, 205, 50, 0.3)"
                : "none"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 14V4M9 4L5 8M9 4L13 8"
                stroke={inputValue ? "#ffffff" : "#666666"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        ::placeholder { color: rgba(255, 255, 255, 0.35); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

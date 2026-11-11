import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
          borderRadius: "40px",
          border: "4px solid rgba(56, 189, 248, 0.45)",
        }}
      >
        <svg
          width="116"
          height="116"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 20L10 32L22 44"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 16L28 48"
            stroke="#818cf8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M42 20L54 32L42 44"
            stroke="#c084fc"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}

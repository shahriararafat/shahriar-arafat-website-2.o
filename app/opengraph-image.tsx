import { ImageResponse } from "next/og";

export const alt = "Shahriar Arafat, CSE student at BUBT in Dhaka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#121614",
          color: "#f4f0e6",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#e4bc74",
            fontSize: 28,
            letterSpacing: 3,
          }}
        >
          <span>SHAHRIAR ARAFAT</span>
          <span>DHAKA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1, letterSpacing: -2 }}>Shahriar Arafat</div>
          <div style={{ marginTop: 24, fontSize: 36, color: "#c8c1b4" }}>Student · CSE at BUBT</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 160, height: 8, background: "#e4bc74", marginRight: 20 }} />
          <div style={{ fontSize: 28, color: "#c8c1b4" }}>Mirpur, Bangladesh</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

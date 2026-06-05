import { ImageResponse } from "next/og";

// iOS home-screen icon. SVG isn't supported for apple-touch-icon, so render the
// (opaque) brand mark into a 180×180 PNG. Opaque background = iOS-friendly.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK_SVG = `<svg width="180" height="180" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 0 56 L 0 0 L 56 0 L 56 56 L 0 56 Z" fill="#FFFFFF" /><path d="M 32.238 12.231 L 26.148 15.747 L 26.148 40.445 L 32.238 36.93 L 32.238 12.231 Z M 38.867 13.552 L 34.016 16.352 L 36.447 17.759 L 36.447 30.156 L 42.662 26.568 L 42.662 15.747 L 38.867 13.552 Z M 55.998 56 L -0.001 56 L -0.001 0 L 55.999 0 M 13.339 16.352 L 15.771 17.759 L 15.771 26.568 L 21.985 30.156 L 21.985 15.747 L 18.19 13.552 L 13.339 16.352 Z M 14.977 40.656 L 20.376 43.773 L 25.068 41.065 L 19.669 37.947 L 14.977 40.656 Z" fill="#0D0D0D" /></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={180}
          height={180}
          src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK_SVG)}`}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}

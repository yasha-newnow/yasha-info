"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

// Layout zones:
// - viewport < 1024 (mobile/tablet): no sidebar, month_view + Cal's
//   useSlotsViewOnSmallScreen handles compact rendering natively.
// - viewport 1024–1279 (narrow desktop with sidebar): section is too narrow
//   (~700–800px) for month_view → column_view (compact column picker).
// - viewport >= 1280 (wide desktop): section is wide enough for full month_view.
const SIDEBAR_BREAKPOINT = 1024;
const MONTH_VIEW_MIN_VIEWPORT = 1280;

function getLayout(): "month_view" | "column_view" {
  if (typeof window === "undefined") return "month_view";
  const w = window.innerWidth;
  if (w >= SIDEBAR_BREAKPOINT && w < MONTH_VIEW_MIN_VIEWPORT) return "column_view";
  return "month_view";
}

export function CalInline() {
  const layout = getLayout();

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "15min" });
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
        layout,
      });
    })();
  }, [layout]);

  return (
    <Cal
      namespace="15min"
      calLink="yashapetrunin/15min"
      style={{ width: "100%" }}
      config={{
        layout,
        theme: "light",
        useSlotsViewOnSmallScreen: "true",
      }}
    />
  );
}

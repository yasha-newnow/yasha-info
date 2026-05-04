"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

// month_view (calendar grid + slots panel) needs ~840px of iframe width to
// render without Cal's own internal h-scrollbar. Section width = viewport −
// sidebar(~290) − padding(80). Below this viewport, fall back to column_view.
const MONTH_VIEW_MIN_VIEWPORT = 1280;

function getLayout(): "month_view" | "column_view" {
  if (typeof window === "undefined") return "month_view";
  return window.innerWidth >= MONTH_VIEW_MIN_VIEWPORT
    ? "month_view"
    : "column_view";
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

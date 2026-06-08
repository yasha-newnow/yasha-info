"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

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
        cssVarsPerTheme: {
          light: {
            "cal-text": "#121419",
            "cal-text-emphasis": "#121419",
            "cal-bg-inverted": "#121419",
          },
          dark: {},
        },
      });
    })();
  }, [layout]);

  // Booking funnel events. Registered once (NOT tied to `layout`) so a viewport
  // resize doesn't attach duplicate listeners. The `cancelled` flag guards the
  // async getCalApi race (cleanup can run before it resolves) and React
  // StrictMode's double-invoke, so listeners are never registered twice. The
  // `widgetViewed` once-guard covers Cal firing `linkReady` more than once per
  // load. linkReady fires when the embed loaded for a visitor who scrolled to the
  // contact section → "booking widget was seen"; bookingSuccessfulV2 = call booked
  // (conversion). Funnel: booking_widget_viewed → booking_completed.
  useEffect(() => {
    let cancelled = false;
    let off = () => {};
    let widgetViewed = false;
    (async () => {
      const cal = await getCalApi({ namespace: "15min" });
      if (cancelled) return;
      const onLinkReady = () => {
        if (widgetViewed) return;
        widgetViewed = true;
        track("booking_widget_viewed", { placement: "contact" });
      };
      const onBooked = () => track("booking_completed", { placement: "contact" });
      cal("on", { action: "linkReady", callback: onLinkReady });
      cal("on", { action: "bookingSuccessfulV2", callback: onBooked });
      off = () => {
        cal("off", { action: "linkReady", callback: onLinkReady });
        cal("off", { action: "bookingSuccessfulV2", callback: onBooked });
      };
    })();
    return () => {
      cancelled = true;
      off();
    };
  }, []);

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

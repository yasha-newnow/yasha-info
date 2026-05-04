"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalInline() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "15min" });
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Cal
      namespace="15min"
      calLink="yashapetrunin/15min"
      style={{ width: "100%" }}
      config={{
        layout: "month_view",
        theme: "light",
        useSlotsViewOnSmallScreen: "true",
      }}
    />
  );
}

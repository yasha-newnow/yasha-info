import posthog from "posthog-js";

// Next.js client instrumentation: runs once on the client, before hydration.
// Initializing PostHog here keeps the root layout a server component (no
// PostHogProvider needed).
//
// Privacy: cookieless (`persistence: "memory"`) + EU region, so no cookie
// banner is required. Person profiles only for identified users (we never
// identify anyone, so all traffic stays anonymous).
//
// The init is skipped without a key and on localhost, so local dev and
// edit-mode never send events to the production project.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

if (
  key &&
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  try {
    posthog.init(key, {
      api_host: host,
      defaults: "2026-05-30",
      persistence: "memory",
      person_profiles: "identified_only",
    });
  } catch {
    // Analytics must never break the app or block hydration.
  }
}

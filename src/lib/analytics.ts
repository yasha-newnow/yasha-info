import posthog from "posthog-js";

/**
 * Fire a custom analytics event.
 *
 * SSR-safe and dev-safe:
 * - no-op during server render (no `window`)
 * - outside production: logs to the console and does NOT send, so local dev and
 *   edit-mode never pollute the production project
 * - in production: forwards to PostHog only once it is initialized (guards the
 *   no-key / non-prod-host paths where init is intentionally skipped)
 *
 * Pageviews, generic clicks, UTM and referrer are captured automatically by
 * PostHog autocapture — only high-signal custom events go through here.
 * Follow the naming convention: snake_case, object_action, past tense, with the
 * variable part in a property (e.g. `case_id`), never in the event name.
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, props ?? {});
    return;
  }
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}

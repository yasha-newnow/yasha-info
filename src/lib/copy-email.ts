import { track } from "./analytics";

export const EMAIL = "yashapetrunin@gmail.com";

export function copyEmail(placement?: string) {
  navigator.clipboard
    .writeText(EMAIL)
    .then(() => track("email_copied", placement ? { placement } : {}))
    .catch(() => {});
}

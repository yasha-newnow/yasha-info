export const EMAIL = "yashapetrunin@gmail.com";

export function copyEmail() {
  navigator.clipboard.writeText(EMAIL).catch(() => {});
}

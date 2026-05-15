import type { ReactNode } from "react";

const BOLD_REGEX = /\*\*(.+?)\*\*/g;

export function parseBold(text: string, boldClassName?: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = BOLD_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${key++}`} className={boldClassName}>
        {match[1]}
      </strong>,
    );
    lastIndex = BOLD_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

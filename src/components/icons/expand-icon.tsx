interface ExpandIconProps {
  size?: number;
  className?: string;
}

export function ExpandIcon({ size = 20, className }: ExpandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 -960 960 960"
      width={size}
      fill="currentColor"
      className={className}
    >
      <path d="M234.5-234.5v-251h83v168h168v83h-251Zm408-240v-168h-168v-83h251v251h-83Z" />
    </svg>
  );
}

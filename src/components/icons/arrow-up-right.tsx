interface ArrowUpRightProps {
  size?: number;
  className?: string;
}

export function ArrowUpRight({ size = 20, className }: ArrowUpRightProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 -960 960 960"
      width={size}
      fill="currentColor"
      className={className}
    >
      <path d="M244.39-235.61 189-291l402-402H238.39v-78h486v486h-78v-352.61l-402 402Z" />
    </svg>
  );
}

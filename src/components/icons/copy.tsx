interface CopyIconProps {
  size?: number;
  className?: string;
}

export function CopyIcon({ size = 20, className }: CopyIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 -960 960 960"
      width={size}
      fill="currentColor"
      className={className}
    >
      <path d="M285.37-237.37v-630.26h534.26v630.26H285.37Zm78-78h378.26v-474.26H363.37v474.26Zm-223 223v-630.26h78v552.26h456.26v78H140.37Zm223-223v-474.26 474.26Z" />
    </svg>
  );
}

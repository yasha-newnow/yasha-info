interface ButtonLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

export function ButtonLink({ onClick, children, ...aria }: ButtonLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="button-link body--medium text-foreground cursor-pointer bg-transparent border-none p-0"
      {...aria}
    >
      {children}
    </button>
  );
}

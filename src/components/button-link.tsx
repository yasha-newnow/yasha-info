interface ButtonLinkProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function ButtonLink({ onClick, children }: ButtonLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="button-link text-foreground text-base font-medium leading-6 cursor-pointer bg-transparent border-none p-0"
    >
      {children}
    </button>
  );
}

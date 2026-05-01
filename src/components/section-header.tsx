interface SectionHeaderProps {
  title: string;
  tag: string;
}

export function SectionHeader({ title, tag }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline gap-4 mb-10 lg:px-2">
      <h2 className="text-foreground shrink-0">
        {title}
      </h2>
      <div className="flex-1 h-px bg-foreground opacity-10" />
      <span className="section-tag text-foreground shrink-0 hidden">
        {tag}
      </span>
    </div>
  );
}

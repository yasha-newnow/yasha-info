interface SectionHeaderProps {
  title: string;
  tag: string;
}

export function SectionHeader({ title, tag }: SectionHeaderProps) {
  return (
    <div className="flex items-end gap-2 lg:gap-4 mb-10 lg:px-2">
      <h2 className="text-foreground shrink-0">
        {title}
      </h2>
      <div className="flex-1 h-px bg-foreground opacity-10 mb-2 lg:mb-3" />
      <span className="section-tag text-foreground shrink-0 pb-0.5 lg:pb-1">
        {tag}
      </span>
    </div>
  );
}

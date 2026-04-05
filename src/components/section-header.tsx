interface SectionHeaderProps {
  title: string;
  tag: string;
}

export function SectionHeader({ title, tag }: SectionHeaderProps) {
  return (
    <div className="flex items-end gap-2 lg:gap-4 mb-10 lg:px-2">
      <h2 className="font-sans text-[64px] lg:text-[80px] leading-[72px] lg:leading-[88px] font-bold text-foreground shrink-0">
        {title}
      </h2>
      <div className="flex-1 h-px bg-foreground opacity-10 mb-3" />
      <span className="font-tag text-2xl leading-8 font-medium text-foreground shrink-0 pb-1">
        {tag}
      </span>
    </div>
  );
}

import {
  Logo,
  ArrowUpRight,
  CopyIcon,
  PlusIcon,
  PaletteIcon,
  WaveHand,
  AnimatedClock,
  AnimatedGlobe,
  ExpandIcon,
} from "@/components/icons";
import {
  WhatIcon,
  HowIcon,
  WhyIcon,
} from "@/components/icons/about-icons";

type IconCell = {
  name: string;
  importPath: string;
  defaultSize: string;
  render: () => React.ReactNode;
};

const ICONS: IconCell[] = [
  {
    name: "Logo",
    importPath: "@/components/icons → Logo",
    defaultSize: "40",
    render: () => <Logo size={40} />,
  },
  {
    name: "ArrowUpRight",
    importPath: "@/components/icons → ArrowUpRight",
    defaultSize: "20",
    render: () => <ArrowUpRight size={24} />,
  },
  {
    name: "CopyIcon",
    importPath: "@/components/icons → CopyIcon",
    defaultSize: "20",
    render: () => <CopyIcon size={24} />,
  },
  {
    name: "PlusIcon",
    importPath: "@/components/icons → PlusIcon",
    defaultSize: "24",
    render: () => <PlusIcon size={24} />,
  },
  {
    name: "PaletteIcon",
    importPath: "@/components/icons → PaletteIcon",
    defaultSize: "24",
    render: () => <PaletteIcon size={24} />,
  },
  {
    name: "WaveHand",
    importPath: "@/components/icons → WaveHand",
    defaultSize: "72",
    render: () => <WaveHand size={40} animate={false} />,
  },
  {
    name: "AnimatedClock",
    importPath: "@/components/icons → AnimatedClock",
    defaultSize: "20",
    render: () => <AnimatedClock size={24} />,
  },
  {
    name: "AnimatedGlobe",
    importPath: "@/components/icons → AnimatedGlobe",
    defaultSize: "20",
    render: () => <AnimatedGlobe size={24} />,
  },
  {
    name: "ExpandIcon",
    importPath: "@/components/icons → ExpandIcon",
    defaultSize: "20",
    render: () => <ExpandIcon size={24} />,
  },
  {
    name: "WhatIcon",
    importPath: "@/components/icons/about-icons → WhatIcon",
    defaultSize: "129×56 (fixed)",
    render: () => <WhatIcon />,
  },
  {
    name: "HowIcon",
    importPath: "@/components/icons/about-icons → HowIcon",
    defaultSize: "112×56 (fixed)",
    render: () => <HowIcon />,
  },
  {
    name: "WhyIcon",
    importPath: "@/components/icons/about-icons → WhyIcon",
    defaultSize: "126×56 (fixed)",
    render: () => <WhyIcon />,
  },
];

export function IconGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ICONS.map((icon) => (
        <div
          key={icon.name}
          className="flex flex-col gap-3 p-5 rounded-xl"
          style={{
            border:
              "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
          }}
        >
          <div
            className="flex items-center justify-center min-h-[80px] rounded-lg"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--foreground) 4%, transparent)",
            }}
          >
            {icon.render()}
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-sans font-semibold text-sm leading-5">
              {icon.name}
            </div>
            <div
              className="font-mono text-xs leading-4"
              style={{
                color:
                  "color-mix(in srgb, var(--foreground) 60%, transparent)",
              }}
            >
              size: {icon.defaultSize}
            </div>
            <div
              className="font-mono text-xs leading-4 break-all"
              style={{
                color:
                  "color-mix(in srgb, var(--foreground) 50%, transparent)",
              }}
            >
              {icon.importPath}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

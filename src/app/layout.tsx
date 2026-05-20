import type { Metadata } from "next";
import { Inter_Tight, Stick_No_Bills, Homemade_Apple } from "next/font/google";
import localFont from "next/font/local";
import "dialkit/styles.css";
import "./globals.css";
import { EditModeProvider } from "@/lib/edit-mode/use-edit-mode";
import { EditToggleButton } from "@/components/edit-mode/edit-toggle-button";
import { EditSidePanel } from "@/components/edit-mode/edit-side-panel";
import { ContentProvider } from "@/lib/edit-mode/content-context";
import { loadAllContent } from "@/data/server-load";
import { Agentation } from "agentation";

// Read content JSON fresh on every request so dev-time edits propagate
// without restarting the server. Layout owns the data provider so dev tools
// (EditSidePanel, EditToggleButton) can read/mutate content from any route.
export const dynamic = "force-dynamic";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const stickNoBills = Stick_No_Bills({
  variable: "--font-stick-no-bills",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const homemadeApple = Homemade_Apple({
  variable: "--font-homemade-apple",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const drukCond = localFont({
  src: "./fonts/DrukCond-Super-Trial.otf",
  variable: "--font-druk-cond",
  weight: "1000",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yasha Petrunin — Designer",
  description:
    "Designer and educator with two decades of experience specialized in designing products, digital experiences, and building overpowered teams obsessed with craft.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await loadAllContent();
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${stickNoBills.variable} ${homemadeApple.variable} ${drukCond.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black">
        <ContentProvider initial={content}>
          <EditModeProvider>
            <div data-vaul-drawer-wrapper="" className="min-h-full" style={{ backgroundColor: "var(--accent)" }}>
              {children}
            </div>
            <EditToggleButton />
            <EditSidePanel />
          </EditModeProvider>
        </ContentProvider>
        {/* Agentation — AI-comment overlay for annotating concrete UI elements.
            Dev-only. Mounted at the body root so it's visible on every page
            (main as well as inside drawers). Trade-off: clicking it while a
            Vaul drawer is open may register as outside-click and close it —
            acceptable because the typical use is annotating the main UI.
            DialKit stays inside Drawer.Content (project-sheet.tsx) and is
            currently commented out there. */}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

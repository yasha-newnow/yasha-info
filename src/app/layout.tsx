import type { Metadata } from "next";
import { Inter_Tight, Stick_No_Bills, Homemade_Apple } from "next/font/google";
import localFont from "next/font/local";
import "dialkit/styles.css";
import "./globals.css";
import { EditModeProvider } from "@/lib/edit-mode/use-edit-mode";
import { EditToggleButton } from "@/components/edit-mode/edit-toggle-button";
import { EditSidePanel } from "@/components/edit-mode/edit-side-panel";
import { GalleryEditPanel } from "@/components/edit-mode/gallery-edit-panel";
import { ContentProvider } from "@/lib/edit-mode/content-context";
import { loadAllContent } from "@/data/server-load";
import { Agentation } from "agentation";
import { ACCENT_COLORS } from "@/lib/presets";
import { computeTheme } from "@/lib/contrast";
import { buildThemeInitScript } from "@/lib/theme-init";

// Read content JSON fresh on every request so dev-time edits propagate
// without restarting the server. Layout owns the data provider so dev tools
// (EditSidePanel, EditToggleButton) can read/mutate content from any route.
export const dynamic = "force-dynamic";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  // No 700: live routes max out at 600 (.text-bold); no font-weight:700 in CSS.
  weight: ["400", "500", "600"],
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

const SITE_URL = "https://yasha-info.vercel.app";
const TITLE = "Yasha Petrunin ✱ Product Designer";
const DESCRIPTION =
  "Product designer, 10+ years on 0→1 launches and platform-scale rebuilds across FinTech, B2B, and Consumer. Architect by training. AI tools in daily practice.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Yasha Petrunin",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Machine-readable identity for Google rich results and AI/search assistants.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yasha Petrunin",
  url: SITE_URL,
  jobTitle: "Product Designer",
  description: DESCRIPTION,
  image: `${SITE_URL}/opengraph-image`,
  email: "mailto:yashapetrunin@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Valencia",
    addressCountry: "ES",
  },
  knowsAbout: [
    "Product Design",
    "Product Strategy",
    "Information Architecture",
    "User Research",
    "A/B Testing",
    "Design Systems",
    "Interaction Design",
  ],
  sameAs: ["https://www.linkedin.com/in/yashapetrunin/"],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Moscow Institute of Architecture",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await loadAllContent();
  // Precompute each preset's full theme on the server, then hand them to the
  // pre-paint init script that randomizes the accent on each load (no flash).
  const themeInitScript = buildThemeInitScript(ACCENT_COLORS.map(computeTheme));
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${stickNoBills.variable} ${homemadeApple.variable} ${drukCond.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-black">
        {/* Runs before first paint: sets --accent (and derived vars) from the
            saved manual choice or a random preset, so there is no color flash. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {/* Person structured data (schema.org) — identity for Google/AI. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ContentProvider initial={content}>
          <EditModeProvider>
            <div data-vaul-drawer-wrapper="" className="min-h-full" style={{ backgroundColor: "var(--accent)" }}>
              {children}
            </div>
            <EditToggleButton />
            <EditSidePanel />
            <GalleryEditPanel />
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

import type { Metadata } from "next";
import { Inter_Tight, Stick_No_Bills, Homemade_Apple } from "next/font/google";
import localFont from "next/font/local";
import "dialkit/styles.css";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${stickNoBills.variable} ${homemadeApple.variable} ${drukCond.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black">
        <div data-vaul-drawer-wrapper="" className="min-h-full" style={{ backgroundColor: "var(--accent)" }}>
          {children}
        </div>
        {/* DialKit + Agentation are mounted INSIDE Drawer.Content (project-sheet.tsx)
            so Vaul's outside-click detection doesn't close the drawer when interacting
            with dev tools. Trade-off: dev tools visible only when drawer is open. */}
      </body>
    </html>
  );
}

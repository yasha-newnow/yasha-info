import type { Metadata } from "next";
import { Inter_Tight, Roboto_Mono, Stick_No_Bills, Homemade_Apple } from "next/font/google";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { Agentation } from "agentation";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${interTight.variable} ${robotoMono.variable} ${stickNoBills.variable} ${homemadeApple.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black">
        <div data-vaul-drawer-wrapper="" className="min-h-full bg-accent transition-[border-radius,background-color] duration-500">
          {children}
          <DialRoot />
        </div>
        {process.env.NODE_ENV === "development" && <Agentation className="!top-4 !right-4 !bottom-auto !left-auto" />}
      </body>
    </html>
  );
}

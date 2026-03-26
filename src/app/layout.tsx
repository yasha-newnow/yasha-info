import type { Metadata } from "next";
import { Inter_Tight, Roboto_Mono, Stick_No_Bills } from "next/font/google";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { Agentation } from "agentation";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const stickNoBills = Stick_No_Bills({
  variable: "--font-stick-no-bills",
  subsets: ["latin"],
  weight: ["600"],
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
      className={`${interTight.variable} ${robotoMono.variable} ${stickNoBills.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <DialRoot />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}

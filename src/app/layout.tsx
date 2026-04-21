import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://float-comparison-checker.dev"),
  title: {
    default: "float-comparison-checker | Safe floating point comparison validator",
    template: "%s | float-comparison-checker"
  },
  description:
    "Catch unsafe floating point equality checks before they ship. Analyze JavaScript, TypeScript, and Python with epsilon-based recommendations.",
  keywords: [
    "floating point comparison",
    "epsilon comparison",
    "developer tools",
    "fintech tooling",
    "precision bug detection",
    "ci quality gates"
  ],
  openGraph: {
    title: "float-comparison-checker",
    description:
      "CLI + API for detecting risky floating point comparisons and generating epsilon-safe alternatives before production.",
    type: "website",
    siteName: "float-comparison-checker"
  },
  twitter: {
    card: "summary_large_image",
    title: "float-comparison-checker",
    description: "Detect unsafe float comparisons and stop silent precision regressions in CI."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${monoFont.variable}`}>
      <body className="bg-[#0d1117] text-[#e6edf3] antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Float Comparison Checker — Safe Floating Point Validator",
  description: "Validate floating point comparisons in code snippets. Highlight unsafe equality checks and get epsilon-based alternatives instantly."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[#c9d1d9] min-h-screen">{children}</body>
    </html>
  );
}

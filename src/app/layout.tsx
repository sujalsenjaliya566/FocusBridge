import type { Metadata } from "next";
import { Lexend, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FocusBridge — Edge-Native Academic Co-Reader",
  description:
    "An edge-native, local-first academic reading workstation for neurodivergent learners powered by Gemma 2 2B on-device AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lexend.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-textPrimary antialiased">{children}</body>
    </html>
  );
}

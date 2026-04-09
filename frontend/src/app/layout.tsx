import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const geistSans = Quicksand({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduPilot AI",
  description: "Educational Platform powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider>
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

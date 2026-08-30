import type { Metadata } from "next";
import { League_Spartan, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Identifiers, micro-labels and figures. A record system needs a monospace that is
// institutional rather than playful, and Plex Mono's figures line up with DM Sans's
// x-height closely enough to sit inside a sentence without looking pasted in.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-ui",
});


export const metadata: Metadata = {
  title: "Impact 360 · Internship OS",
  description: "Impact 360 operating system for developing, managing and converting technology talent.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${leagueSpartan.variable} ${dmSans.variable} ${plexMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Subtle programme workspace backdrop */}
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/5 to-transparent" />
          </div>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { absoluteUrl, serializeJsonLd, siteUrl } from "@/lib/site";
import { ThemeProvider } from "./components/theme-provider";
import { NavigationHistoryProvider } from "./components/navigation-history";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  icons: {
    icon: "/favicon.ico",
  },
  title: {
    default: "Halk — Web Developer → Systems Engineer",
    template: "%s — Halk",
  },
  description:
    "Werberth Lins builds across the web stack and writes about the road from distributed products to Rust, graphics, and game engines.",
  authors: [{ name: "Werberth Lins", url: "https://github.com/halkliff" }],
  creator: "Werberth Lins",
  publisher: "Werberth Lins",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "Werberth Lins",
    "Halk",
    "Rust",
    "React",
    "Next.js",
    "AWS",
    "Python",
    "systems engineering",
    "game engines",
  ],
  openGraph: {
    title: "Halk — Interface to infrastructure",
    description:
      "A highly interactive portfolio and field notes from the road between web products and systems engineering.",
    type: "website",
    url: "/",
    siteName: "Halk — Werberth Lins",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Hi, I am Werberth. You can call me Halk.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Halk — Interface to infrastructure",
    description:
      "A highly interactive portfolio and field notes from the road between web products and systems engineering.",
    creator: "@halkliff",
    images: ["/og.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: "Halk — Werberth Lins",
      description: metadata.description,
      inLanguage: "en-US",
    },
    {
      "@type": "Person",
      "@id": absoluteUrl("/#werberth-lins"),
      name: "Werberth Lins",
      alternateName: "Halk",
      url: absoluteUrl("/"),
      image: absoluteUrl("/profile.png"),
      jobTitle: "Software Engineer",
      description:
        "Software engineer working across web products, cloud infrastructure, distributed systems, and high-throughput systems.",
      sameAs: [
        "https://github.com/halkliff",
        "https://linkedin.com/in/werberth-lins",
        "https://x.com/halkliff",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
          storageKey="halk-theme"
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          />
          <NavigationHistoryProvider>{children}</NavigationHistoryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

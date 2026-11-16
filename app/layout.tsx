import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://arise-coach.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ARISE · Smart AI Workout Coach & Nutrition",
  description:
    "Personal AI workout coach with customized training plans, animated exercise guides, powerlifting strength calculators, and localized nutrition.",
  applicationName: "ARISE Coach",
  keywords: [
    "Workout Coach",
    "Fitness App",
    "Bangladeshi Diet Plan",
    "1RM Calculator",
    "IPF DOTS",
    "AI Fitness Coach",
    "Exercise Library",
    "ফিটনেস",
    "ওয়ার্কআউট",
  ],
  authors: [{ name: "ARISE Fitness Team" }],
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: {
    capable: true,
    title: "ARISE Fitness",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "ARISE · Smart AI Workout Coach & Nutrition",
    description:
      "Transform your strength and conditioning with personalized workouts, exercise form guides, and localized nutrition.",
    siteName: "ARISE Fitness",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARISE · Smart AI Workout Coach & Nutrition",
    description:
      "Transform your strength and conditioning with personalized workouts, exercise form guides, and localized nutrition.",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ARISE Fitness Coach",
  operatingSystem: "Web, iOS, Android",
  applicationCategory: "HealthApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Adaptive AI fitness coach with workout splits, strength biomechanics, and culturally authentic nutrition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#090d16] font-sans text-zinc-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

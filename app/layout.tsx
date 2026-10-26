import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARISE : The System · Solo Leveling Workout Coach (সোলো লেভেলিং)",
  description: "Solo Leveling System-inspired adaptive AI fitness coach with daily hunter quests, dungeon raids, real-time stat evaluations, and custom Bangladeshi nutrition.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "ARISE : The System", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#020510",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-[#020510] font-sans text-cyan-100 antialiased selection:bg-cyan-500 selection:text-black system-grid-bg">
        {children}
      </body>
    </html>
  );
}

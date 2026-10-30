import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// I file erano gia' nel repo ma nessuno li caricava: il body usava Segoe UI.
const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
import BottomTabBar from "@/components/BottomTabBar";
import { STADIUM_SEEN_SCRIPT } from "@/lib/stadiumSeen";

export const metadata: Metadata = {
  title: "⚽ Calcetto",
  description: "Traccia le partite del gruppo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        {/* Prima del primo disegno: decide se le card del campo in home fanno l'entrata */}
        <script dangerouslySetInnerHTML={{ __html: STADIUM_SEEN_SCRIPT }} />
        {/* Desktop: centrato con sfondo scuro ai lati */}
        <div className="min-h-screen md:flex md:items-start md:justify-center" style={{ background: '#080d16' }}>
          <div className="w-full md:max-w-md md:min-h-screen relative" style={{ background: '#0d1420' }}>
            {/* Top nav su desktop */}
            <BottomTabBar />
            <div className="pt-14">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

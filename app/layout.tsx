import type { Metadata } from "next";
import localFont from "next/font/local";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

// I file erano gia' nel repo ma nessuno li caricava: il body usava Segoe UI.
const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

// Numeri di punteggi e statistiche (classe .numeric): condensato e sobrio, cifre a larghezza fissa
const sport = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sport",
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
    <html lang="it" className={`${geist.variable} ${sport.variable}`} suppressHydrationWarning>
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

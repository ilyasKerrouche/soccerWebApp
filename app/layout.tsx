import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";

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
    <html lang="it">
      <body>
        {/* Desktop: centrato con sfondo scuro ai lati */}
        <div className="min-h-screen md:flex md:items-start md:justify-center" style={{ background: '#03030a' }}>
          <div className="w-full md:max-w-md md:min-h-screen relative" style={{ background: '#06060f' }}>
            {/* Top nav su desktop */}
            <BottomTabBar />
            {/* Padding bottom su mobile per tab bar, top su desktop */}
            <div className="pb-20 md:pb-6 md:pt-16">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

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
            <div className="pt-14">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

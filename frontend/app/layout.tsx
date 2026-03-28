import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { MainContent } from "@/components/main-content";
import { Navigation } from "@/components/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budenfinder | AI-powered Berlin rental search",
  description:
    "Budenfinder — AI-powered rental discovery, application tools, and market insights for Berlin tenants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col bg-surface font-sans text-on-surface">
        <Navigation />
        <MainContent>{children}</MainContent>
      </body>
    </html>
  );
}

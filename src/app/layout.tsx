import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "RatePunk - Cyberpunk Video Game Reviews",
  description: "The ultimate cyberpunk-themed video game rating and review platform. Community-driven reviews, performance benchmarks, and more.",
  keywords: "video games, reviews, ratings, gaming, cyberpunk, community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Header />
          <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}

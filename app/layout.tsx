import type { Metadata } from "next";
import { Mona_Sans, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "PrepVue - Interview Practice",
  description: "Practice interviews with AI-powered feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} ${orbitron.variable} antialiased dark-gradient pattern`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex mx-auto max-w-7xl flex-col gap-12 my-12 px-16 max-sm:px-4 max-sm:my-8">
            <main>{children}</main>
          </div>
          <Toaster />
        </div>
      </body>
    </html>
  );
}

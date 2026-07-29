import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// File font disimpan di repo (app/fonts/), BUKAN didownload pas build.
// Sengaja pakai next/font/local, bukan next/font/google, biar build gak
// butuh koneksi ke fonts.gstatic.com — di jaringan hotspot/NAT64 itu sering
// gagal dan bikin build error. Detail: refactor.md (Fase 4).
const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900", // variable font: 1 file untuk semua ketebalan
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable.woff2",
  variable: "--font-space-grotesk",
  display: "swap",
  weight: "300 700",
});

export const metadata: Metadata = {
  title: "Desa Pulung Merdiko",
  description: "Profil resmi Desa Pulung Merdiko, Kecamatan Pulung, Ponorogo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`h-full antialiased ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

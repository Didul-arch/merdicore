"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
// Diimport (bukan ditaruh di public/) supaya Next tahu ukuran aslinya dan
// memberi nama berkas ber-hash — jadi bisa di-cache selamanya oleh browser.
import logoPemerintahan from '@/app/logo-pemerintahan.png';

const MENU_ITEMS = [
  { name: 'Beranda', path: '/' },
  { name: 'Profil Desa', path: '/tentang' },
  { name: 'Berita', path: '/berita' },
  { name: 'UMKM Desa', path: '/umkm' },
  { name: 'Lembaga', path: '/lembaga' },
  { name: 'Regulasi', path: '/regulasi' },
  { name: 'Hubungi Kami', path: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/toko')) {
    return null;
  }

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-md py-3'
      } border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo — tulisan "Pemerintah Desa Pulung Merdiko" sudah menyatu di
              dalam gambarnya, jadi tidak ditulis ulang sebagai teks.
              Maknanya dibawa oleh atribut alt supaya tetap terbaca mesin
              pencari dan pembaca layar. */}
          <Link href="/" className="flex items-center cursor-pointer" aria-label="Beranda">
            <Image
              src={logoPemerintahan}
              alt="Pemerintah Desa Pulung Merdiko — Kecamatan Pulung, Ponorogo"
              priority
              // Rasio logo 7:1, tampil setinggi 32px (h-8) di HP dan 40px
              // (h-10) di layar lebar -> lebarnya 224px dan 280px. Tanpa sizes,
              // Next mengira gambar selebar layar dan menyiapkan versi 1920px.
              sizes="(max-width: 640px) 224px, 280px"
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors py-2 cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-teal-600 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-inner max-h-[80vh] overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleMobileMenuClick}
              className="block w-full text-left py-2.5 text-sm font-semibold text-gray-800 hover:text-teal-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

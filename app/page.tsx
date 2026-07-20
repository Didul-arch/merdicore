"use client";

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tentang from './pages/Tentang';
import Berita from './pages/Berita';
import Umkm from './pages/Umkm';
import Lembaga from './pages/Lembaga';
import Regulasi from './pages/Regulasi';
import Contact from './pages/Contact';

const PAGES: Record<string, React.ComponentType> = {
  home: Home,
  about: Tentang,
  news: Berita,
  umkm: Umkm,
  lembaga: Lembaga,
  regulasi: Regulasi,
  contact: Contact,
};

export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ActivePage = PAGES[currentPage] ?? Home;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      <Header onNavigate={handleNavigate} />

      <main className="flex-grow">
        {currentPage === 'home' ? (
          <Home onNavigate={handleNavigate} />
        ) : (
          <ActivePage />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

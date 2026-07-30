"use client";

import { motion } from 'motion/react';
import { Compass, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroAnimated() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-16 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-10000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1555561331-50d48100300c?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/85 to-gray-800/40 z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-white">
        <div className="max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
          >
            Selamat Datang di <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-emerald-400 font-extrabold">
              Desa Pulung Merdiko
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-gray-200 mb-10 leading-relaxed max-w-2xl font-light"
          >
            Pusat informasi, layanan publik mandiri, dan galeri promosi UMKM Desa Pulung Merdiko. Membangun transparansi melalui inovasi teknologi untuk kesejahteraan masyarakat Ponorogo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
          >
            <Link
              href="/tentang"
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all group"
            >
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              <span>Mengenal Profil Desa</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/umkm"
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all"
            >
              <span>Kunjungi Pasar UMKM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg className="fill-white w-full h-12 sm:h-16" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </section>
  );
}

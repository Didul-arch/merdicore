import { Mail, Phone, Clock, Share2 } from 'lucide-react';
import VillageLogo from './VillageLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { label: 'Beranda', id: 'home' },
  { label: 'Profil Desa', id: 'about' },
  { label: 'Berita Desa', id: 'news' },
  { label: 'Portal UMKM', id: 'umkm' },
  { label: 'Lembaga Desa', id: 'lembaga' },
  { label: 'Regulasi & Perdes', id: 'regulasi' },
];

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Portal Desa Pulung Merdiko',
          text: 'Mari kunjungi portal resmi Desa Pulung Merdiko, Ponorogo!',
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan halaman berhasil disalin ke papan klip!');
    }
  };

  return (
    <footer className="bg-slate-950 text-gray-400 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center p-0.5">
                <VillageLogo size={32} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wider leading-tight">
                  PEMERINTAH DESA PULUNG MERDIKO
                </h4>
                <p className="text-[10px] sm:text-xs font-semibold text-teal-400 uppercase tracking-widest leading-none mt-0.5">
                  Kabupaten Ponorogo
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-light text-gray-400 leading-relaxed max-w-sm">
              Portal terpadu untuk pelayanan masyarakat. Berkomitmen menghadirkan inovasi digital bagi kemajuan desa dan kesejahteraan seluruh warga.
            </p>

            <button
              onClick={handleShare}
              className="p-2.5 bg-slate-900 hover:bg-teal-900 hover:text-teal-300 rounded-xl transition-all cursor-pointer text-gray-400"
              title="Bagikan Portal Desa"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-3 space-y-6">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider relative pb-2 border-b border-slate-900">
              Navigasi
            </h5>
            <ul className="space-y-3 text-xs sm:text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="hover:text-teal-400 transition-colors text-left cursor-pointer font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-6">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider relative pb-2 border-b border-slate-900">
              Kontak
            </h5>
            <ul className="space-y-4 text-xs sm:text-sm font-light">
              <li className="flex items-center space-x-3.5">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <a href="mailto:info@pulungmerdiko.id" className="hover:text-teal-400 transition-colors">
                  info@pulungmerdiko.id
                </a>
              </li>
              <li className="flex items-center space-x-3.5">
                <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>(0352) 123-456</span>
              </li>
              <li className="flex items-center space-x-3.5">
                <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>Sen - Jum: 08:00 - 15:30</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-slate-950 py-6 border-t border-slate-900 text-xs text-gray-500 font-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <p>© {currentYear} Pemerintah Desa Pulung Merdiko. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

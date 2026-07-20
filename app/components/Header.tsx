import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import VillageLogo from './VillageLogo';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
}

const MENU_ITEMS = [
  { name: 'Beranda', id: 'home' },
  { name: 'Profil Desa', id: 'about' },
  { name: 'Berita', id: 'news' },
  { name: 'UMKM Desa', id: 'umkm' },
  { name: 'Lembaga', id: 'lembaga' },
  { name: 'Regulasi', id: 'regulasi' },
  { name: 'Hubungi Kami', id: 'contact' },
];

export default function Header({ onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleMenuClick('home')}
          >
            <div className="w-12 h-12 flex-shrink-0 bg-teal-600/10 rounded-full flex items-center justify-center p-1">
              <VillageLogo size={40} />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-gray-800 tracking-wider leading-tight">
                PEMERINTAH DESA PULUNG MERDIKO
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-sky-600 uppercase tracking-widest leading-none mt-0.5">
                Kecamatan Pulung • Ponorogo
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors py-2 cursor-pointer"
              >
                {item.name}
              </button>
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
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="block w-full text-left py-2.5 text-sm font-semibold text-gray-800 hover:text-teal-600 transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

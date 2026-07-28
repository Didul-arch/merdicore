"use client";

import { Phone } from 'lucide-react';
import { generateWhatsAppUrl } from '@/lib/utils';

interface Props {
  phone: string;
  businessName: string;
}

export default function WhatsAppButton({ phone, businessName }: Props) {
  const handleClick = () => {
    const message = `Halo, saya melihat usaha *${businessName}* di Portal UMKM Desa Pulung Merdiko dan tertarik untuk mengetahui lebih lanjut.\n\nApakah bisa dibantu?`;
    window.open(generateWhatsAppUrl(phone, message), '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-600/20 flex items-center justify-center space-x-2 mt-4 cursor-pointer"
    >
      <Phone className="w-5 h-5 fill-emerald-100/20" />
      <span>Hubungi via WhatsApp</span>
    </button>
  );
}

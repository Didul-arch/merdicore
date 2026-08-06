"use client";

import Image from 'next/image';
import { Users } from 'lucide-react';
import type { PerangkatDesa } from '@/lib/types';

interface Props {
  official: PerangkatDesa;
}

export default function OfficialCard({ official }: Props) {
  return (
    <div className="hover-lift bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center p-6 space-y-4">
      <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-teal-100 ring-2 ring-teal-600/10">
        {official.foto ? (
          <Image
            src={official.foto}
            alt={official.nama}
            fill
            sizes="112px"
            className="object-cover"
            style={{ objectPosition: official.foto_fokus || '50% 50%' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-sky-50 text-teal-400">
            <Users className="w-10 h-10" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
          {official.nama}
        </h4>
        <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">
          {official.jabatan}
        </p>
        {official.nip && (
          <p className="text-[10px] text-gray-400 font-medium">NIP: {official.nip}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

// Ikon default Leaflet nyari file gambar lewat path yang gak kebaca bundler
// (Turbopack/webpack) -> pin-nya jadi kotak putih rusak. Bikin sendiri pakai
// SVG inline sekalian biar warnanya nyatu sama branding situs.
const pinIcon = new L.DivIcon({
  html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#0d9488"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`,
  className: "",
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -32],
});

export interface UmkmMapItem {
  id: number;
  nama_usaha: string;
  latitude: number;
  longitude: number;
}

export default function UmkmMap({ items }: { items: UmkmMapItem[] }) {
  if (items.length === 0) return null;

  const center: [number, number] = [
    items.reduce((sum, i) => sum + i.latitude, 0) / items.length,
    items.reduce((sum, i) => sum + i.longitude, 0) / items.length,
  ];

  return (
    <div className="h-80 sm:h-96 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative z-0">
      <MapContainer center={center} zoom={items.length > 1 ? 13 : 15} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <Marker key={item.id} position={[item.latitude, item.longitude]} icon={pinIcon}>
            <Popup>
              <div className="space-y-1.5 text-sm">
                <Link href={`/umkm/${item.id}`} className="font-bold text-teal-700 hover:underline">
                  {item.nama_usaha}
                </Link>
                <br />
                <a
                  href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-500 hover:text-teal-600"
                >
                  Buka di Google Maps →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

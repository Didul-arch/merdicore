import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ixvaocjypafdlyexfcsl.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Di jaringan IPv6-only/NAT64 (mis. hotspot HP), supabase.co ke-resolve jadi
    // alamat 64:ff9b::... dan dikira IP privat sama proteksi SSRF Next -> gambar
    // ditolak 400. Dimatikan HANYA saat dev; di produksi proteksinya tetap nyala.
    // Aman karena remotePatterns di atas udah ngunci host yang boleh diakses.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Home,
  Users,
  FileText,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  Landmark,
  Users2,
} from "lucide-react";
import LogoutButton from "@/app/dashboard/LogoutButton";

interface SidebarProps {
  userName?: string;
  userRole?: string;
  className?: string;
}

export default function DashboardSidebar({ userName, userRole, className }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Ringkasan",
      desc: "Ikhtisar data desa",
      path: "/dashboard",
      icon: Home,
      exact: true,
      roles: ["super_admin", "perangkat_desa"],
      color: "text-sky-600 bg-sky-50",
    },
    {
      label: "Manajemen User",
      desc: "Kelola akun pengguna",
      path: "/dashboard/users",
      icon: Users,
      exact: false,
      roles: ["super_admin"],
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Perangkat Desa",
      desc: "Struktur pemerintahan",
      path: "/dashboard/perangkat",
      icon: Landmark,
      exact: false,
      roles: ["super_admin", "perangkat_desa"],
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Lembaga Desa",
      desc: "Organisasi masyarakat",
      path: "/dashboard/lembaga",
      icon: Users2,
      exact: false,
      roles: ["super_admin", "perangkat_desa"],
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Kelola Berita",
      desc: "Publikasi informasi desa",
      path: "/dashboard/berita",
      icon: FileText,
      exact: false,
      roles: ["super_admin", "perangkat_desa"],
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Etalase UMKM",
      desc: "Produk usaha lokal",
      path: "/dashboard/umkm",
      icon: ShoppingBag,
      exact: false,
      roles: ["super_admin", "perangkat_desa"],
      color: "text-amber-600 bg-amber-50",
    },
  ];

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  /* ── Shared sidebar content ── */
  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-none">Admin Portal</h1>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">Desa Pulung Merdiko</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 my-3 border-t border-gray-200" />

      {/* Section label */}
      <p className="px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        Menu Utama
      </p>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5">
        {navItems
          .filter((item) => item.roles.includes(userRole ?? ""))
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${active
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                    : "text-gray-600 hover:bg-gray-100"}
                `}
              >
                {/* Icon badge */}
                <span
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200
                    ${active
                      ? "bg-white/20 text-white"
                      : item.color + " group-hover:shadow-sm"}
                  `}
                >
                  <Icon className="w-4 h-4" />
                </span>

                {/* Label + description */}
                <div className="min-w-0 flex-1">
                  <span className={`block text-[13px] font-semibold leading-tight ${active ? "text-white" : "text-gray-800"}`}>
                    {item.label}
                  </span>
                  <span className={`block text-[10px] leading-tight mt-0.5 ${active ? "text-teal-100" : "text-gray-400"}`}>
                    {item.desc}
                  </span>
                </div>

                {/* Active indicator arrow */}
                {active && <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />}
              </Link>
            );
          })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User card + Logout */}
      <div className="px-3 pb-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {userName ? userName[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-800 truncate">
                {userName ?? "Admin"}
              </p>
              <p className="text-[10px] text-teal-600 font-medium uppercase tracking-wide">
                {userRole ? userRole.replace("_", " ") : ""}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t flex items-end w-full justify-end border-gray-200">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: top bar with burger ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-800">Admin Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {/* ── Mobile: overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 z-50 w-72 h-full bg-white flex flex-col
          shadow-2xl transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button inside drawer */}
        <div className="flex justify-end p-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* ── Desktop: fixed sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0 sticky top-0 h-screen overflow-y-auto
          ${className ?? ""}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

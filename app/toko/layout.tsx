import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { ADMIN_ROLES, OWNER_ROLE } from "@/lib/auth";
import { ReactNode } from "react";
import { Store } from "lucide-react";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default async function TokoLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const role = session.user.role;
  if (role && ADMIN_ROLES.includes(role)) {
    redirect("/dashboard");
  }
  if (role !== OWNER_ROLE) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Usaha Saya</p>
              <p className="text-xs text-gray-400 leading-tight">{session.user.name}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }
    const userRole = session.user.role;
    const allowedRoles = ["super_admin", "perangkat_desa"];
    if (!allowedRoles.includes(userRole)) {
        redirect("/");
    }
    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar userName={session.user.name} userRole={session.user.role} />
            <div className="flex-1 pt-14 md:pt-0">
                {children}
            </div>
        </div>
    );
}
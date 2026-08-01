import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { ADMIN_ROLES } from "@/lib/auth";
import { ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }
    const userRole = session.user.role;
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
        redirect("/");
    }
    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar userName={session.user.name ?? undefined} userRole={userRole} />
            <div className="flex-1 pt-14 md:pt-0">
                {children}
            </div>
        </div>
    );
}
import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/auth-server";
import { canAccessAdminArea } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  if (!session.token) {
    redirect("/login?error=expired");
  }
  if (!canAccessAdminArea(session.role)) {
    const role = encodeURIComponent(session.role ?? "UNKNOWN");
    redirect(`/login?error=forbidden&role=${role}`);
  }
  return (
    <AdminShell
      userRole={session.role}
      username={session.username}
      canMutateCatalog={session.canMutateCatalog}
    >
      {children}
    </AdminShell>
  );
}

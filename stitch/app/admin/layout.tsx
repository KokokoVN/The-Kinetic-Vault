import { AdminShell } from "@/components/admin-shell";
import { getAdminSession } from "@/lib/auth-server";
import { canAccessAdminArea } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  const headersList = await headers();
  const isShowcase = headersList.get("x-is-showcase") === "1";

  if (!session.token) {
    if (isShowcase) {
      return (
        <AdminShell
          userRole="ADMIN"
          username="Showcase Mode (Demo)"
          canMutateCatalog={true}
        >
          {children}
        </AdminShell>
      );
    }
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

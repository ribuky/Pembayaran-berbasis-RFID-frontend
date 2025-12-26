import { redirect } from "next/navigation";

async function getUser() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getUser();

  if (!data || !data.authenticated) {
    redirect("/login");
  }

  return (
    <div>
      {/* nanti bisa tambah navbar */}
      {children}
    </div>
  );
}

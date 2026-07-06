// Protected admin layout — gates all /admin/* routes except /admin/login.
// Uses ssr: false because the Supabase session lives in localStorage.
import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Hotel, Users, Star } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Allow the login page through unauthenticated.
    if (location.pathname === "/admin/login") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/admin/login", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Login page renders standalone (no shell).
  if (typeof window !== "undefined" && window.location.pathname === "/admin/login") {
    return <Outlet />;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-card md:block">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <span className="font-display font-bold text-lg">Admin</span>
        </div>
        <nav className="p-3 space-y-1 text-sm">
          <NavLink to="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/hotels" icon={<Hotel className="h-4 w-4" />}>
            Hotels
          </NavLink>
          <NavLink to="/admin/customers" icon={<Users className="h-4 w-4" />}>
            Customers
          </NavLink>
          <NavLink to="/admin/feedback" icon={<Star className="h-4 w-4" />}>
            Feedback
          </NavLink>
        </nav>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="text-sm text-muted-foreground">
            {email ?? "Loading…"}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/admin" }}
      activeProps={{ className: "bg-primary/10 text-primary" }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

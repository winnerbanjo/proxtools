import Link from "next/link";
import { LogOut } from "lucide-react";
import { customerNav, adminNav } from "@/components/dashboard-nav-items";
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children, role = "Customer", userName = "User" }: { children: React.ReactNode; role?: "Customer" | "Admin"; userName?: string }) {
  const items = role === "Admin" ? adminNav : customerNav;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <MobileDashboardNav role={role} userName={userName} />
      <aside className="hidden bg-slate-950 px-4 py-6 text-slate-100 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <Link href={role === "Admin" ? "/admin" : "/"} className="flex items-center gap-3 border-b border-white/10 pb-5 no-underline">
          <span className="grid size-11 place-items-center rounded-md bg-gradient-to-br from-teal-400 to-blue-600 font-black text-white">P</span>
          <span>
            <strong className="block text-lg leading-tight">ProxTools</strong>
            <span className="text-sm text-slate-400">{role} Portal</span>
          </span>
        </Link>
        <div className="my-5 flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-slate-800 font-bold">{role === "Admin" ? "A" : "U"}</span>
          <span>
            <strong className="block leading-tight">{userName}</strong>
            <span className="text-sm text-slate-400">{role}</span>
          </span>
        </div>
        <nav className="grid gap-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-300 no-underline hover:bg-white/10 hover:text-white">
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 p-5 pt-20 lg:p-7">
        {children}
        <form action={logoutAction} className="mt-6">
          <Button variant="secondary" type="submit">
            <LogOut className="size-4" />
            Logout
          </Button>
        </form>
        <footer className="mt-5 text-center text-sm text-muted-foreground">Copyright 2024 © Wapx PLUS +</footer>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-primary">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-normal">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{action}</div>
    </section>
  );
}

export function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={full ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

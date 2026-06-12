import Link from "next/link";
import { LogOut, Shield, UserRound } from "lucide-react";
import { customerNav, adminNav } from "@/components/dashboard-nav-items";
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children, role = "Customer", accountRole, userName = "User" }: { children: React.ReactNode; role?: "Customer" | "Admin"; accountRole?: "customer" | "admin"; userName?: string }) {
  const items = role === "Admin" ? adminNav : customerNav;
  const isAdminAccount = role === "Admin" || accountRole === "admin";
  const switchHref = role === "Admin" ? "/" : "/admin";
  const switchLabel = role === "Admin" ? "Go to User" : "Back to Admin";
  const SwitchIcon = role === "Admin" ? UserRound : Shield;

  return (
    <div className="app-shell min-h-screen lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <MobileDashboardNav role={role} accountRole={accountRole} userName={userName} />
      <aside className="app-sidebar hidden px-4 py-6 text-slate-100 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <Link href={role === "Admin" ? "/admin" : "/"} className="flex items-center gap-3 border-b border-white/10 pb-5 no-underline">
          <span className="grid size-12 place-items-center rounded-md bg-[#f05238] font-black text-slate-950 shadow-[0_18px_42px_rgba(240,82,56,0.22)]">P</span>
          <span>
            <strong className="font-display block text-xl leading-tight tracking-normal">ProxTools</strong>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{role} Portal</span>
          </span>
        </Link>
        <div className="my-5 flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="grid size-10 place-items-center rounded-md bg-[#d6bb6d] font-black text-slate-950">{role === "Admin" ? "A" : "U"}</span>
          <span>
            <strong className="block leading-tight">{userName}</strong>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{role}</span>
          </span>
        </div>
        {isAdminAccount ? (
          <Link href={switchHref} className="mb-3 flex min-h-11 items-center gap-3 rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-2 text-sm font-black text-teal-100 no-underline transition hover:bg-teal-300/20">
            <SwitchIcon className="size-4" />
            {switchLabel}
          </Link>
        ) : null}
        <nav className="grid gap-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-black text-slate-300 no-underline transition hover:translate-x-1 hover:bg-white/10 hover:text-white">
              <span className="grid size-8 place-items-center rounded-md bg-white/[0.06] text-slate-400 transition group-hover:bg-[#f05238] group-hover:text-slate-950">
                <item.icon className="size-4" />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 p-5 pt-20 lg:p-8">
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
    <section className="page-band mb-6 flex flex-col gap-4 rounded-md p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h1 className="font-display mt-2 text-4xl font-black leading-tight tracking-normal text-slate-950 lg:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{action}</div>
    </section>
  );
}

export function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={full ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
      <span className="text-sm font-black text-slate-800">{label}</span>
      {children}
    </label>
  );
}

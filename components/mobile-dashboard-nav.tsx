"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Shield, UserRound, X } from "lucide-react";
import { adminNav, customerNav } from "@/components/dashboard-nav-items";
import { Button } from "@/components/ui/button";

export function MobileDashboardNav({ role = "Customer", accountRole, userName = "User" }: { role?: "Customer" | "Admin"; accountRole?: "customer" | "admin"; userName?: string }) {
  const [open, setOpen] = useState(false);
  const items = role === "Admin" ? adminNav : customerNav;
  const isAdminAccount = role === "Admin" || accountRole === "admin";
  const switchHref = role === "Admin" ? "/" : "/admin";
  const switchLabel = role === "Admin" ? "Go to User" : "Back to Admin";
  const SwitchIcon = role === "Admin" ? UserRound : Shield;

  return (
    <>
      <header className="app-sidebar fixed inset-x-0 top-0 z-50 flex min-h-16 items-center justify-between border-b border-white/10 px-4 text-slate-100 lg:hidden">
        <Link href={role === "Admin" ? "/admin" : "/"} className="flex items-center gap-3 no-underline" onClick={() => setOpen(false)}>
          <span className="grid size-10 place-items-center rounded-md bg-[#f05238] font-black text-slate-950">P</span>
          <span>
            <strong className="font-display block leading-tight tracking-normal">ProxTools</strong>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{role} Portal</span>
          </span>
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="size-10 border-white/10 bg-white/10 p-0 text-white hover:bg-white/15"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="app-sidebar absolute left-0 top-16 h-[calc(100vh-4rem)] w-80 max-w-[85vw] overflow-y-auto px-4 py-5 text-slate-100 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.07] p-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#d6bb6d] font-black text-slate-950">{role === "Admin" ? "A" : "U"}</span>
              <span>
                <strong className="block leading-tight">{userName}</strong>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{role}</span>
              </span>
            </div>
            {isAdminAccount ? (
              <Link href={switchHref} className="mb-3 flex min-h-11 items-center gap-3 rounded-md border border-teal-300/30 bg-teal-300/10 px-3 py-2 text-sm font-black text-teal-100 no-underline hover:bg-teal-300/20" onClick={() => setOpen(false)}>
                <SwitchIcon className="size-4" />
                {switchLabel}
              </Link>
            ) : null}
            <nav className="grid gap-2">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-black text-slate-300 no-underline hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}>
                  <span className="grid size-8 place-items-center rounded-md bg-white/[0.06] text-slate-400 group-hover:bg-[#f05238] group-hover:text-slate-950">
                    <item.icon className="size-4" />
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

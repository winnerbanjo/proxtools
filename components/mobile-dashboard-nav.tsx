"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { adminNav, customerNav } from "@/components/dashboard-nav-items";
import { Button } from "@/components/ui/button";

export function MobileDashboardNav({ role = "Customer", userName = "User" }: { role?: "Customer" | "Admin"; userName?: string }) {
  const [open, setOpen] = useState(false);
  const items = role === "Admin" ? adminNav : customerNav;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex min-h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 text-slate-100 lg:hidden">
        <Link href={role === "Admin" ? "/admin" : "/"} className="flex items-center gap-3 no-underline" onClick={() => setOpen(false)}>
          <span className="grid size-10 place-items-center rounded-md bg-gradient-to-br from-teal-400 to-blue-600 font-black text-white">P</span>
          <span>
            <strong className="block leading-tight">ProxTools</strong>
            <span className="text-xs text-slate-400">{role} Portal</span>
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
          <aside className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-80 max-w-[85vw] overflow-y-auto bg-slate-950 px-4 py-5 text-slate-100 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
              <span className="grid size-10 place-items-center rounded-full bg-slate-800 font-bold">{role === "Admin" ? "A" : "U"}</span>
              <span>
                <strong className="block leading-tight">{userName}</strong>
                <span className="text-sm text-slate-400">{role}</span>
              </span>
            </div>
            <nav className="grid gap-2">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-300 no-underline hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}>
                  <item.icon className="size-4" />
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

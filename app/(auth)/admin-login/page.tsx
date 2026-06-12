import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { PasswordInput } from "@/components/password";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="auth-background admin-auth auth-canvas grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex min-h-80 flex-col justify-between p-6 text-white sm:p-8 lg:p-10">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="auth-mark grid size-12 place-items-center rounded-md bg-[#d6bb6d] font-black text-slate-950">P</span>
          <span>
            <strong className="block text-lg">ProxTools</strong>
            <span className="text-sm text-white/70">Secure access</span>
          </span>
        </Link>
        <div className="max-w-2xl">
          <p className="mb-4 w-fit border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#f7df91]">restricted route</p>
          <h1 className="auth-display text-5xl font-black leading-[0.94] tracking-normal text-white sm:text-6xl lg:text-7xl">Back office access, kept off the front door.</h1>
          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/72">A private operations threshold for product control, customer review, orders, payments, and audit logs.</p>
          <div className="mt-8 grid max-w-xl grid-cols-4 border-y border-white/15 py-4 text-sm">
            <span className="font-black text-[#f7df91]">Stock</span>
            <span className="font-black text-[#f7df91]">Orders</span>
            <span className="font-black text-[#f7df91]">Funds</span>
            <span className="font-black text-[#f7df91]">Logs</span>
          </div>
        </div>
        <p className="text-sm text-white/70">Copyright 2024 © Wapx PLUS +</p>
      </section>
      <main className="grid place-items-center bg-[#11161c]/95 p-5 sm:p-8">
        <Card className="auth-panel relative w-full max-w-md overflow-hidden border-white/10 bg-[#f4efe5]/92 p-6 text-slate-950 backdrop-blur-xl sm:p-8">
          <div className="relative">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a6b20]">Admin Login</p>
                <h2 className="auth-display mt-2 text-4xl font-black leading-none tracking-normal">Quiet entry.</h2>
              </div>
              <span className="auth-stamp hidden border border-slate-950/15 px-2 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 sm:block">private</span>
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">Private admin access only. No public navigation points here.</p>
            {params.error ? <p className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-black text-red-700">Invalid admin login details.</p> : null}
            <form action={loginAction} className="mt-6 grid gap-4">
              <input type="hidden" name="role" value="admin" />
              <label className="auth-field grid gap-2 text-sm font-black text-slate-800">
                Email Address
                <Input name="email" type="email" autoComplete="email" required />
              </label>
              <label className="auth-field grid gap-2 text-sm font-black text-slate-800">
                Password
                <PasswordInput name="password" defaultValue="" />
              </label>

              <div className="auth-submit mt-2">
                <SubmitButton defaultText="Login" pendingText="Logging in..." />
              </div>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}

import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { PasswordInput } from "@/components/password";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <div className="auth-background auth-canvas grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex min-h-80 flex-col justify-between p-6 text-white sm:p-8 lg:p-10">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="auth-mark grid size-12 place-items-center rounded-md bg-[#f05238] font-black text-slate-950">P</span>
          <span>
            <strong className="block text-lg">ProxTools</strong>
            <span className="text-sm text-white/70">Customer desk</span>
          </span>
        </Link>
        <div className="max-w-2xl">
          <p className="mb-4 w-fit border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-teal-100">wallet access</p>
          <h1 className="auth-display text-5xl font-black leading-[0.94] tracking-normal text-white sm:text-6xl lg:text-7xl">Service credits, orders, and support under one roof.</h1>
          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/75">A calm control room for buying tools, tracking purchases, and keeping your ProxTools account funded.</p>
          <div className="mt-8 grid max-w-lg grid-cols-3 border-y border-white/15 py-4 text-sm">
            <span className="font-black text-teal-200">Wallet</span>
            <span className="font-black text-teal-200">Products</span>
            <span className="font-black text-teal-200">Support</span>
          </div>
        </div>
        <p className="text-sm text-white/70">Copyright 2024 © Wapx PLUS +</p>
      </section>
      <main className="grid place-items-center bg-[#f4efe5]/95 p-5 sm:p-8">
        <Card className="auth-panel relative w-full max-w-md overflow-hidden border-slate-950/10 bg-white/82 p-6 backdrop-blur-xl sm:p-8">
          <div className="relative">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0f766e]">Customer Login</p>
                <h2 className="auth-display mt-2 text-4xl font-black leading-none tracking-normal text-slate-950">Welcome back.</h2>
              </div>
              <span className="auth-stamp hidden border border-slate-950/15 px-2 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 sm:block">verified</span>
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">Manage your wallet, services, orders, and support requests.</p>
            {params.error ? <p className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-black text-red-700">Invalid login details.</p> : null}
            <form action={loginAction} className="mt-6 grid gap-4">
              <input type="hidden" name="role" value="customer" />
              <label className="auth-field grid gap-2 text-sm font-black text-slate-800">
                Email Address
                <Input name="email" type="email" defaultValue="user@proxtools.test" required />
              </label>
              <label className="auth-field grid gap-2 text-sm font-black text-slate-800">
                Password
                <PasswordInput name="password" defaultValue="user12345" />
              </label>

              <div className="auth-submit mt-2">
                <SubmitButton defaultText="Login" pendingText="Logging in..." />
              </div>
            </form>
            <div className="mt-5 flex justify-between gap-3 text-sm">
              <Link className="font-black text-[#0f766e] no-underline hover:underline" href="/forgot-password">Forgot password?</Link>
              <Link className="font-black text-slate-950 no-underline hover:underline" href="/register">Create account</Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string; error?: string }> }) {
  const params = await searchParams;
  const isAdmin = params.role === "admin";

  return (
    <div className="auth-background grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex min-h-80 flex-col justify-between p-8 text-white">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="grid size-11 place-items-center rounded-md bg-gradient-to-br from-teal-400 to-blue-600 font-black">P</span>
          <span>
            <strong className="block text-lg">ProxTools</strong>
            <span className="text-sm text-white/75">{isAdmin ? "Admin Portal" : "Customer Portal"}</span>
          </span>
        </Link>
        <div>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-normal">Your wallet, inventory, services, and support desk in one workspace.</h1>
          <p className="mt-4 max-w-xl text-white/75">Authentication is persisted in Neon through Drizzle, with signed HTTP-only sessions.</p>
        </div>
        <p className="text-sm text-white/70">Copyright 2024 © Wapx PLUS +</p>
      </section>
      <main className="grid place-items-center bg-background/95 p-6">
        <Card className="w-full max-w-md p-6">
          <div className="mb-5 grid grid-cols-2 gap-2">
            <Button asChild variant={!isAdmin ? "default" : "secondary"}>
              <Link href="/login">Customer Login</Link>
            </Button>
            <Button asChild variant={isAdmin ? "default" : "secondary"}>
              <Link href="/login?role=admin">Admin Login</Link>
            </Button>
          </div>
          <h2 className="text-2xl font-black tracking-normal">{isAdmin ? "Admin login" : "Customer login"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{isAdmin ? "Manage products, customers, orders, and logs." : "Manage your wallet, services, orders, and support requests."}</p>
          {params.error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">Invalid login details.</p> : null}
          <form action={loginAction} className="mt-5 grid gap-4">
            <input type="hidden" name="role" value={isAdmin ? "admin" : "customer"} />
            <label className="grid gap-2 text-sm font-bold">
              Email Address
              <Input name="email" type="email" defaultValue={isAdmin ? "admin@proxtools.test" : "user@proxtools.test"} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Password
              <Input name="password" type="password" defaultValue={isAdmin ? "admin12345" : "user12345"} required />
            </label>

            <SubmitButton defaultText="Login" pendingText="Logging in..." />
          </form>
          <div className="mt-4 flex justify-between gap-3 text-sm">
            <Link className="font-semibold text-primary no-underline" href="/forgot-password">Forgot password?</Link>
            <Link className="font-semibold text-primary no-underline" href="/register">Create account</Link>
          </div>
        </Card>
      </main>
    </div>
  );
}

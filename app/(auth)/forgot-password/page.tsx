import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams;

  return (
    <main className="auth-background auth-canvas grid min-h-screen place-items-center p-5 sm:p-6">
      <Card className="auth-panel relative w-full max-w-md overflow-hidden bg-[#f4efe5]/92 p-6 backdrop-blur-xl sm:p-8">
        <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">account recovery</p>
        <h1 className="auth-display mt-2 text-4xl font-black leading-none tracking-normal text-slate-950">Reset password.</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">Enter your email and Brevo will send the reset notification when configured.</p>
        {params.sent ? <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700">Reset email queued.</p> : null}
        <form action={forgotPasswordAction} className="mt-6 grid gap-4">
          <label className="auth-field grid gap-2 text-sm font-black text-slate-800">Email Address<Input name="email" type="email" required /></label>
          <Button type="submit">Send Reset Link</Button>
        </form>
        <Link className="mt-5 block text-sm font-black text-primary no-underline hover:underline" href="/login">Back to login</Link>
        </div>
      </Card>
    </main>
  );
}

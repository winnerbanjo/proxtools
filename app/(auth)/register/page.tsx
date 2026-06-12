import Link from "next/link";
import { registerAction } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export default function RegisterPage() {
  return (
    <main className="auth-background auth-canvas grid min-h-screen place-items-center p-5 sm:p-6">
      <Card className="auth-panel relative w-full max-w-lg overflow-hidden bg-[#f4efe5]/92 p-6 backdrop-blur-xl sm:p-8">
        <div className="relative">
          <span className="auth-mark grid size-12 place-items-center rounded-md bg-[#f05238] font-black text-slate-950">P</span>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.24em] text-primary">customer onboarding</p>
          <h1 className="auth-display mt-2 text-4xl font-black leading-none tracking-normal text-slate-950">Create your account.</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">Set up your ProxTools customer account and start managing wallet services.</p>

          <form action={registerAction} className="mt-6 grid gap-4">
            <label className="auth-field grid gap-2 text-sm font-black text-slate-800">Full Name<Input name="name" placeholder="Your name" required /></label>
            <label className="auth-field grid gap-2 text-sm font-black text-slate-800">Email Address<Input name="email" type="email" placeholder="you@example.com" required /></label>
            <label className="auth-field grid gap-2 text-sm font-black text-slate-800">Phone Number<Input name="phone" placeholder="08012345678" /></label>
            <label className="auth-field grid gap-2 text-sm font-black text-slate-800">Password<Input name="password" type="password" placeholder="At least 8 characters" required /></label>
            <label className="auth-field grid gap-2 text-sm font-black text-slate-800">Confirm Password<Input name="confirm" type="password" required /></label>

            <div className="auth-submit">
              <SubmitButton defaultText="Create Account" pendingText="Creating Account..." />
            </div>
          </form>

          <p className="mt-5 text-sm font-semibold text-muted-foreground">
            Already have an account? <Link className="font-black text-primary no-underline hover:underline" href="/login">Login</Link>
          </p>
        </div>
      </Card>
    </main>
  );
}

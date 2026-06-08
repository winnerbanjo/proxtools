import Link from "next/link";
import { registerAction } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Card className="w-full max-w-md p-6">
        <span className="grid size-11 place-items-center rounded-md bg-gradient-to-br from-teal-400 to-blue-600 font-black text-white">P</span>
        <h1 className="mt-5 text-2xl font-black tracking-normal">Create customer account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Set up your ProxTools customer account and start managing wallet services.</p>

        <form action={registerAction} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">Full Name<Input name="name" placeholder="Your name" required /></label>
          <label className="grid gap-2 text-sm font-bold">Email Address<Input name="email" type="email" placeholder="you@example.com" required /></label>
          <label className="grid gap-2 text-sm font-bold">Phone Number<Input name="phone" placeholder="08012345678" /></label>
          <label className="grid gap-2 text-sm font-bold">Password<Input name="password" type="password" placeholder="At least 8 characters" required /></label>
          <label className="grid gap-2 text-sm font-bold">Confirm Password<Input name="confirm" type="password" required /></label>

          {/* The hook inside this component automatically tracks the form above it */}
          <SubmitButton defaultText="Create Account" pendingText="Creating Account..." />
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link className="font-semibold text-primary no-underline" href="/login">Login</Link>
        </p>
      </Card>
    </main>
  );
}
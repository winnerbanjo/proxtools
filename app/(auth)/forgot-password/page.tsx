import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-black tracking-normal">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your email and Brevo will send the reset notification when configured.</p>
        {params.sent ? <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700">Reset email queued.</p> : null}
        <form action={forgotPasswordAction} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">Email Address<Input name="email" type="email" required /></label>
          <Button type="submit">Send Reset Link</Button>
        </form>
        <Link className="mt-4 block text-sm font-semibold text-primary no-underline" href="/login">Back to login</Link>
      </Card>
    </main>
  );
}

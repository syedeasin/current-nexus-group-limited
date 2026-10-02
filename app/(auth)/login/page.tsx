import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthHeading, AuthNotice } from "../auth-ui";
import LoginForm from "./login-form";

export const metadata = {
  title: "Sign In | CNX Energy",
  robots: { index: false, follow: false },
};

const NOTICES: Record<string, string> = {
  reset: "Your password has been changed. Sign in with the new one.",
  welcome: "Your password is set. Sign in to get started.",
  signedout: "You've been signed out.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { notice } = await searchParams;
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <>
      <AuthHeading eyebrow="CurrentNexus Group" title="Dashboard sign in">
        Welcome back. Sign in with your email address or username.
      </AuthHeading>
      {message && <AuthNotice tone="success">{message}</AuthNotice>}
      <LoginForm />
    </>
  );
}

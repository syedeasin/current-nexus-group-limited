import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata = {
  title: "Sign In | CNX Energy",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-2 px-16">
      <div className="w-full max-w-md rounded-16 border border-neutral-10 bg-white p-40">
        <p className="mb-8 text-p4 font-semibold uppercase tracking-[2px] text-primary">
          CurrentNexus Group
        </p>
        <h1 className="mb-32 text-h4 font-extralight uppercase tracking-tight text-neutral-1">
          Dashboard Login
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthHeading } from "../auth-ui";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata = {
  title: "Forgot password | CNX Energy",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  if (await getCurrentUser()) redirect("/dashboard/settings?tab=security");

  return (
    <>
      <AuthHeading eyebrow="Account recovery" title="Forgot password">
        Enter the email address or username you sign in with and we&apos;ll email you a link to choose a new password.
      </AuthHeading>
      <ForgotPasswordForm />
    </>
  );
}

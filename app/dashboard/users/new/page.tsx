import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/email";
import UserForm from "../user-form";

export default async function NewUserPage() {
  await requirePageAccess("user.manage");

  return (
    <div className="max-w-[960px]">
      <Link
        href="/dashboard/users"
        className="mb-20 inline-flex items-center gap-8 text-p4 font-medium text-neutral-5 transition-colors duration-200 hover:text-primary"
      >
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
        All users
      </Link>
      <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Team</p>
      <h1 className="mb-32 mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">New user</h1>
      <UserForm mode="create" emailEnabled={isEmailConfigured()} />
    </div>
  );
}

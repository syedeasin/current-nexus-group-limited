"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { Camera, Trash2 } from "lucide-react";
import FieldLabel from "@/components/dashboard/form/field-label";
import FieldHint from "@/components/dashboard/form/field-hint";
import FieldError from "@/components/dashboard/form/field-error";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import UserAvatar from "@/components/dashboard/user-avatar";
import RoleBadge from "@/components/dashboard/role-badge";
import { cardClass, cardTitleClass, noticeClass, primaryButtonClass, secondaryButtonClass } from "@/components/dashboard/ui-classes";
import { updateProfile, uploadAvatar, type FormResult } from "./actions";

type Props = {
  user: { name: string; email: string; username: string | null; bio: string | null; avatarUrl: string | null; role: Role };
};

export default function ProfileForm({ user }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setAvatarError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    try {
      const uploaded = await uploadAvatar(formData);
      if (uploaded.ok) setAvatarUrl(uploaded.url);
      else setAvatarError(uploaded.error);
    } catch {
      setAvatarError("The photo could not be uploaded. Use an image under 4MB and try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const next = await updateProfile(new FormData(e.currentTarget));
      setResult(next);
      if (next.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "Couldn't reach the server. Check your connection and try again." });
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cardClass} aria-labelledby="profile-title">
      <h2 id="profile-title" className={cardTitleClass}>
        Your profile
      </h2>
      <p className="mt-6 text-p4 font-light text-neutral-5">How you appear across the dashboard.</p>

      {result && (
        <div role={result.ok ? "status" : "alert"} className={`mt-20 ${result.ok ? noticeClass.success : noticeClass.error}`}>
          {result.ok ? result.message : result.error}
        </div>
      )}

      <div className="mt-24 flex flex-wrap items-center gap-20 rounded-12 bg-surface-2 p-20">
        <UserAvatar name={name || user.name} avatarUrl={avatarUrl || null} size="xl" className="ring-4 ring-white" />
        <div className="min-w-0 flex-1">
          <p className="text-p3 font-medium text-neutral-1">Profile photo</p>
          <p className="text-p4 font-light text-neutral-5">Square JPG, PNG or WebP, up to 4MB.</p>
          <div className="mt-12 flex flex-wrap gap-8">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={secondaryButtonClass}>
              <Camera size={15} strokeWidth={1.75} aria-hidden="true" />
              {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button type="button" onClick={() => setAvatarUrl("")} disabled={uploading} className={secondaryButtonClass}>
                <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
          {avatarError && (
            <p role="alert" className="mt-8 text-p4 text-error">
              {avatarError}
            </p>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input type="hidden" name="avatarUrl" value={avatarUrl} />
      </div>

      <div className="mt-24 grid gap-20 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel htmlFor="name" required>
            Full name
          </FieldLabel>
          <TextInput
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          <FieldError id="name-error">{fieldErrors.name}</FieldError>
        </div>
        <div>
          <FieldLabel htmlFor="email" required>
            Email address
          </FieldLabel>
          <TextInput
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={["email-hint", fieldErrors.email && "email-error"].filter(Boolean).join(" ")}
          />
          <FieldHint id="email-hint">You sign in with this, and password emails go here.</FieldHint>
          <FieldError id="email-error">{fieldErrors.email}</FieldError>
        </div>
        <div>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <div className="relative">
            <span aria-hidden="true" className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 text-p3 text-neutral-6">
              @
            </span>
            <TextInput
              id="username"
              name="username"
              defaultValue={user.username ?? ""}
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              className="pl-36"
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={["username-hint", fieldErrors.username && "username-error"].filter(Boolean).join(" ")}
            />
          </div>
          <FieldHint id="username-hint">Optional shortcut for signing in.</FieldHint>
          <FieldError id="username-error">{fieldErrors.username}</FieldError>
        </div>
        <div className="md:col-span-2">
          <FieldLabel htmlFor="bio">Short bio</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            aria-describedby="bio-hint"
          />
          <FieldHint id="bio-hint">{500 - bio.length} characters left.</FieldHint>
          <FieldError>{fieldErrors.bio}</FieldError>
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center gap-12 rounded-12 border border-neutral-10 px-16 py-12">
          <span className="text-p4 font-medium text-neutral-4">Your role</span>
          <RoleBadge role={user.role} />
          <span className="text-p4 font-light text-neutral-5">Only an Admin can change roles.</span>
        </div>
      </div>

      <button type="submit" disabled={pending || uploading} className={`${primaryButtonClass} mt-28`}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

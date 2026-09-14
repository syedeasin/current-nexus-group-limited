"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createFilterGroup,
  updateFilterGroup,
  deleteFilterGroup,
  createFilterOption,
  updateFilterOption,
  deleteFilterOption,
  type TaxonomyResult,
  type SimpleTaxonomyResult,
} from "@/app/dashboard/downloads/filters/actions";

export type OptionView = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  downloadCount: number;
};

export type GroupView = {
  id: string;
  name: string;
  slug: string;
  locale: "EN" | "FR";
  sortOrder: number;
  isActive: boolean;
  /** Distinct downloads tagged through any option in this group. */
  taggedDownloads: number;
  options: OptionView[];
};

const INPUT =
  "w-full rounded-8 border border-neutral-10 bg-white px-12 py-8 text-p4 text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-5 focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const LABEL = "mb-4 block text-p4 font-medium text-neutral-5";
const BTN_PRIMARY =
  "rounded-full bg-primary px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";
const BTN_GHOST =
  "rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DANGER =
  "rounded-full border border-error px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-error transition-colors duration-200 hover:bg-error/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60";

function Errors({
  error,
  fieldErrors,
}: {
  error: string | null;
  fieldErrors: Record<string, string>;
}) {
  const details = [...new Set(Object.values(fieldErrors))];
  if (!error && details.length === 0) return null;
  return (
    <p role="alert" className="mt-8 text-p4 text-error">
      {details.length > 0 ? details.join(" ") : error}
    </p>
  );
}

function ActiveToggle({ defaultChecked, id }: { defaultChecked: boolean; id: string }) {
  return (
    <label htmlFor={id} className="flex items-center gap-8 whitespace-nowrap text-p4 text-neutral-4">
      <input
        id={id}
        type="checkbox"
        name="isActive"
        defaultChecked={defaultChecked}
        className="h-16 w-16 rounded-4 border-neutral-10 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      Active
    </label>
  );
}

function NewGroupForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    startTransition(async () => {
      const result: TaxonomyResult = await createFilterGroup(formData);
      if (result.ok) {
        formRef.current?.reset();
        setError(null);
        setFieldErrors({});
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${BTN_PRIMARY} inline-flex items-center gap-8`}>
        <Plus size={13} strokeWidth={2} aria-hidden="true" />
        New group
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="rounded-16 border border-neutral-10 bg-white p-24"
    >
      <h2 className="mb-16 text-p2 font-medium text-neutral-1">New filter group</h2>
      <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={LABEL} htmlFor="new-group-name">
            Name
          </label>
          <input id="new-group-name" name="name" className={INPUT} placeholder="Documents type" />
        </div>
        <div>
          <label className={LABEL} htmlFor="new-group-slug">
            Slug
          </label>
          <input id="new-group-slug" name="slug" className={INPUT} placeholder="auto from name" />
        </div>
        <div>
          <label className={LABEL} htmlFor="new-group-locale">
            Locale
          </label>
          <select id="new-group-locale" name="locale" defaultValue="EN" className={INPUT}>
            <option value="EN">English</option>
            <option value="FR">French</option>
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="new-group-order">
            Sort order
          </label>
          <input
            id="new-group-order"
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={0}
            className={INPUT}
          />
        </div>
      </div>
      <div className="mt-16 flex flex-wrap items-center gap-12">
        <ActiveToggle id="new-group-active" defaultChecked />
        <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
          {isPending ? "Creating…" : "Create group"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={BTN_GHOST}>
          Cancel
        </button>
      </div>
      <Errors error={error} fieldErrors={fieldErrors} />
    </form>
  );
}

function OptionRow({ option }: { option: OptionView }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    startTransition(async () => {
      const result = await updateFilterOption(option.id, formData);
      if (result.ok) {
        setError(null);
        setFieldErrors({});
        router.refresh();
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result: SimpleTaxonomyResult = await deleteFilterOption(option.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="border-b border-neutral-10 px-16 py-12 last:border-b-0"
    >
      <div className="flex flex-wrap items-end gap-12">
        <div className="min-w-160 flex-1">
          <label className={LABEL} htmlFor={`option-name-${option.id}`}>
            Name
          </label>
          <input
            id={`option-name-${option.id}`}
            name="name"
            defaultValue={option.name}
            className={INPUT}
          />
        </div>
        <div className="min-w-160 flex-1">
          <label className={LABEL} htmlFor={`option-slug-${option.id}`}>
            Slug
          </label>
          <input
            id={`option-slug-${option.id}`}
            name="slug"
            defaultValue={option.slug}
            className={INPUT}
          />
        </div>
        <div className="w-96">
          <label className={LABEL} htmlFor={`option-order-${option.id}`}>
            Order
          </label>
          <input
            id={`option-order-${option.id}`}
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={option.sortOrder}
            className={INPUT}
          />
        </div>
        <div className="pb-8">
          <ActiveToggle id={`option-active-${option.id}`} defaultChecked={option.isActive} />
        </div>
        <p className="whitespace-nowrap pb-8 text-p4 font-light text-neutral-5">
          {option.downloadCount} tagged
        </p>
        <div className="flex items-center gap-8 pb-2">
          <button type="submit" disabled={isPending} className={BTN_GHOST}>
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className={confirming ? `${BTN_DANGER} bg-error/10` : BTN_DANGER}
          >
            {confirming ? `Confirm — untags ${option.downloadCount}` : "Delete"}
          </button>
          {confirming && (
            <button type="button" onClick={() => setConfirming(false)} className={BTN_GHOST}>
              Cancel
            </button>
          )}
        </div>
      </div>
      <Errors error={error} fieldErrors={fieldErrors} />
    </form>
  );
}

function NewOptionForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    startTransition(async () => {
      const result = await createFilterOption(formData);
      if (result.ok) {
        formRef.current?.reset();
        setError(null);
        setFieldErrors({});
        router.refresh();
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="bg-surface-2 px-16 py-12"
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="isActive" value="true" />
      <div className="flex flex-wrap items-end gap-12">
        <div className="min-w-160 flex-1">
          <label className={LABEL} htmlFor={`new-option-name-${groupId}`}>
            New option
          </label>
          <input
            id={`new-option-name-${groupId}`}
            name="name"
            placeholder="Datasheets"
            className={INPUT}
          />
        </div>
        <div className="min-w-160 flex-1">
          <label className={LABEL} htmlFor={`new-option-slug-${groupId}`}>
            Slug
          </label>
          <input
            id={`new-option-slug-${groupId}`}
            name="slug"
            placeholder="auto from name"
            className={INPUT}
          />
        </div>
        <div className="w-96">
          <label className={LABEL} htmlFor={`new-option-order-${groupId}`}>
            Order
          </label>
          <input
            id={`new-option-order-${groupId}`}
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={0}
            className={INPUT}
          />
        </div>
        <div className="pb-2">
          <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
            {isPending ? "Adding…" : "Add option"}
          </button>
        </div>
      </div>
      <Errors error={error} fieldErrors={fieldErrors} />
    </form>
  );
}

function GroupCard({ group }: { group: GroupView }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    startTransition(async () => {
      const result = await updateFilterGroup(group.id, formData);
      if (result.ok) {
        setError(null);
        setFieldErrors({});
        router.refresh();
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteFilterGroup(group.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      <form ref={formRef} noValidate onSubmit={handleSubmit} className="border-b border-neutral-10 p-24">
        <div className="mb-16 flex flex-wrap items-baseline justify-between gap-8">
          <h2 className="text-p2 font-medium text-neutral-1">
            {group.name}
            {!group.isActive && (
              <span className="ml-8 text-p4 font-medium uppercase tracking-[1px] text-warning">
                Inactive
              </span>
            )}
          </h2>
          <p className="text-p4 font-light text-neutral-5">
            {group.options.length} {group.options.length === 1 ? "option" : "options"} ·{" "}
            {group.taggedDownloads} tagged {group.taggedDownloads === 1 ? "download" : "downloads"}
          </p>
        </div>

        <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={LABEL} htmlFor={`group-name-${group.id}`}>
              Name
            </label>
            <input
              id={`group-name-${group.id}`}
              name="name"
              defaultValue={group.name}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor={`group-slug-${group.id}`}>
              Slug
            </label>
            <input
              id={`group-slug-${group.id}`}
              name="slug"
              defaultValue={group.slug}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor={`group-locale-${group.id}`}>
              Locale
            </label>
            <select
              id={`group-locale-${group.id}`}
              name="locale"
              defaultValue={group.locale}
              className={INPUT}
            >
              <option value="EN">English</option>
              <option value="FR">French</option>
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor={`group-order-${group.id}`}>
              Sort order
            </label>
            <input
              id={`group-order-${group.id}`}
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              defaultValue={group.sortOrder}
              className={INPUT}
            />
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-12">
          <ActiveToggle id={`group-active-${group.id}`} defaultChecked={group.isActive} />
          <button type="submit" disabled={isPending} className={BTN_GHOST}>
            {isPending ? "Saving…" : "Save group"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className={confirming ? `${BTN_DANGER} bg-error/10` : BTN_DANGER}
          >
            {confirming ? "Confirm delete" : "Delete group"}
          </button>
          {confirming && (
            <button type="button" onClick={() => setConfirming(false)} className={BTN_GHOST}>
              Cancel
            </button>
          )}
        </div>

        {confirming && (
          <p
            role="alert"
            className="mt-12 rounded-8 border border-error bg-error/5 px-16 py-12 text-p4 text-error"
          >
            Deleting &ldquo;{group.name}&rdquo; also deletes {group.options.length}{" "}
            {group.options.length === 1 ? "option" : "options"} and removes the tags from{" "}
            {group.taggedDownloads} {group.taggedDownloads === 1 ? "download" : "downloads"}. The
            documents themselves are kept. This cannot be undone.
          </p>
        )}

        <Errors error={error} fieldErrors={fieldErrors} />
      </form>

      <div>
        {group.options.length === 0 ? (
          <p className="px-16 py-16 text-p4 font-light text-neutral-5">
            No options yet — add the first one below.
          </p>
        ) : (
          group.options.map((option) => <OptionRow key={option.id} option={option} />)
        )}
      </div>

      <NewOptionForm groupId={group.id} />
    </div>
  );
}

export default function FiltersManager({ groups }: { groups: GroupView[] }) {
  return (
    <div className="space-y-24">
      <NewGroupForm />
      {groups.length === 0 ? (
        <div className="rounded-16 border border-dashed border-neutral-10 bg-white px-32 py-64 text-center">
          <p className="text-h6 font-extralight tracking-[-0.2px] text-neutral-1">
            No filter groups yet
          </p>
          <p className="mx-auto mt-12 max-w-sm text-p3 font-light leading-relaxed text-neutral-5">
            Groups are the facets shown beside the public downloads list — for example
            &ldquo;Documents type&rdquo; or &ldquo;Product family&rdquo;.
          </p>
        </div>
      ) : (
        groups.map((group) => <GroupCard key={group.id} group={group} />)
      )}
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import FieldLabel from "@/components/dashboard/form/field-label";
import FieldError from "@/components/dashboard/form/field-error";
import FieldHint from "@/components/dashboard/form/field-hint";
import TextInput from "@/components/dashboard/form/text-input";
import Textarea from "@/components/dashboard/form/textarea";
import Select from "@/components/dashboard/form/select";
import { noticeClass, primaryButtonClass, secondaryButtonClass } from "@/components/dashboard/ui-classes";

/**
 * Inline create / edit / delete list for a simple taxonomy (news categories,
 * tags). Each item is a row; "Edit" swaps the row for the same form "New"
 * uses, so there is one form to learn.
 */

export type TaxonomyField =
  | { name: string; label: string; kind: "text"; required?: boolean; hint?: string; maxLength?: number; span?: "full" }
  | { name: string; label: string; kind: "textarea"; hint?: string; maxLength?: number; span?: "full" }
  | { name: string; label: string; kind: "number"; hint?: string }
  | { name: string; label: string; kind: "select"; hint?: string; options: { value: string; label: string }[]; span?: "full" };

export type TaxonomyItem = {
  id: string;
  values: Record<string, string>;
  /** Cells rendered for the row, in column order. */
  cells: ReactNode[];
  /** Shown in the delete confirmation, e.g. "3 posts will become uncategorised." */
  deleteWarning?: string;
};

type Result = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

type Props = {
  noun: string;
  columns: string[];
  fields: TaxonomyField[];
  defaults: Record<string, string>;
  items: TaxonomyItem[];
  emptyText: string;
  onCreate: (formData: FormData) => Promise<Result>;
  onUpdate: (id: string, formData: FormData) => Promise<Result>;
  onDelete: (id: string) => Promise<Result>;
};

function TaxonomyForm({
  noun,
  fields,
  values,
  editingId,
  submit,
  onCancel,
}: {
  noun: string;
  fields: TaxonomyField[];
  values: Record<string, string>;
  editingId: string | null;
  submit: (formData: FormData) => Promise<Result>;
  onCancel: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const next = await submit(new FormData(e.currentTarget));
      setResult(next);
    } catch {
      setResult({ ok: false, error: "Couldn't save. Check your connection and try again." });
    }
    setPending(false);
  }

  const prefix = editingId ?? "new";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-16 bg-surface-2 p-20 lg:p-24">
      {result && !result.ok && (
        <div role="alert" className={noticeClass.error}>
          {result.error}
        </div>
      )}
      <div className="grid gap-16 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => {
          const id = `${prefix}-${field.name}`;
          const error = errors[field.name];
          const describedBy = [field.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
          const spanFull = "span" in field && field.span === "full";
          return (
            <div key={field.name} className={spanFull ? "md:col-span-2 xl:col-span-3" : ""}>
              <FieldLabel htmlFor={id} required={field.kind === "text" && field.required}>
                {field.label}
              </FieldLabel>
              {field.kind === "textarea" ? (
                <Textarea id={id} name={field.name} rows={2} defaultValue={values[field.name]} maxLength={field.maxLength} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
              ) : field.kind === "select" ? (
                <Select id={id} name={field.name} defaultValue={values[field.name]} aria-invalid={Boolean(error)} aria-describedby={describedBy}>
                  {field.options
                    .filter((option) => option.value !== editingId)
                    .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextInput
                  id={id}
                  name={field.name}
                  type={field.kind === "number" ? "number" : "text"}
                  min={field.kind === "number" ? 0 : undefined}
                  defaultValue={values[field.name]}
                  maxLength={field.kind === "text" ? field.maxLength : undefined}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy}
                />
              )}
              {field.hint && <FieldHint id={`${id}-hint`}>{field.hint}</FieldHint>}
              <FieldError id={`${id}-error`}>{error}</FieldError>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-12">
        <button type="submit" disabled={pending} className={`${primaryButtonClass} px-20 py-10 text-p4`}>
          {pending ? "Saving…" : editingId ? "Save changes" : `Add ${noun}`}
        </button>
        <button type="button" onClick={onCancel} className="text-p4 font-medium text-neutral-5 underline-offset-4 hover:text-neutral-1 hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function TaxonomyManager({
  noun,
  columns,
  fields,
  defaults,
  items,
  emptyText,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  function done(text: string) {
    setNotice({ ok: true, text });
    setCreating(false);
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string, label: string) {
    setDeletingId(id);
    try {
      const result = await onDelete(id);
      if (result.ok) {
        setConfirmingId(null);
        done(`Deleted “${label}”.`);
      } else {
        setNotice({ ok: false, text: result.error });
      }
    } catch {
      setNotice({ ok: false, text: "Couldn't delete. Check your connection and try again." });
    }
    setDeletingId(null);
  }

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-12 border-b border-neutral-10 px-20 py-14">
        <p role="status" className={`text-p4 ${notice ? (notice.ok ? "text-success" : "text-error") : "text-neutral-5"}`}>
          {notice?.text ?? `${items.length} ${items.length === 1 ? noun : `${noun === "category" ? "categories" : `${noun}s`}`}`}
        </p>
        {!creating && (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
              setNotice(null);
            }}
            className={`${primaryButtonClass} px-20 py-10 text-p4`}
          >
            <Plus size={15} strokeWidth={2} aria-hidden="true" />
            New {noun}
          </button>
        )}
      </div>

      {creating && (
        <div className="border-b border-neutral-10">
          <TaxonomyForm
            noun={noun}
            fields={fields}
            values={defaults}
            editingId={null}
            submit={async (formData) => {
              const result = await onCreate(formData);
              if (result.ok) done(`Added the new ${noun}.`);
              return result;
            }}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {items.length === 0 ? (
        <p className="px-32 py-56 text-center text-p3 font-light text-neutral-5">{emptyText}</p>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-10 bg-surface-2">
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-20 py-14 text-left text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                    {column}
                  </th>
                ))}
                <th scope="col" className="px-20 py-14">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) =>
                editingId === item.id ? (
                  <tr key={item.id} className="border-b border-neutral-10">
                    <td colSpan={columns.length + 1} className="p-0">
                      <TaxonomyForm
                        noun={noun}
                        fields={fields}
                        values={item.values}
                        editingId={item.id}
                        submit={async (formData) => {
                          const result = await onUpdate(item.id, formData);
                          if (result.ok) done(`Saved “${formData.get("name")}”.`);
                          return result;
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="border-b border-neutral-10 align-top transition-colors duration-200 last:border-b-0 hover:bg-surface-2">
                    {item.cells.map((cell, i) => (
                      <td key={i} className="px-20 py-14 text-p4 text-neutral-4">
                        {cell}
                      </td>
                    ))}
                    <td className="px-20 py-14">
                      {confirmingId === item.id ? (
                        <div className="flex flex-col items-end gap-8 text-right">
                          {item.deleteWarning && <p className="max-w-[260px] text-p4 text-warning">{item.deleteWarning}</p>}
                          <div className="flex items-center gap-8">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.values.name)}
                              disabled={deletingId === item.id}
                              className="rounded-full bg-error px-14 py-6 text-p4 font-semibold text-white transition-colors duration-200 hover:bg-error/90 disabled:opacity-60"
                            >
                              {deletingId === item.id ? "Deleting…" : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              aria-label="Cancel delete"
                              className="flex h-32 w-32 items-center justify-center rounded-full text-neutral-5 hover:bg-neutral-11"
                            >
                              <X size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-8">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setCreating(false);
                              setNotice(null);
                            }}
                            className={`${secondaryButtonClass} px-14 py-6`}
                            aria-label={`Edit ${item.values.name}`}
                          >
                            <Pencil size={14} strokeWidth={1.75} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(item.id)}
                            className="flex h-34 w-34 items-center justify-center rounded-full border border-neutral-10 text-neutral-5 transition-colors duration-200 hover:border-error hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                            aria-label={`Delete ${item.values.name}`}
                          >
                            <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

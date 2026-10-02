import Link from "next/link";
import type { InquiryStatus, Prisma } from "@prisma/client";
import { Download, Inbox, Mail, Phone, Building2, Globe2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import { INQUIRY_TOPIC_LABELS, isInquiryTopic } from "@/lib/inquiries/topics";
import { cardClass, secondaryButtonClass } from "@/components/dashboard/ui-classes";
import { formatDateTime, formatRelative } from "../users/user-status";
import InquiryActionsBar from "./inquiry-actions-bar";
import SubscriberDeleteButton from "./subscriber-delete-button";

type SearchParams = { view?: string; box?: string; id?: string };

const BOXES: { key: "inbox" | "archived"; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "archived", label: "Archived" },
];

function topicLabel(topic: string | null): string {
  return topic && isInquiryTopic(topic) ? INQUIRY_TOPIC_LABELS[topic] : "General";
}

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requirePageAccess("inquiry.manage");
  const sp = await searchParams;
  const view = sp.view === "newsletter" ? "newsletter" : "messages";

  const [newCount, messageCount, subscriberCount] = await Promise.all([
    prisma.inquiry.count({ where: { kind: "CONTACT", status: "NEW" } }),
    prisma.inquiry.count({ where: { kind: "CONTACT", status: { not: "ARCHIVED" } } }),
    prisma.inquiry.count({ where: { kind: "NEWSLETTER" } }),
  ]);

  return (
    <div>
      <div className="mb-32">
        <p className="text-p4 font-semibold uppercase tracking-[2px] text-primary">Website</p>
        <h1 className="mt-12 text-h4 font-extralight uppercase leading-none tracking-[-0.5px] text-neutral-1">Inquiries</h1>
        <p className="mt-8 max-w-[680px] text-p3 font-light text-neutral-5">
          Messages from the Contact page and newsletter sign-ups from the footer.
          {newCount > 0 ? ` ${newCount} unread.` : ""}
        </p>
      </div>

      <nav aria-label="Inquiry views" className="mb-24 flex gap-4 border-b border-neutral-10">
        {[
          { key: "messages", label: `Messages (${messageCount})`, href: "/dashboard/inquiries" },
          { key: "newsletter", label: `Newsletter (${subscriberCount})`, href: "/dashboard/inquiries?view=newsletter" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={view === tab.key ? "page" : undefined}
            className={[
              "-mb-px border-b-2 px-16 py-12 text-p4 font-semibold uppercase tracking-[1.5px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
              view === tab.key ? "border-primary text-primary" : "border-transparent text-neutral-5 hover:text-neutral-1",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {view === "newsletter" ? <NewsletterList /> : <Messages sp={sp} />}
    </div>
  );
}

async function Messages({ sp }: { sp: SearchParams }) {
  const box = sp.box === "archived" ? "archived" : "inbox";
  const where: Prisma.InquiryWhereInput = {
    kind: "CONTACT",
    status: box === "archived" ? "ARCHIVED" : { in: ["NEW", "READ"] as InquiryStatus[] },
  };

  const messages = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, email: true, company: true, topic: true, message: true, status: true, createdAt: true },
  });

  const selected = sp.id
    ? await prisma.inquiry.findFirst({ where: { id: sp.id, kind: "CONTACT" } })
    : messages[0]
      ? await prisma.inquiry.findUnique({ where: { id: messages[0].id } })
      : null;

  const listHref = box === "archived" ? "/dashboard/inquiries?box=archived" : "/dashboard/inquiries";
  const hrefFor = (id: string) => `${listHref}${listHref.includes("?") ? "&" : "?"}id=${id}`;

  return (
    <div className="grid items-start gap-24 xl:grid-cols-[400px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
        <div className="flex gap-4 border-b border-neutral-10 p-8">
          {BOXES.map((b) => (
            <Link
              key={b.key}
              href={b.key === "archived" ? "/dashboard/inquiries?box=archived" : "/dashboard/inquiries"}
              aria-current={box === b.key ? "page" : undefined}
              className={`flex-1 rounded-8 px-12 py-8 text-center text-p4 font-medium transition-colors duration-200 ${
                box === b.key ? "bg-surface-1 text-primary" : "text-neutral-5 hover:bg-surface-2"
              }`}
            >
              {b.label}
            </Link>
          ))}
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-12 px-24 py-56 text-center">
            <Inbox size={28} strokeWidth={1.25} aria-hidden="true" className="text-neutral-7" />
            <p className="text-p4 text-neutral-5">
              {box === "archived" ? "Nothing archived." : "No messages yet. They arrive here from the Contact page."}
            </p>
          </div>
        ) : (
          <ul className="max-h-[70vh] divide-y divide-neutral-10 overflow-y-auto">
            {messages.map((m) => {
              const active = selected?.id === m.id;
              return (
                <li key={m.id}>
                  <Link
                    href={hrefFor(m.id)}
                    aria-current={active ? "true" : undefined}
                    className={`block px-20 py-16 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                      active ? "bg-surface-1/70" : "hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-8">
                      {m.status === "NEW" && (
                        <span className="h-8 w-8 shrink-0 rounded-full bg-secondary">
                          <span className="sr-only">Unread</span>
                        </span>
                      )}
                      <span className={`min-w-0 flex-1 truncate text-p4 ${m.status === "NEW" ? "font-semibold text-neutral-1" : "text-neutral-3"}`}>
                        {m.name ?? m.email}
                      </span>
                      <span className="shrink-0 text-[12px] text-neutral-6">{formatRelative(m.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-[12px] font-semibold uppercase tracking-[1px] text-primary/80">{topicLabel(m.topic)}</p>
                    <p className="mt-4 line-clamp-2 text-p4 font-light text-neutral-5">{m.message}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected ? (
        <article className={cardClass} aria-labelledby="inquiry-heading">
          <div className="flex flex-wrap items-start justify-between gap-12">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[2px] text-primary">{topicLabel(selected.topic)}</p>
              <h2 id="inquiry-heading" className="mt-6 text-h5 font-light text-neutral-1">
                {selected.name ?? selected.email}
              </h2>
              <p className="mt-4 text-p4 text-neutral-5">
                {formatDateTime(selected.createdAt)} · {selected.locale} site
                {selected.sourcePath ? ` · sent from ${selected.sourcePath}` : ""}
              </p>
            </div>
          </div>

          <dl className="mt-20 grid gap-12 rounded-12 bg-surface-2 p-16 sm:grid-cols-2">
            {[
              { icon: Mail, label: "Email", value: selected.email, href: `mailto:${selected.email}` },
              selected.phone && { icon: Phone, label: "Phone", value: selected.phone, href: `tel:${selected.phone.replace(/[^\d+]/g, "")}` },
              selected.company && { icon: Building2, label: "Company", value: selected.company },
              { icon: Globe2, label: "Language", value: selected.locale === "FR" ? "French" : "English" },
            ]
              .filter((row): row is { icon: typeof Mail; label: string; value: string; href?: string } => Boolean(row))
              .map((row) => (
                <div key={row.label} className="flex items-center gap-10">
                  <row.icon size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-neutral-6" />
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-[1.5px] text-neutral-6">{row.label}</dt>
                    <dd className="truncate text-p4 text-neutral-2">
                      {row.href ? (
                        <a href={row.href} className="hover:text-primary hover:underline">
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
          </dl>

          <div className="mt-24 whitespace-pre-wrap break-words text-p3 font-light leading-relaxed text-neutral-2">{selected.message}</div>

          <div className="mt-28 border-t border-neutral-10 pt-20">
            <InquiryActionsBar
              id={selected.id}
              status={selected.status}
              listHref={listHref}
              markReadOnOpen={Boolean(sp.id)}
              replyHref={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: your enquiry to CNX Energy — ${topicLabel(selected.topic)}`)}`}
            />
          </div>
        </article>
      ) : (
        <div className="hidden rounded-16 border border-dashed border-neutral-10 bg-white p-48 text-center text-p4 text-neutral-5 xl:block">
          Select a message to read it.
        </div>
      )}
    </div>
  );
}

async function NewsletterList() {
  const subscribers = await prisma.inquiry.findMany({
    where: { kind: "NEWSLETTER" },
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: { id: true, email: true, locale: true, createdAt: true, sourcePath: true },
  });

  return (
    <div className="overflow-hidden rounded-16 border border-neutral-10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-12 border-b border-neutral-10 px-20 py-14">
        <p className="text-p4 text-neutral-5">
          {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"} from the footer sign-up form.
        </p>
        {subscribers.length > 0 && (
          // A plain link: the CSV is a file download, not a client-side navigation.
          <a href="/dashboard/inquiries/export" className={secondaryButtonClass} download>
            <Download size={15} strokeWidth={1.75} aria-hidden="true" />
            Export CSV
          </a>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p className="px-32 py-56 text-center text-p3 font-light text-neutral-5">No sign-ups yet.</p>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-10 bg-surface-2">
                {["Email", "Language", "Signed up", "Page"].map((h) => (
                  <th key={h} scope="col" className="px-20 py-14 text-left text-p4 font-semibold uppercase tracking-[2px] text-neutral-5">
                    {h}
                  </th>
                ))}
                <th scope="col" className="px-20 py-14">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-neutral-10 last:border-b-0 hover:bg-surface-2">
                  <td className="px-20 py-12 text-p4 text-neutral-1">{s.email}</td>
                  <td className="px-20 py-12 text-p4 font-semibold uppercase tracking-[1.5px] text-neutral-5">{s.locale}</td>
                  <td className="whitespace-nowrap px-20 py-12 text-p4 text-neutral-5">{formatDateTime(s.createdAt)}</td>
                  <td className="px-20 py-12 font-mono text-[13px] text-neutral-5">{s.sourcePath ?? "—"}</td>
                  <td className="px-20 py-12 text-right">
                    <SubscriberDeleteButton id={s.id} email={s.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

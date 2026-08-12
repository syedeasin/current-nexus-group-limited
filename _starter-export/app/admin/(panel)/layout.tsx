export default function AdminPanelLayout({
  children,
  nav,
}: {
  children: React.ReactNode
  /** Slot for your sidebar nav — originally a hardcoded <AdminNav /> tied to this project's taxonomy. */
  nav?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream/40 flex">
      {nav}
      <main className="flex-1">{children}</main>
    </div>
  )
}

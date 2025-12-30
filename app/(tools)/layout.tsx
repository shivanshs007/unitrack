import Link from "next/link";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-100">
      <nav className="navbar bg-base-200/50 backdrop-blur-md px-4 border-b border-base-content/10">
        <div className="flex-1">
          <Link href="/" className="text-xl font-bold text-primary">
            Unitrack
          </Link>
        </div>
        <div className="flex-none gap-2">
          <Link href="/flights" className="btn btn-ghost btn-sm">
            Flights
          </Link>
          <Link href="/trains" className="btn btn-ghost btn-sm">
            Trains
          </Link>
        </div>
      </nav>
      <div className="container mx-auto max-w-2xl p-6">{children}</div>
    </div>
  );
}

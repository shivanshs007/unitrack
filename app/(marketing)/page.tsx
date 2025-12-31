import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-base-200">
      <h1 className="text-5xl font-bold tracking-tight">Unitrack</h1>
      <div className="flex gap-4">
        
        <Link href="/flights" className="btn btn-primary btn-lg">Track Flights</Link>
        <Link href="/trains" className="btn btn-soft btn-lg">Track Trains</Link>
        <Link href="/person" className="btn btn-soft btn-lg">Track Person</Link> 

      </div>
    </main>
  );
}
import FlightSearchForm from "@/components/FlightSearchForm";

export default function FlightPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="prose">
        <h1>Live Flight Status</h1>
        <p className="text-base-content/70">Enter your flight number below to get real-time tracking.</p>
      </div>
      <FlightSearchForm />
    </div>
  );
}
import TrainSearchForm from "@/components/TrainSearchForm";

export default function TrainPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="prose">
        <h1>Live Train Status</h1>
        <p className="text-base-content/70">Enter the 5-digit train number to check live running status.</p>
      </div>
      <TrainSearchForm />
    </div>
  );
}
"use client";

import { useActionState } from "react"; // React 19 Location
import { trackFlight } from "@/actions/track-flight";
import { FlightSearchState } from "@/lib/validators";

const formatTimeToIST = (timeString: string) => {
  if (!timeString) return "--:--";

  try {
   
    const date = new Date(timeString);

    if (isNaN(date.getTime())) {
      return timeString;
    }

    
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    
    const period = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes} ${period}`;
  } catch {
    return timeString;
  }
};

const initialState: FlightSearchState = { message: "", errors: {} };

export default function FlightSearchForm() {
  const [state, formAction, isPending] = useActionState(
    trackFlight,
    initialState
  );

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm w-full">
      <div className="card-body">
        <h2 className="card-title">Track a Flight</h2>

        <form action={formAction} className="flex flex-col gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Flight Number</legend>
            <input
              name="flightNumber"
              type="text"
              placeholder="e.g. 6E204"
              className={`input w-full ${
                state.errors?.flightNumber ? "input-error" : ""
              }`}
            />
            {state.errors?.flightNumber && (
              <span className="fieldset-label text-error">
                {state.errors.flightNumber[0]}
              </span>
            )}
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            {isPending ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Track Flight"
            )}
          </button>
        </form>

        {state.message === "Flight Found" && state.data && (
          <div className="mt-6 w-full max-w-md">
            <div className="stats shadow w-full bg-base-100 border border-base-200">
              <div className="stat place-items-center">
                <div className="stat-title">Status</div>
                <div
                  className={`stat-value text-2xl uppercase ${
                    state.data.status === "active"
                      ? "text-success"
                      : "text-neutral"
                  }`}
                >
                  {state.data.status}
                </div>
                <div className="stat-desc">{state.data.flight}</div>
              </div>

              <div className="stat place-items-center">
                <div className="stat-title">Arrival (IST)</div>
                <div className="stat-value text-2xl">
                  {formatTimeToIST(state.data.eta)}
                </div>
                <div className="stat-desc truncate max-w-[100px]">
                  {state.data.arrival}
                </div>
              </div>
            </div>
          </div>
        )}

        {state.message !== "Flight Found" &&
          state.message !== "" &&
          !state.errors && (
            <div role="alert" className="alert alert-warning mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{state.message}</span>
            </div>
          )}
      </div>
    </div>
  );
}

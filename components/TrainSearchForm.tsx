'use client'

import { useActionState } from "react";
import { trackTrain } from "@/actions/track-train";
import { TrainSearchState } from "@/lib/validators";

const initialState: TrainSearchState = { message: '', errors: {} };

export default function TrainSearchForm() {
  const [state, formAction, isPending] = useActionState(trackTrain, initialState);

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm w-full">
      <div className="card-body">
        <h2 className="card-title text-secondary">Track a Train</h2>
        
        <form action={formAction} className="flex flex-col gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Train Number</legend>
            <input 
              name="trainNumber" 
              type="text" 
              placeholder="e.g. 19202" 
              className={`input w-full ${state.errors?.trainNumber ? 'input-error' : ''}`} 
            />
            {state.errors?.trainNumber && (
              <span className="fieldset-label text-error">{state.errors.trainNumber[0]}</span>
            )}
          </fieldset>

          <button type="submit" className="btn btn-secondary" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner"></span> : 'Check Live Status'}
          </button>
        </form>

        {state.message === 'Train Found' && state.data && (
           <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-4">
             {/* Header Info */}
             <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg">{state.data.trainName}</h3>
                    <span className="badge badge-neutral badge-sm">{state.data.trainNumber}</span>
                </div>
                <div className="text-right">
                    <span className="text-xs text-base-content/60 block">Last Updated</span>
                    <span className="font-mono text-xs">{state.data.lastUpdated}</span>
                </div>
             </div>

             {/* Stats Grid */}
             <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200/50 border border-base-200">
               
               <div className="stat">
                 <div className="stat-title">Current Location</div>
                 <div className="stat-value text-lg text-secondary truncate" title={state.data.currentStation}>
                    {state.data.currentStation}
                 </div>
                 <div className="stat-desc font-bold text-secondary/80">{state.data.currentStatus}</div>
               </div>
               
               <div className="stat">
                 <div className="stat-title">Delay</div>
                 <div className={`stat-value text-2xl ${state.data.delay > 15 ? 'text-error' : 'text-success'}`}>
                   {state.data.delay === 0 ? 'On Time' : `+${state.data.delay} min`}
                 </div>
                 <div className="stat-desc">
                    {state.data.delay > 15 ? 'Running Late' : 'Good Run'}
                 </div>
               </div>
               
             </div>
           </div>
        )}

        {state.message !== 'Train Found' && state.message !== '' && !state.errors && (
          <div role="alert" className="alert alert-warning mt-4">
            <span>{state.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
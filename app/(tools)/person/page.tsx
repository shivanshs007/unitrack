'use client'

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'; // Critical for Map
import { createRoom, joinRoom, syncLocation } from '@/actions/track-person';

// Dynamically import Map to disable SSR (Server Side Rendering)
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function PersonPage() {
  const [step, setStep] = useState<'LOGIN' | 'TRACKING'>('LOGIN');
  const [mode, setMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Tracking State
  const [memberId, setMemberId] = useState('');
  const [members, setMembers] = useState<any[]>([]);

  // 1. Handle Start (Get GPS -> Call Server)
  const handleStart = () => {
    if (!name) return setError("Name is required");
    if (mode === 'JOIN' && pin.length !== 6) return setError("Enter valid 6-digit PIN");
    
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setLoading(false);
      return setError("Geolocation is not supported by your browser");
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      let res;

      if (mode === 'CREATE') {
        res = await createRoom(name, latitude, longitude);
        if (res.success && res.pin) setPin(res.pin);
      } else {
        res = await joinRoom(pin, name, latitude, longitude);
      }

      if (res.success && res.memberId) {
        setMemberId(res.memberId);
        setStep('TRACKING');
      } else {
        setError(res.error || "Failed to start");
      }
      setLoading(false);
    }, (err) => {
      setLoading(false);
      setError("GPS Access Denied. Please allow location access.");
    });
  };

  // 2. The Polling Loop (Every 5 seconds)
  useEffect(() => {
    if (step !== 'TRACKING' || !memberId) return;

    // Immediate initial sync
    const pulse = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        syncLocation(memberId, pos.coords.latitude, pos.coords.longitude)
          .then(res => {
            if (res.success && res.members) setMembers(res.members);
          });
      });
    };

    pulse(); // Run once immediately
    const interval = setInterval(pulse, 5000); // Run every 5s

    return () => clearInterval(interval);
  }, [step, memberId]);

  // --- UI RENDER ---

  if (step === 'LOGIN') {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto mt-10">
        <div className="prose text-center">
          <h1>Person Tracking</h1>
          <p>Share your live location securely using a PIN.</p>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            {/* Toggle Mode */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-base-200 rounded-lg mb-4">
              <button 
                className={`btn btn-sm ${mode === 'CREATE' ? 'btn-white shadow' : 'btn-ghost'}`}
                onClick={() => setMode('CREATE')}
              >Create Room</button>
              <button 
                className={`btn btn-sm ${mode === 'JOIN' ? 'btn-white shadow' : 'btn-ghost'}`}
                onClick={() => setMode('JOIN')}
              >Join Room</button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Your Name</span></label>
                <input 
                  type="text" placeholder="e.g. Shivansh" className="input input-bordered"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>

              {mode === 'JOIN' && (
                <div className="form-control animate-in fade-in slide-in-from-top-2">
                  <label className="label"><span className="label-text">Room PIN</span></label>
                  <input 
                    type="text" placeholder="6-Digit PIN" className="input input-bordered tracking-widest font-mono"
                    maxLength={6}
                    value={pin} onChange={e => setPin(e.target.value)}
                  />
                </div>
              )}

              <button 
                className="btn btn-primary w-full mt-2" 
                onClick={handleStart}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : (mode === 'CREATE' ? 'Generate PIN & Start' : 'Join Map')}
              </button>

              {error && <div className="alert alert-error text-sm py-2">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TRACKING VIEW
  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar */}
      <div className="navbar bg-base-100 shadow-sm rounded-box border border-base-200">
        <div className="flex-1">
          <div>
            <div className="text-xs text-base-content/50 uppercase font-bold">Room PIN</div>
            <div className="text-2xl font-mono font-bold text-primary tracking-widest">{pin}</div>
          </div>
        </div>
        <div className="flex-none">
          <div className="badge badge-neutral gap-2 p-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            {members.length} Online
          </div>
          <button className="btn btn-sm btn-ghost text-error ml-2" onClick={() => window.location.reload()}>
            Leave
          </button>
        </div>
      </div>

      <LiveMap members={members} myId={memberId} />

      {/* Member List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-base-100 rounded-lg border border-base-200 shadow-sm">
            <div className={`avatar placeholder ${m.id === memberId ? 'online' : ''}`}>
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-lg">{m.name[0].toUpperCase()}</span>
              </div>
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                {m.name}
                {m.id === memberId && <span className="badge badge-xs badge-primary">YOU</span>}
              </div>
              <div className="text-xs opacity-60">
                Lat: {m.latitude.toFixed(4)}, Lng: {m.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
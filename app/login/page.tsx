'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Connects to your .env.local keys automatically
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Access Denied. Incorrect credentials.");
    } else {
      // If successful, redirect to the private dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-center font-sans p-6 selection:bg-[#D4AF37] selection:text-black">
      <div className="w-full max-w-sm border border-[#2A2A2A] bg-[#141414] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tighter uppercase text-[#D4AF37] mb-2 text-center">
          Command Center
        </h1>
        <p className="text-[#8B8B8B] font-mono text-xs uppercase text-center mb-8">
          Identify Yourself
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase text-[#FAFAFA] mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#FAFAFA] mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37] transition-colors"
              required
            />
          </div>

          {error && <p className="text-[#8B0000] text-sm font-mono">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-[#D4AF37] text-black font-bold py-3 uppercase tracking-widest hover:bg-[#b5952f] transition-colors mt-4"
          >
            Authenticate
          </button>
        </form>
      </div>
    </main>
  );
}


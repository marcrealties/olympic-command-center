'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function LogForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Transmitting...');

    const formData = new FormData(e.currentTarget);
    const logData = {
      log_date: formData.get('date'),
      morning_session: formData.get('morning_session'),
      evening_session: formData.get('evening_session'),
      rehab_done: formData.get('rehab_done') === 'on',
      rpe: parseInt(formData.get('rpe') as string),
      pain_level: parseInt(formData.get('pain_level') as string),
      notes: formData.get('notes'),
    };

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setStatus('Error: Unauthorized');
      setLoading(false);
      return;
    }

    // 1. Send data to the 'logs' table
    const { error } = await supabase.from('logs').insert({
      user_id: user.id,
      ...logData
    });

    if (error) {
      if (error.code === '23505') {
        setStatus('Error: You already logged execution for this date.');
      } else {
        setStatus(`Error: ${error.message}`);
      }
    } else {
      // 2. STREAK ENGINE: Fetch current streak, add 1, and update profile
      const { data: profile } = await supabase.from('profiles').select('current_streak, longest_streak').eq('id', user.id).single();
      
      const newStreak = (profile?.current_streak || 0) + 1;
      const newLongest = Math.max(newStreak, profile?.longest_streak || 0);

      await supabase.from('profiles').update({
        current_streak: newStreak,
        longest_streak: newLongest
      }).eq('id', user.id);

      setStatus('Day secured. Streak updated. Reloading...');
      
      // Refresh the page so the dashboard sees the new streak
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-[#FAFAFA]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Execution Date</label>
          <input type="date" name="date" required className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37]" />
        </div>
        
        <div>
          <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Overall RPE (1-10)</label>
          <input type="number" name="rpe" min="1" max="10" required className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Morning Session</label>
        <textarea name="morning_session" rows={2} required className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37]" placeholder="e.g., 5000m pacing drills..."></textarea>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Evening Session</label>
        <textarea name="evening_session" rows={2} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37]" placeholder="e.g., Heavy squats, mobility..."></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border border-[#2A2A2A] bg-[#0A0A0A] p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" name="rehab_done" className="w-5 h-5 accent-[#D4AF37] bg-black border-[#2A2A2A]" />
          <span className="text-sm font-medium uppercase tracking-wider text-[#D4AF37]">Knee Rehab & VMO Isolation Done</span>
        </label>

        <div>
          <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Joint Pain Level (1-10)</label>
          <input type="number" name="pain_level" min="1" max="10" required className="w-full bg-[#141414] border border-[#2A2A2A] text-white p-2 focus:outline-none focus:border-[#D4AF37]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Psychological Notes</label>
        <textarea name="notes" rows={2} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37]" placeholder="Mindset, fatigue, friction points..."></textarea>
      </div>

      <button disabled={loading} type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-4 uppercase tracking-widest hover:bg-[#b5952f] transition-colors disabled:opacity-50">
        {loading ? 'Transmitting...' : 'Log Execution'}
      </button>

      {status && <p className="text-center font-mono text-sm mt-4 text-[#D4AF37]">{status}</p>}
    </form>
  );
}
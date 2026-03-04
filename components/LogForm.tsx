'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function LogForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // Tracking your core metrics
  const [rpe, setRpe] = useState(5);
  const [pain, setPain] = useState(1);
  const [rehab, setRehab] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [user, setUser] = useState<any>(null);

  // --- AUTOMATIC DATE LOGIC ---
  const [executionDate, setExecutionDate] = useState('');

  useEffect(() => {
    // Sets the preset date to Today (YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0];
    setExecutionDate(today);
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setStatus('Error: Not Logged In');
    setLoading(true);

    let videoUrl = '';

    if (videoFile) {
      const fileName = `${Date.now()}-${videoFile.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('rehab-clips')
        .upload(fileName, videoFile);

      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('rehab-clips')
          .getPublicUrl(data.path);
        videoUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('logs').insert([
      { 
        log_date: executionDate, // Uses the automated date
        rpe, 
        pain_level: pain, 
        rehab_done: rehab, 
        video_url: videoUrl,
        user_id: user.id 
      }
    ]);

    setLoading(false);
    if (!error) {
      setStatus('Success! Protocol Synced.');
      window.location.reload();
    } else {
      setStatus('Sync Failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-[#FAFAFA]">
      
      {/* AUTO-DATE INPUT */}
      <div>
        <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Execution Date</label>
        <input 
          type="date" 
          value={executionDate}
          onChange={(e) => setExecutionDate(e.target.value)}
          required 
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37] font-mono" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Overall RPE (1-10)</label>
          <input 
            type="number" 
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
            min="1" max="10" required 
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white p-3 focus:outline-none focus:border-[#D4AF37]" 
          />
        </div>
        
        <div>
          <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2">Joint Pain Level (1-10)</label>
          <input 
            type="number" 
            value={pain}
            onChange={(e) => setPain(Number(e.target.value))}
            min="1" max="10" required 
            className="w-full bg-[#141414] border border-[#2A2A2A] text-white p-2 focus:outline-none focus:border-[#D4AF37]" 
          />
        </div>
      </div>

      <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={rehab}
            onChange={(e) => setRehab(e.target.checked)}
            className="w-5 h-5 accent-[#D4AF37] bg-black border-[#2A2A2A]" 
          />
          <span className="text-sm font-medium uppercase tracking-wider text-[#D4AF37]">Knee Rehab & VMO Isolation Done</span>
        </label>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-[#8B8B8B] mb-2 text-[#D4AF37]">Archive Technical Analysis Clip</label>
        <input 
          type="file" 
          accept="video/*" 
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] p-3 text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-[#D4AF37] file:text-black cursor-pointer" 
        />
      </div>

      <button disabled={loading} type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-4 uppercase tracking-widest hover:bg-[#b5952f] transition-colors disabled:opacity-50">
        {loading ? 'Transmitting...' : 'Log Execution'}
      </button>

      {status && <p className="text-center font-mono text-sm mt-4 text-[#D4AF37]">{status}</p>}
    </form>
  );
}
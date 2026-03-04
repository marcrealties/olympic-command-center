'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams } from 'next/navigation';

export default function PublicAccountabilityPage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchPublicProfile() {
      if (!params?.username) return;
      const targetUsername = decodeURIComponent(params.username as string);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, identity_statement, current_streak, longest_streak')
        .ilike('username', targetUsername)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    fetchPublicProfile();
  }, [params, supabase]);

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#D4AF37] font-mono uppercase tracking-widest">Locating Athlete...</div>;

  if (!profile) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#FAFAFA] font-sans p-6">
      <h1 className="text-4xl font-bold text-[#8B0000] uppercase tracking-widest mb-4">Target Not Found</h1>
      <p className="text-[#8B8B8B] font-mono">This athlete does not exist in the discipline registry.</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-center font-sans p-6">
      <div className="w-full max-w-2xl border border-[#2A2A2A] bg-[#141414] p-8 shadow-2xl text-center">
        <p className="text-[#8B8B8B] font-mono text-sm uppercase mb-6 tracking-widest border-b border-[#2A2A2A] pb-4 inline-block px-8">
          Public Accountability Matrix
        </p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-[#FAFAFA] mb-2">
          {profile.identity_statement}
        </h1>
        <p className="text-[#D4AF37] font-mono text-lg mb-12 uppercase tracking-widest">
          Athlete: {profile.username}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
            <h3 className="text-xs font-mono text-[#8B8B8B] uppercase mb-2 tracking-widest">Current Streak</h3>
            <div className="text-7xl font-bold text-white mb-2">{profile.current_streak}</div>
          </div>
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
            <h3 className="text-xs font-mono text-[#8B8B8B] uppercase mb-2 tracking-widest">Longest Streak</h3>
            <div className="text-7xl font-bold text-[#8B8B8B] mb-2">{profile.longest_streak}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { LogForm } from '@/components/LogForm';
import { Analytics } from '@/components/Analytics';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [scoreData, setScoreData] = useState({ score: 0, tier: 'CALCULATING...', color: 'text-[#8B8B8B]' });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // Fetch last 30 logs
      const { data: logData } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(30);
      
      if (logData) {
        setLogs(logData);
        calculateScore(logData, profileData?.current_streak || 0);
      }
    }
    fetchData();
  }, [supabase]);

  // DISCIPLINE SCORE ENGINE
  const calculateScore = (recentLogs: any[], currentStreak: number) => {
    if (recentLogs.length === 0) return;

    const daysLogged = recentLogs.length;
    const rehabDays = recentLogs.filter(log => log.rehab_done).length;
    
    const trainingCompletion = 100; // Assuming if a log exists, training was done
    const rehabCompletion = (rehabDays / daysLogged) * 100;
    
    // Cap streak factor at 30 days for this calculation
    const streakFactor = Math.min((currentStreak / 30) * 100, 100);

    const rawScore = (trainingCompletion * 0.5) + (rehabCompletion * 0.2) + (streakFactor * 0.3);
    const finalScore = parseFloat(rawScore.toFixed(1));

    let tier = 'BRONZE';
    let color = 'text-[#CD7F32]';

    if (finalScore >= 95) { tier = 'ELITE'; color = 'text-[#D4AF37]'; }
    else if (finalScore >= 85) { tier = 'GOLD'; color = 'text-yellow-500'; }
    else if (finalScore >= 70) { tier = 'SILVER'; color = 'text-[#C0C0C0]'; }

    setScoreData({ score: finalScore, tier, color });
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] p-6 md:p-12 font-sans selection:bg-[#D4AF37] selection:text-black">
      
      <header className="border-b border-[#2A2A2A] pb-6 mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-[#D4AF37]">
            {profile?.identity_statement || 'I am building an Olympic Champion.'}
          </h1>
          <p className="text-[#8B8B8B] font-mono text-sm uppercase mt-2 tracking-widest">
            Athlete: {profile?.username || 'Authenticating...'} // Status: Active
          </p>
        </div>
        
        <div className="text-right font-mono bg-[#141414] border border-[#2A2A2A] p-3">
          <div className="text-xs text-[#8B8B8B] mb-1">2026 OLYMPICS</div>
          <div className="text-xl text-white">T-MINUS <span className="text-[#D4AF37]">338</span> DAYS</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & History */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          <div className="border border-[#2A2A2A] bg-[#141414] p-8 shadow-2xl">
            <h2 className="text-xl font-mono text-[#FAFAFA] mb-6 border-b border-[#2A2A2A] pb-2 uppercase tracking-widest">
              Daily Execution
            </h2>
            <LogForm />
          </div>

          {/* EXECUTION HISTORY LOG */}
          <div className="border border-[#2A2A2A] bg-[#141414] p-8 shadow-2xl">
            <h2 className="text-xl font-mono text-[#FAFAFA] mb-6 border-b border-[#2A2A2A] pb-2 uppercase tracking-widest">
              Execution History
            </h2>
            {logs.length === 0 ? (
              <p className="text-[#8B8B8B] font-mono text-sm">No execution data found.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-[#D4AF37] pl-4 py-2 bg-[#0A0A0A] flex justify-between items-center">
                    <div>
                      <p className="font-mono text-sm text-white">{log.log_date}</p>
                      <p className="text-xs text-[#8B8B8B] mt-1">RPE: {log.rpe} | Pain: {log.pain_level}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-mono px-2 py-1 ${log.rehab_done ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                        {log.rehab_done ? 'REHAB: DONE' : 'REHAB: FAILED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        {/* ANALYTICS ENGINE */}
          <div className="border border-[#2A2A2A] bg-[#141414] p-8 shadow-2xl">
            <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-2 mb-6">
              <h2 className="text-xl font-mono text-[#FAFAFA] uppercase tracking-widest">
                Load vs. Pain Matrix
              </h2>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-[#D4AF37]">● RPE</span>
                <span className="text-[#8B0000]">● PAIN</span>
              </div>
            </div>
            <Analytics logs={logs} />
          </div>

        {/* Right Column: Streaks & Score */}
        <div className="col-span-1 space-y-8">
          
          <div className="border border-[#2A2A2A] bg-[#141414] p-6 shadow-2xl text-center">
            <h3 className="text-sm font-mono text-[#8B8B8B] uppercase mb-2 tracking-widest">Current Streak</h3>
            <div className="text-6xl font-bold text-white mb-2">
              {profile ? profile.current_streak : '0'}
            </div>
            <p className="text-xs text-[#D4AF37] uppercase tracking-wider">Days of Relentless Execution</p>
          </div>

          <div className="border border-[#2A2A2A] bg-[#141414] p-6 shadow-2xl">
            <h3 className="text-sm font-mono text-[#8B8B8B] uppercase mb-4 tracking-widest">Discipline Score</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-5xl font-bold ${scoreData.color}`}>{scoreData.score}</span>
              <span className="text-lg text-white font-mono pb-1">/ 100</span>
            </div>
            <p className={`text-sm font-bold tracking-widest uppercase ${scoreData.color}`}>{scoreData.tier} RANK</p>
            <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-2">
              <p className="text-xs text-[#8B8B8B] font-mono flex justify-between">
                <span>Training Compliance:</span> <span className="text-white">50% WGT</span>
              </p>
              <p className="text-xs text-[#8B8B8B] font-mono flex justify-between">
                <span>Rehab Compliance:</span> <span className="text-white">20% WGT</span>
              </p>
              <p className="text-xs text-[#8B8B8B] font-mono flex justify-between">
                <span>Streak Factor:</span> <span className="text-white">30% WGT</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
'use client';

import { VideoVault } from '@/components/VideoVault';
import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { LogForm } from '@/components/LogForm';
import { Analytics } from '@/components/Analytics';
import { Zap, Activity, Trophy, ShieldCheck, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [scoreData, setScoreData] = useState({ score: 0, tier: 'CALCULATING...', color: 'text-zinc-500' });

  // DYNAMIC 2030 COUNTDOWN LOGIC
  const daysTo2030 = useMemo(() => {
    const olympicDate = new Date('2030-02-08T00:00:00'); // Estimated 2030 Opening Ceremony
    const today = new Date();
    const diffInTime = olympicDate.getTime() - today.getTime();
    return Math.ceil(diffInTime / (1000 * 3600 * 24));
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

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

  const calculateScore = (recentLogs: any[], currentStreak: number) => {
    if (recentLogs.length === 0) return;
    const daysLogged = recentLogs.length;
    const rehabDays = recentLogs.filter(log => log.rehab_done).length;
    const rehabCompletion = (rehabDays / daysLogged) * 100;
    const streakFactor = Math.min((currentStreak / 30) * 100, 100);
    const rawScore = (100 * 0.5) + (rehabCompletion * 0.2) + (streakFactor * 0.3);
    const finalScore = parseFloat(rawScore.toFixed(1));

    let tier = 'BRONZE';
    let color = 'text-orange-500';
    if (finalScore >= 95) { tier = 'ELITE'; color = 'text-[#D4AF37]'; }
    else if (finalScore >= 85) { tier = 'GOLD'; color = 'text-yellow-400'; }
    else if (finalScore >= 70) { tier = 'SILVER'; color = 'text-zinc-300'; }
    setScoreData({ score: finalScore, tier, color });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#FAFAFA] p-4 md:p-10 font-sans">
      
      {/* HUD HEADER - UPDATED FOR 2030 */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} className="text-[#D4AF37]" />
            <span className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase italic">Winter Games 2030 Protocol</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
            {profile?.identity_statement || '2030 Olympic Prospect'}
          </h1>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1 justify-center">
              <Clock size={10} /> Road to 2030
            </p>
            <p className="text-xl font-bold text-white uppercase tracking-tighter">T-{daysTo2030} DAYS</p>
          </div>
          <div className="h-10 w-[1px] bg-zinc-800"></div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Status</p>
            <p className="text-xl font-bold text-green-500 uppercase italic">Elite Active</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* STATS ROW */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-[#D4AF37]">
              <Zap size={80} />
            </div>
            <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Cycle Streak</h3>
            <div className="text-5xl font-black text-white">{profile?.current_streak || 0} <span className="text-sm font-normal text-zinc-500 uppercase tracking-tighter">Days Clean</span></div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={80} className={scoreData.color} />
            </div>
            <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Discipline Score</h3>
            <div className={`text-5xl font-black ${scoreData.color}`}>{scoreData.score} <span className="text-sm font-normal text-zinc-500">/ 100</span></div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
              <Activity size={80} />
            </div>
            <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">World Rank Tier</h3>
            <div className={`text-5xl font-black ${scoreData.color}`}>{scoreData.tier}</div>
          </div>
        </section>

        {/* LOGGING COLUMN */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
               <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400">Log Daily Execution</h2>
             </div>
             <LogForm />
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-8">
             <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6 italic">Long-term Load vs. Pain Matrix</h2>
             <Analytics logs={logs} />
          </div>

          {/* TECHNICAL ANALYSIS VAULT */}
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-8 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400">
                Technical & Rehab Analysis
              </h2>
              <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded font-mono uppercase">
                Coach Sync Active
              </span>
            </div>
            <VideoVault logs={logs} />
          </div>
        </section>

        {/* HISTORY COLUMN */}
        <section className="lg:col-span-4">
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-8 sticky top-10">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-6">Execution History</h2>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="group border-b border-zinc-800/50 pb-4 last:border-0 hover:bg-zinc-900/10 transition-colors rounded p-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono text-zinc-500 uppercase">{log.log_date}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.rehab_done ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {log.rehab_done ? 'REHAB DONE' : 'REHAB FAILED'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-300">RPE: {log.rpe} | Pain: {log.pain_level}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
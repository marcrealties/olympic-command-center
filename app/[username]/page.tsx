'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// --- MOTIVATIONAL REGISTRY ---
const DAILY_THOUGHTS = [
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "Under pressure, you don't rise to the occasion. You sink to the level of your training.",
  "The only way to finish is to start.",
  "Suffer the pain of discipline or suffer the pain of regret.",
  "Champions are made when no one is watching."
];

export default function PublicAccountabilityPage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState("");

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Pick a quote based on the current date
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(DAILY_THOUGHTS[dayOfYear % DAILY_THOUGHTS.length]);

    async function fetchPublicProfile() {
      if (!params?.username) return;
      const targetUsername = decodeURIComponent(params.username as string);
      const { data } = await supabase
        .from('profiles')
        .select('username, identity_statement, current_streak, longest_streak')
        .ilike('username', targetUsername)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    fetchPublicProfile();
  }, [params, supabase]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#D4AF37] font-mono tracking-widest uppercase">Initializing Matrix...</div>;

  return (
    <main className="min-h-[200vh] bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <AnimatePresence>
        <div className="max-w-5xl mx-auto px-6">
          
          {/* --- HERO SECTION (FADES OUT ON SCROLL) --- */}
          <motion.section 
            style={{ opacity, scale }}
            className="sticky top-0 h-screen flex flex-col justify-center items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <p className="text-[#D4AF37] font-mono text-xs tracking-[0.4em] uppercase mb-8">
                Daily Athlete Briefing
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 italic">
                "{dailyQuote}"
              </h1>
              <div className="w-px h-24 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto" />
            </motion.div>
          </motion.section>

          {/* --- STATS SECTION (REVEALS ON SCROLL) --- */}
          <section className="relative z-10 py-32">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-20"
            >
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-4">
                {profile?.identity_statement}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Active Streak', value: profile?.current_streak },
                { label: 'Record Streak', value: profile?.longest_streak }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800 rounded-[3rem] p-12 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">{stat.label}</p>
                  <div className="text-9xl font-bold tracking-tighter">{stat.value}</div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>
      </AnimatePresence>
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37] selection:text-black overflow-hidden">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"
              />
              <p className="font-mono text-xs uppercase tracking-[0.5em] text-[#D4AF37] animate-pulse">
                Syncing Matrix...
              </p>
            </div>
          </motion.div>
        ) : !profile ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          >
            <h1 className="text-5xl font-bold text-[#8B0000] tracking-tighter mb-4">TARGET_NOT_FOUND</h1>
            <p className="text-zinc-500 font-mono text-sm max-w-xs">The requested athlete profile is not registered in the accountability registry.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto px-6 py-20 md:py-32"
          >
            {/* Header Section */}
            <motion.header 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-20 text-center md:text-left"
            >
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block text-[#D4AF37] font-mono text-xs tracking-[0.4em] uppercase mb-6"
              >
                Public Accountability Matrix
              </motion.span>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight mb-4">
                {profile.identity_statement}
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl font-medium tracking-tight">
                Athlete Registry ID: <span className="text-white font-mono">{profile.username}</span>
              </p>
            </motion.header>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Active Streak', value: profile.current_streak, accent: '#FAFAFA' },
                { label: 'All-Time Peak', value: profile.longest_streak, accent: '#3F3F46' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + (i * 0.1), duration: 0.8 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-900/30 backdrop-blur-2xl p-10 md:p-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">
                    {stat.label}
                  </h3>
                  
                  <div className="flex items-baseline gap-4">
                    <span className="text-8xl md:text-9xl font-bold tracking-tighter" style={{ color: stat.accent }}>
                      {stat.value}
                    </span>
                    <span className="text-sm font-mono text-zinc-600 uppercase tracking-widest">Days</span>
                  </div>

                  {/* Visual Indicator Line */}
                  <div className="mt-8 h-[1px] w-full bg-zinc-800 overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ delay: 1.2, duration: 1.5, ease: "circOut" }}
                      className="h-full w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
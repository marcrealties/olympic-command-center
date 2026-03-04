'use client';

import { Play, FileVideo, UserCheck } from 'lucide-react';

export function VideoVault({ logs }: { logs: any[] }) {
  // Only show logs that actually have a video attached
  const videoLogs = logs.filter(log => log.video_url);

  if (videoLogs.length === 0) {
    return (
      <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center bg-zinc-900/10">
        <FileVideo className="mx-auto text-zinc-700 mb-4" size={48} />
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
           Vault Empty: Archive skating technique for review
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videoLogs.map((log) => (
        <div key={log.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="aspect-video bg-black relative flex items-center justify-center">
             <video 
               src={log.video_url} 
               controls 
               className="w-full h-full object-contain"
             />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase">{log.log_date}</span>
              <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                <UserCheck size={12} /> Coach Review Ready
              </span>
            </div>
            <p className="text-sm text-zinc-300">
               RPE: {log.rpe} | Pain: {log.pain_level}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
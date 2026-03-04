'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Analytics({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return <div className="text-[#8B8B8B] font-mono text-sm h-48 flex items-center justify-center">Awaiting execution data to render charts.</div>;
  }

  // We reverse the logs so the chart reads left to right (oldest to newest)
  const chartData = [...logs].reverse().map(log => ({
    date: log.log_date.substring(5), // Shows MM-DD
    RPE: log.rpe,
    Pain: log.pain_level
  }));

  return (
    <div className="h-64 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
          <XAxis dataKey="date" stroke="#8B8B8B" tick={{fontSize: 12, fontFamily: 'monospace'}} />
          <YAxis stroke="#8B8B8B" tick={{fontSize: 12, fontFamily: 'monospace'}} domain={[0, 10]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#141414', borderColor: '#2A2A2A', color: '#FAFAFA', fontFamily: 'monospace', fontSize: '12px' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="RPE" name="Training RPE" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4, fill: '#D4AF37' }} />
          <Line type="monotone" dataKey="Pain" name="Joint Pain" stroke="#8B0000" strokeWidth={2} dot={{ r: 4, fill: '#8B0000' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This handles the redirect for your iOS/Static export build
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col items-center gap-8">
        {/* A simple loader while the redirect happens */}
        <Image
          className="dark:invert animate-pulse"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <p className="text-zinc-500 animate-pulse">Loading Command Center...</p>
      </main>
    </div>
  );
}
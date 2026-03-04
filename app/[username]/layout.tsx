// app/[username]/layout.tsx
import { ReactNode } from 'react';

// This tells Next.js to pre-build a folder for your athlete name
export async function generateStaticParams() {
  return [{ username: 'athlete1' }]; 
}

export default function UsernameLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
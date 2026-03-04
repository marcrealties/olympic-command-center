// app/[username]/layout.tsx
import { ReactNode } from 'react';

// This fulfills the static export requirement by providing a starting value
export async function generateStaticParams() {
  return [{ username: 'athlete1' }]; 
}

export default function UsernameLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
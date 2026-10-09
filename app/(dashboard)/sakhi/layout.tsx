import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

export const instant = false;

export default async function SakhiLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}

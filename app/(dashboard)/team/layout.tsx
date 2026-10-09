import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@/types/user';
import { connection } from 'next/server';

export const instant = false;

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.TEAM && session.user.role !== UserRole.ROOT_ADMIN) {
    notFound();
  }

  return <>{children}</>;
}

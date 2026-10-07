import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@/types/user';
import { connection } from 'next/server';

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ROOT_ADMIN) {
    notFound();
  }

  return <>{children}</>;
}

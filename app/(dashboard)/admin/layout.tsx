import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connection } from 'next/server';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@/types/user';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.ROOT_ADMIN) {
    notFound();
  }

  return <>{children}</>;
}

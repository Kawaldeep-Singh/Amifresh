'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole, UserStatus } from '@/types/user';
import connectDB from '@/lib/mongodb';
import { updateUserStatus } from '@/services/user.service';
import { revalidatePath } from 'next/cache';

export async function changeUserStatus(userId: string, newStatus: UserStatus, reason?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
    return { error: 'Unauthorized' };
  }

  try {
    await connectDB();
    await updateUserStatus(userId, newStatus, session.user.id, reason);
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath(`/admin/users`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update status' };
  }
}

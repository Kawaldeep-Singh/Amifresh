'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { update } = useSession();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setServerError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: data.newPassword }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully! Redirecting...');
      
      // Update the session explicitly
      await update({ mustChangePassword: false });

      setTimeout(async () => {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        
        let target = '/dashboard';
        if (session?.user?.role === 'ROOT_ADMIN') {
          target = '/admin/dashboard';
        } else if (session?.user?.role === 'TEAM') {
          target = '/team/dashboard';
        } else if (session?.user?.role === 'SAKHI') {
          target = '/sakhi/dashboard';
        }
        
        // Force reload to update session state
        window.location.href = target;
      }, 2000);
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-text-main">Welcome!</h2>
          <p className="mt-2 text-sm text-text-muted">
            Please set a new password to continue.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
             <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
               {serverError}
             </div>
          )}
          {success && (
             <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-200">
               {success}
             </div>
          )}

          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}

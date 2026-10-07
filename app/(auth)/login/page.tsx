'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');

    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setServerError(result.error);
    } else {
      const session = await getSession();
      if (session?.user?.role === 'ROOT_ADMIN') {
        router.push('/admin');
      } else if (session?.user?.role === 'MANAGER') {
        router.push('/manager');
      } else {
        router.push('/member');
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <div className="mx-auto flex justify-center mb-6">
            <Image src="/Logo.webp" alt="Amifresh Logo" width={200} height={60} className="object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-text-main">Welcome back</h2>
          <p className="mt-2 text-sm text-text-muted">
            Sign in to your Amifresh account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="bg-red-50 text-danger p-3 rounded-md text-sm border border-red-200">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="amifresh@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-main">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

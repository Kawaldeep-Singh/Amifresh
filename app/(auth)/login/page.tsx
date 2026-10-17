'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import {
  User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight
} from 'lucide-react';
import { poppins, nunito } from '@/lib/fonts';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Login ID or Mobile Number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setIsMounted(true);
    document.title = 'Sakhi/ Partner Login';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    try {
      const res = await signIn('credentials', {
        redirect: false,
        loginId: data.identifier,
        password: data.password,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        const session = await getSession();
        if (session?.user?.role === 'ROOT_ADMIN') {
          router.push('/admin/dashboard');
        } else if (session?.user?.role === 'TEAM') {
          router.push('/team/dashboard');
        } else if (session?.user?.role === 'SAKHI') {
          router.push('/sakhi/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (error) {
      setErrorMsg('An unexpected error occurred during login. Please try again.');
    }
  };

  if (!isMounted) return null;

  return (
    <div className={`${nunito.className} relative`}>
      <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#FFFDF7] text-[#1F2937] relative flex flex-col justify-between selection:bg-[#8BC34A]/30 selection:text-[#1B7F4B]">
        
        {/* Clean Input CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          .clean-input {
            height: 46px;
            border-radius: 12px;
            border: 1.5px solid #E8DEC8;
            background-color: #FFFFFF;
            color: #1F2937;
            transition: all 0.2s ease;
            padding-left: 2.5rem;
            padding-right: 2.5rem;
            font-size: 0.875rem;
            width: 100%;
          }
          .clean-input:focus {
            outline: none;
            border-color: #1B7F4B;
            box-shadow: 0 0 0 3px rgba(27, 127, 75, 0.12);
          }
        `}} />

        {/* Decorative Corner Leaf at Bottom Left (-10% size, 50% opacity reduced) */}
        <div className="fixed bottom-0 left-[-15px] pointer-events-none z-0 hidden lg:block select-none opacity-40">
          <img src="/left_leaf.webp" alt="AmiFresh Left Leaf" className="w-[170px] xl:w-[215px] drop-shadow-md" />
        </div>

        {/* Decorative Corner Leaf at Bottom Right (-10% size, 50% opacity reduced) */}
        <div className="fixed bottom-0 right-[-15px] pointer-events-none z-0 hidden lg:block select-none opacity-40">
          <img src="/right_leaf.webp" alt="AmiFresh Right Leaf" className="w-[170px] xl:w-[215px] drop-shadow-md" />
        </div>

        {/* Top Header with Logos (Top Left & Top Right) */}
        <header className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-14 pt-4 sm:pt-6 z-20 flex-shrink-0">
          {/* 👈 Top Left: AmiFresh Logo */}
          <Link href="/" className="inline-block group">
            <div className="relative w-40 sm:w-52 lg:w-60 h-12 sm:h-16 hover:scale-105 transition-transform duration-300">
              <Image 
                src="/dark-logo.webp" 
                alt="AmiFresh" 
                fill 
                className="object-contain object-left" 
                priority 
              />
            </div>
          </Link>

          {/* 👉 Top Right: Sakhi Logo */}
          <div className="relative w-36 sm:w-48 lg:w-56 h-12 sm:h-16 hover:scale-105 transition-transform duration-300">
            <Image 
              src="/Sakhi Light.webp" 
              alt="Sakhi Program" 
              fill 
              className="object-contain object-right" 
              priority 
            />
          </div>
        </header>

        {/* 🎯 Main Area: Login Card in the Center of the Screen (Shifted up by ~16-20px) */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-center z-10 relative">
          <div className="w-full max-w-[460px] xl:max-w-[490px] bg-white rounded-3xl border-[1.5px] border-[#E0D3BC] shadow-[0_24px_70px_rgba(0,0,0,0.09)] overflow-hidden flex flex-col -translate-y-4 sm:-translate-y-5">
            
            {/* Centered Fixed Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-[#F0E6D4] bg-gradient-to-r from-[#FFFDF8] via-[#FFF9EE] to-[#F1FAF3] flex flex-col items-center justify-center text-center flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF9F1C] text-[#1F2937] text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                <Image src="/icon-leaf.webp" alt="" width={12} height={12} className="object-contain" />
                <span>Women Exclusive</span>
              </div>
              <h2 className={`${poppins.className} text-xl sm:text-2xl font-black text-[#1F2937]`}>
                Sakhi / Partner Login
              </h2>
              <p className="text-xs text-[#1B7F4B] font-bold mt-1">
                Sign in to your sales &amp; earnings dashboard
              </p>
            </div>

            {/* Login Form Body */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center animate-in fade-in">
                    {errorMsg}
                  </div>
                )}

                {/* Identifier Field */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    Login ID / Registered Mobile *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('identifier')}
                      type="text"
                      className="clean-input"
                      placeholder="e.g. SAKHI1234 or Mobile No."
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.identifier.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1F2937]">Password *</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-[#1B7F4B] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="clean-input !pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#1B7F4B] to-[#125A33] hover:from-[#166F40] hover:to-[#0C4A28] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_25px_rgba(27,127,75,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Logging In...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Sign In to Dashboard</span>
                        <ArrowRight size={15} />
                      </span>
                    )}
                  </button>
                </div>

                {/* Register Link */}
                <div className="pt-2 text-center border-t border-gray-100">
                  <p className="text-xs text-[#6B7280]">
                    New to AmiFresh Sakhi Program?{' '}
                    <Link href="/join" className="font-extrabold text-[#1B7F4B] hover:underline">
                      Apply / Join Here
                    </Link>
                  </p>
                </div>

              </form>
            </div>

            {/* Footer Security Note */}
            <div className="p-3 bg-[#F1FAF3] border-t border-emerald-100 text-center text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5 flex-shrink-0">
              <ShieldCheck size={14} className="text-[#1B7F4B]" />
              <span>Authorized 256-bit Encrypted Partner Portal • Verified Safe</span>
            </div>

          </div>
        </main>

        {/* Bottom subtle clearance spacer */}
        <div className="h-6 sm:h-8 flex-shrink-0" />
      </div>
    </div>
  );
}

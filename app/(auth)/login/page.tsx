'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  User, Lock, Eye, EyeOff
} from 'lucide-react';
import { Poppins, Nunito, Caveat } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const caveat = Caveat({ subsets: ['latin'], weight: ['700'] });

const loginSchema = z.object({
  identifier: z.string().min(1, 'Required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Social SVGs
const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);
const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [errorMsg, setErrorMsg] = useState('');

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
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setErrorMsg('An unexpected error occurred');
    }
  };

  if (!isMounted) return null;

  return (
    <div>
      <div className={`min-h-screen flex flex-col lg:flex-row ${nunito.className} bg-[#FFF5E4] overflow-hidden`}>

        {/* Global Styles for Animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes sway { 0%, 100% { transform: rotate(-6deg) translateY(0); } 50% { transform: rotate(6deg) translateY(-10px); } }
          @keyframes swayRight { 0%, 100% { transform: rotate(6deg) scaleX(-1) translateY(0); } 50% { transform: rotate(-6deg) scaleX(-1) translateY(-10px); } }
          @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-sway { animation: sway 8s ease-in-out infinite; transform-origin: center; }
          .animate-sway-right { animation: swayRight 9s ease-in-out infinite; transform-origin: center; }
          .animate-slide-up { animation: slideUpFade 0.6s ease-out forwards; }
          
          .input-field {
            height: 46px; border-radius: 12px; border: 1.5px solid #E5E5E5;
            background-color: #FFFBF2; color: #111111; transition: all 0.2s; padding-left: 2.5rem; font-size: 0.875rem;
          }
          .input-field:focus { outline: none; border-color: #FDB94E; box-shadow: 0 0 0 4px rgba(253, 185, 78, 0.15); }
        `}} />

        {/* Decorative Falling Leaves */}
        <img src="/Leaf.webp" className="absolute top-[10%] left-[5%] w-16 opacity-20 animate-sway pointer-events-none hidden lg:block" alt="" />
        <img src="/Leaf.webp" className="absolute top-[60%] left-[30%] w-24 opacity-10 animate-sway pointer-events-none hidden lg:block" style={{ animationDelay: '2s' }} alt="" />
        <img src="/Leaf.webp" className="absolute top-[20%] right-[10%] w-20 opacity-20 animate-sway-right pointer-events-none hidden lg:block" style={{ animationDelay: '1s' }} alt="" />
        <img src="/Leaf.webp" className="absolute bottom-[10%] left-[2%] w-32 opacity-30 animate-sway pointer-events-none hidden lg:block" style={{ animationDelay: '3s' }} alt="" />

        {/* LEFT PANEL */}
        <div className="w-full lg:w-[38%] p-6 lg:p-12 xl:p-16 flex flex-col justify-between relative z-10 min-h-[30vh] lg:h-screen lg:sticky top-0 border-b lg:border-b-0 border-[#FFE3A8]">
          <div>
            <div className="flex items-center gap-6 mb-10">
              <div className="relative w-56 h-20 sm:w-72 sm:h-28">
                <Image src="/Amifresh%20logo%20Light%20theam.webp" alt="AmiFresh" fill className="object-contain object-left" />
              </div>
              <div className="w-px h-12 bg-black/10"></div>
              <div className="relative w-40 h-20 sm:w-56 sm:h-28">
                <Image src="/Sakhi%20Light.webp" alt="Sakhi" fill className="object-contain object-left" />
              </div>
            </div>

            <p className={`${caveat.className} text-[#0B6B2E] text-2xl mb-8 tracking-wide`}>Purity at your doorstep</p>

            <div className={`${poppins.className} mb-8`}>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#111111] leading-tight mb-2">Work From Home</h1>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#111111] mb-4">
                Earn up to <span className="text-[#0F8A3C]">₹75,000*</span>/Month
              </h2>
              <p className="text-[#6B6B6B] text-lg font-medium max-w-sm">
                Empowering women through our 'Sakhi Sales' program.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {["No Investment", "Convenient Working Hours", "Opportunity For Women Only"].map((badge, i) => (
                <span key={i} className="bg-[#FDB94E] text-[#111111] px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                  {badge}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#6B6B6B]">*T&C Apply</p>
          </div>

          <div className="hidden lg:flex items-center gap-4 mt-8 pt-8 border-t border-black/10">
            <span className="font-semibold text-[#111111]">www.amifresh.in</span>
            <div className="flex gap-2 ml-auto">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-[#0F8A3C] transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className="w-full lg:w-[62%] p-4 sm:p-6 lg:p-12 flex items-center justify-center relative z-10">
          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-slide-up">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-[#E7F6EC] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0F8A3C]">
                <Image src="/Leaf.webp" alt="" width={24} height={24} className="opacity-80" />
              </div>
              <h2 className={`${poppins.className} text-2xl font-bold text-[#111111]`}>
                Welcome Back, Sakhi 👋
              </h2>
              <p className="text-[#0F8A3C] font-semibold text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMsg && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4 text-center">
                  {errorMsg}
                </div>
              )}
              {/* Mobile or Email */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Login ID <span className="text-[#D93025]">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('identifier')}
                    type="text"
                    placeholder="Enter Login ID"
                    className="input-field w-full"
                  />
                </div>
                {errors.identifier && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.identifier.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Password <span className="text-[#D93025]">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="input-field w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#111111]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.password.message}</p>}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end -mt-2">
                <Link href="/forgot-password" className="text-[#FDB94E] hover:text-[#e09d31] text-sm font-bold transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] bg-[#0F8A3C] hover:bg-[#0B6B2E] text-white rounded-full font-bold text-lg flex items-center justify-center transition-all hover:-translate-y-1 shadow-[0_4px_12px_rgba(15,138,60,0.2)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[#6B6B6B] text-sm">
                New Sakhi?{' '}
                <Link href="/register" className="text-[#0F8A3C] font-bold hover:underline">
                  Apply here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex lg:hidden flex-col items-center gap-4 mt-8 pb-8 w-full z-10">
          <div className="flex gap-3">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center">
                <Icon size={18} />
              </a>
            ))}
          </div>
          <span className="font-semibold text-[#111111]">www.amifresh.in</span>
        </div>
      </div>
    </div>
  );
}

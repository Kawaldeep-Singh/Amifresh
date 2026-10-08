'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  User, Phone, Mail, MapPin, Check, Sun, Moon, 
  Camera, Upload, X, FileImage, Calendar, Users, 
  CreditCard, FileText, ChevronDown 
} from 'lucide-react';
import { Poppins, Nunito, Caveat } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const caveat = Caveat({ subsets: ['latin'], weight: ['700'] });

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const registerSchema = z.object({
  firstName: z.string().min(1, 'Required').regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  lastName: z.string().min(1, 'Required').regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  dob: z.string().min(1, 'Required').refine((val) => {
    const age = (new Date().getTime() - new Date(val).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 18;
  }, 'Must be 18+ years'),
  fatherSpouseName: z.string().optional(),
  gender: z.enum(['Female', 'Male', 'Other']),
  email: z.string().email('Valid email format required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, '10 digits starting with 6-9'),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  pinCode: z.string().regex(/^\d{6}$/, 'Must be 6 digits'),
  photo: z.any().refine((val) => val, 'Required'),
  pan: z.any().refine((val) => val, 'Required'),
  aadhaar: z.any().refine((val) => val, 'Required'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to T&C' }),
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Social SVGs
const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Webcam Modal State
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamField, setWebcamField] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user'|'environment'>('user');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: 'Female',
    }
  });

  const photoVal = watch('photo');
  const panVal = watch('pan');
  const aadhaarVal = watch('aadhaar');

  const onSubmit = async (data: RegisterFormValues) => {
    console.log('Form submission placeholder:', data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string | Blob);
    });
    
    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  const handleFileUpload = (field: keyof RegisterFormValues, file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Max size is 5MB.');
      return;
    }
    setValue(field, file, { shouldValidate: true });
  };

  const openWebcam = (field: string, mode: 'user'|'environment') => {
    if (window.innerWidth < 1024) {
      // On mobile, use native capture via input
      const input = document.getElementById(`${field}-capture`) as HTMLInputElement;
      if (input) input.click();
      return;
    }
    setWebcamField(field);
    setFacingMode(mode);
    setWebcamOpen(true);
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
      .then(s => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.error("Webcam error:", err);
        alert("Could not access webcam. Please check permissions.");
        setWebcamOpen(false);
      });
  };

  const closeWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setWebcamOpen(false);
    setWebcamField(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !webcamField) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${webcamField}.jpg`, { type: 'image/jpeg' });
          setValue(webcamField as keyof RegisterFormValues, file, { shouldValidate: true });
          closeWebcam();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  if (!isMounted) return null;

  const DocUploadCard = ({ title, field, accept, mode, icon: Icon, val }: any) => (
    <div className="bg-white dark:bg-[#1C3628] border border-[#E5E5E5] dark:border-[#2A4D3B] rounded-xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden group">
      <div className="mb-2 text-[#0F8A3C] dark:text-[#22B35A]"><Icon size={28} /></div>
      <p className="font-semibold text-sm mb-3 dark:text-white">{title}</p>
      
      {val ? (
        <div className="w-full relative h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-[#0F8A3C]/30">
          {val.type?.startsWith('image/') ? (
            <img src={URL.createObjectURL(val)} alt={title} className="object-cover w-full h-full" />
          ) : (
            <div className="text-gray-500 flex flex-col items-center"><Check size={24} className="text-[#0F8A3C]"/> <span className="text-xs mt-1">PDF Selected</span></div>
          )}
          <button type="button" onClick={() => setValue(field, null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
            <X size={14} />
          </button>
          <div className="absolute bottom-1 right-1 bg-[#0F8A3C] text-white rounded-full p-1 shadow-sm"><Check size={14} /></div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          <button type="button" onClick={() => openWebcam(field, mode)} className="w-full text-xs font-semibold py-2 px-3 border border-[#0F8A3C] text-[#0F8A3C] dark:text-[#22B35A] dark:border-[#22B35A] rounded-lg hover:bg-[#E7F6EC] dark:hover:bg-[#22B35A]/10 transition-colors flex items-center justify-center gap-1">
            <Camera size={14} /> Take Picture
          </button>
          <label className="w-full text-xs font-semibold py-2 px-3 bg-[#FFFBF2] dark:bg-[#162A1F] border border-[#E5E5E5] dark:border-[#2A4D3B] text-[#111111] dark:text-[#F5F5F5] rounded-lg hover:bg-gray-50 dark:hover:bg-[#203D2E] transition-colors flex items-center justify-center gap-1 cursor-pointer">
            <Upload size={14} /> Upload
            <input type="file" accept={accept} className="hidden" onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)} />
          </label>
          {/* Hidden capture input for mobile fallback */}
          <input id={`${field}-capture`} type="file" accept="image/*" capture={mode} className="hidden" onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)} />
        </div>
      )}
      {errors[field as keyof RegisterFormValues] && <p className="text-[#D93025] text-xs mt-2 font-medium">Required</p>}
    </div>
  );

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${nunito.className} bg-[#FFF5E4] dark:bg-[#0F1A14] overflow-hidden`}>
        
        {/* Toggle Theme */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-md text-[#111111] dark:text-[#F5F5F5] hover:scale-110 transition-transform"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Global Styles for Animations */}
        <style dangerouslySetInnerHTML={{__html: `
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
          .dark .input-field { background-color: #162A1F; border-color: #2A4D3B; color: #F5F5F5; }
          .input-field:focus { outline: none; border-color: #FDB94E; box-shadow: 0 0 0 4px rgba(253, 185, 78, 0.15); }
        `}} />

        {/* Decorative Falling Leaves (Optional background effect) */}
        <img src="/Leaf.webp" className="absolute top-[10%] left-[5%] w-16 opacity-20 animate-sway pointer-events-none hidden lg:block" alt="" />
        <img src="/Leaf.webp" className="absolute top-[60%] left-[30%] w-24 opacity-10 animate-sway pointer-events-none hidden lg:block" style={{animationDelay: '2s'}} alt="" />
        <img src="/Leaf.webp" className="absolute top-[20%] right-[10%] w-20 opacity-20 animate-sway-right pointer-events-none hidden lg:block" style={{animationDelay: '1s'}} alt="" />
        <img src="/Leaf.webp" className="absolute bottom-[10%] left-[2%] w-32 opacity-30 animate-sway pointer-events-none hidden lg:block" style={{animationDelay: '3s'}} alt="" />

        {/* LEFT PANEL */}
        <div className="w-full lg:w-[38%] p-6 lg:p-12 xl:p-16 flex flex-col justify-between relative z-10 min-h-[30vh] lg:h-screen lg:sticky top-0 border-b lg:border-b-0 border-[#FFE3A8] dark:border-[#2A4D3B]">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-32 h-10">
                <Image src="/Amifresh%20logo%20Light%20theam.webp" alt="AmiFresh" fill className="object-contain dark:hidden" />
                <Image src="/Amifresh%20dark%20thema.webp" alt="AmiFresh" fill className="object-contain hidden dark:block" />
              </div>
              <div className="w-px h-8 bg-black/10 dark:bg-white/10"></div>
              <div className="relative w-24 h-10">
                <Image src="/Sakhi%20Light.webp" alt="Sakhi" fill className="object-contain dark:hidden" />
                <Image src="/Sakhi%20dark%20tham.webp" alt="Sakhi" fill className="object-contain hidden dark:block" />
              </div>
            </div>
            
            <p className={`${caveat.className} text-[#0B6B2E] dark:text-[#22B35A] text-2xl mb-8 tracking-wide`}>Purity at your doorstep</p>
            
            <div className={`${poppins.className} mb-8`}>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#111111] dark:text-[#F5F5F5] leading-tight mb-2">Work From Home</h1>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#111111] dark:text-[#F5F5F5] mb-4">
                Earn up to <span className="text-[#0F8A3C] dark:text-[#22B35A]">₹75,000*</span>/Month
              </h2>
              <p className="text-[#6B6B6B] dark:text-[#A0AAB2] text-lg font-medium max-w-sm">
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
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0AAB2]">*T&C Apply</p>
          </div>

          <div className="hidden lg:flex items-center gap-4 mt-8 pt-8 border-t border-black/10 dark:border-white/10">
            <span className="font-semibold text-[#111111] dark:text-[#F5F5F5]">www.amifresh.in</span>
            <div className="flex gap-2 ml-auto">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center hover:bg-[#0F8A3C] dark:hover:bg-[#22B35A] hover:text-white transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="w-full lg:w-[62%] p-4 sm:p-6 lg:p-8 xl:p-12 flex items-center justify-center lg:overflow-y-auto h-auto lg:h-screen relative z-10">
          <div className="w-full max-w-4xl bg-white dark:bg-[#162A1F] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-black/40 animate-slide-up flex flex-col max-h-full">
            
            {/* Form Header (Sticky) */}
            <div className="p-6 md:p-8 border-b border-[#E5E5E5] dark:border-[#2A4D3B] sticky top-0 bg-white/95 dark:bg-[#162A1F]/95 backdrop-blur-md rounded-t-[24px] z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E7F6EC] dark:bg-[#22B35A]/20 rounded-full flex items-center justify-center text-[#0F8A3C] dark:text-[#22B35A] flex-shrink-0">
                  <Image src="/Leaf.webp" alt="" width={24} height={24} className="opacity-80" />
                </div>
                <div>
                  <h2 className={`${poppins.className} text-2xl font-bold text-[#111111] dark:text-[#F5F5F5]`}>
                    Join the Sakhi Family <span className="text-[#0F8A3C] dark:text-[#22B35A]">🌿</span>
                  </h2>
                  <p className="text-[#0F8A3C] dark:text-[#22B35A] font-semibold text-sm mt-1">Start your journey with us</p>
                </div>
              </div>
              
              {isSuccess && (
                <div className="mt-4 p-3 bg-[#E7F6EC] dark:bg-[#1C3628] text-[#0F8A3C] dark:text-[#22B35A] border border-[#0F8A3C]/20 rounded-xl flex items-center gap-2 font-semibold">
                  <div className="bg-[#0F8A3C] dark:bg-[#22B35A] text-white rounded-full p-1"><Check size={14} /></div>
                  Registration successful! 🎉 Redirecting...
                </div>
              )}
            </div>

            {/* Form Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto overflow-x-hidden">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Section 1: Personal Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-[#E5E5E5] dark:border-[#2A4D3B] pb-2">
                    <User size={18} className="text-[#0F8A3C] dark:text-[#22B35A]" />
                    <h3 className={`${poppins.className} font-bold text-[#111111] dark:text-[#F5F5F5]`}>Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">First Name <span className="text-[#D93025]">*</span></label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('firstName')} type="text" className="input-field w-full" placeholder="Enter first name" />
                      </div>
                      {errors.firstName && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Last Name <span className="text-[#D93025]">*</span></label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('lastName')} type="text" className="input-field w-full" placeholder="Enter last name" />
                      </div>
                      {errors.lastName && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.lastName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Date of Birth (18+) <span className="text-[#D93025]">*</span></label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('dob')} type="date" className="input-field w-full pr-3" />
                      </div>
                      {errors.dob && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.dob.message}</p>}
                    </div>
                    <div className="md:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Father / Spouse Name</label>
                      <div className="relative">
                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('fatherSpouseName')} type="text" className="input-field w-full" placeholder="Optional" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-2">Gender <span className="text-[#D93025]">*</span></label>
                      <div className="flex gap-3">
                        {['Female', 'Male', 'Other'].map(g => (
                          <label key={g} className="relative cursor-pointer">
                            <input {...register('gender')} type="radio" value={g} className="peer sr-only" />
                            <div className="px-4 py-2 text-sm rounded-full border-2 border-[#E5E5E5] dark:border-[#2A4D3B] text-[#6B6B6B] dark:text-[#A0AAB2] peer-checked:border-[#0F8A3C] peer-checked:bg-[#E7F6EC] dark:peer-checked:bg-[#1C3628] peer-checked:text-[#0F8A3C] dark:peer-checked:text-[#22B35A] peer-checked:font-bold transition-all">
                              {g}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-[#E5E5E5] dark:border-[#2A4D3B] pb-2">
                    <Phone size={18} className="text-[#0F8A3C] dark:text-[#22B35A]" />
                    <h3 className={`${poppins.className} font-bold text-[#111111] dark:text-[#F5F5F5]`}>Contact Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Mobile Number <span className="text-[#D93025]">*</span></label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-bold text-[#111111] dark:text-[#F5F5F5] border-r border-gray-300 pr-2">+91</span>
                        <input {...register('mobile')} type="tel" maxLength={10} className="input-field w-full pl-[4.5rem]" placeholder="9876543210" />
                      </div>
                      {errors.mobile && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.mobile.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Email Address <span className="text-[#D93025]">*</span></label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('email')} type="email" className="input-field w-full" placeholder="example@email.com" />
                      </div>
                      {errors.email && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 3: Address */}
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-[#E5E5E5] dark:border-[#2A4D3B] pb-2">
                    <MapPin size={18} className="text-[#0F8A3C] dark:text-[#22B35A]" />
                    <h3 className={`${poppins.className} font-bold text-[#111111] dark:text-[#F5F5F5]`}>Address Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Full Address <span className="text-[#D93025]">*</span></label>
                      <textarea {...register('address')} rows={2} className="input-field w-full py-2 resize-none rounded-[12px]" placeholder="House No, Street, Landmark" />
                      {errors.address && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.address.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">City <span className="text-[#D93025]">*</span></label>
                      <input {...register('city')} type="text" className="input-field w-full !pl-3" placeholder="City" />
                      {errors.city && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">State <span className="text-[#D93025]">*</span></label>
                      <div className="relative">
                        <select {...register('state')} className="input-field w-full !pl-3 appearance-none pr-8">
                          <option value="">Select State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      {errors.state && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B6B6B] dark:text-[#A0AAB2] mb-1">Pin Code <span className="text-[#D93025]">*</span></label>
                      <input {...register('pinCode')} type="text" maxLength={6} className="input-field w-full !pl-3" placeholder="000000" />
                      {errors.pinCode && <p className="text-[#D93025] text-xs mt-1 font-medium">{errors.pinCode.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 4: Documents */}
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-[#E5E5E5] dark:border-[#2A4D3B] pb-2">
                    <FileImage size={18} className="text-[#0F8A3C] dark:text-[#22B35A]" />
                    <h3 className={`${poppins.className} font-bold text-[#111111] dark:text-[#F5F5F5]`}>Document Upload <span className="text-[#D93025]">*</span></h3>
                  </div>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#A0AAB2] mb-4">Max file size: 5MB per document. Supported: Images, PDF (for PAN/Aadhaar).</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <DocUploadCard title="Passport Size Photo" field="photo" accept="image/*" mode="user" icon={User} val={photoVal} />
                    <DocUploadCard title="PAN Card" field="pan" accept="image/*,application/pdf" mode="environment" icon={CreditCard} val={panVal} />
                    <DocUploadCard title="Aadhaar Card" field="aadhaar" accept="image/*,application/pdf" mode="environment" icon={FileText} val={aadhaarVal} />
                  </div>
                </div>

                {/* Submit Area */}
                <div className="pt-4">
                  <div className="flex items-start gap-2 mb-6">
                    <input id="terms" type="checkbox" {...register('terms')} className="mt-1 w-4 h-4 rounded border-[#E5E5E5] text-[#0F8A3C] focus:ring-[#FDB94E]" />
                    <label htmlFor="terms" className="text-sm text-[#6B6B6B] dark:text-[#A0AAB2] cursor-pointer leading-tight">
                      I agree to the <a href="#" className="text-[#0F8A3C] dark:text-[#22B35A] font-semibold hover:underline">Terms & Conditions</a> and <a href="#" className="text-[#0F8A3C] dark:text-[#22B35A] font-semibold hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  {errors.terms && <p className="text-[#D93025] text-xs -mt-4 mb-4 font-medium">{errors.terms.message}</p>}

                  <button type="submit" disabled={isSubmitting} className="w-full h-[52px] bg-[#0F8A3C] dark:bg-[#22B35A] hover:bg-[#0B6B2E] dark:hover:bg-[#1C8D46] text-white rounded-full font-bold text-lg flex items-center justify-center transition-all hover:-translate-y-1 shadow-[0_4px_12px_rgba(15,138,60,0.2)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                    {isSubmitting ? 'Processing...' : 'Join Sakhi Program'}
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-[#6B6B6B] dark:text-[#A0AAB2] text-sm">
                      Already a Sakhi?{' '}
                      <Link href="/login" className="text-[#0F8A3C] dark:text-[#22B35A] font-bold hover:underline">
                        Login
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex lg:hidden flex-col items-center gap-4 mt-8 pb-8 w-full z-10">
          <div className="flex gap-3">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center">
                <Icon size={18} />
              </a>
            ))}
          </div>
          <span className="font-semibold text-[#111111] dark:text-[#F5F5F5]">www.amifresh.in</span>
        </div>
      </div>

      {/* Webcam Modal for Desktop */}
      {webcamOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#162A1F] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg dark:text-white">Take Picture</h3>
              <button onClick={closeWebcam} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={closeWebcam} className="flex-1 py-3 font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={capturePhoto} className="flex-1 py-3 font-bold rounded-xl bg-[#0F8A3C] text-white flex items-center justify-center gap-2 shadow-lg">
                <Camera size={20} /> Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

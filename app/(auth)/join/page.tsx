'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User, Phone, Mail, MapPin, Check,
  Camera, Upload, X, FileImage, Calendar, Users,
  CreditCard, FileText, ChevronDown, ShieldCheck,
  Zap, Lock, CheckCircle2, Sparkles
} from 'lucide-react';
import { poppins, nunito } from '@/lib/fonts';

// ════════════════════════════════════════════════════════════════
// BRAND COLORS & CONSTANTS
// Primary: #1B7F4B (Deep Leaf Green), Accent Lime: #8BC34A
// Mint: #F1FAF3, Canvas: #FFFDF7, Saffron: #FF9F1C, Slate: #1F2937
// ════════════════════════════════════════════════════════════════

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
  firstName: z.string().min(1, 'First name is required').regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  lastName: z.string().min(1, 'Last name is required').regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  dob: z.string().min(1, 'Date of birth is required').refine((val) => {
    const age = (new Date().getTime() - new Date(val).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 18;
  }, 'Must be at least 18 years old'),
  fatherSpouseName: z.string().min(1, 'Father / Spouse Name is required').regex(/^[a-zA-Z\s]+$/, 'Letters only'),
  email: z.string().email('Valid email address required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, '10-digit number starting with 6-9'),
  address: z.string().min(5, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'Please select your state'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN Code must be 6 digits'),
  photo: z.any().refine((val) => val, 'Passport photo is required'),
  pan: z.any().refine((val) => val, 'PAN card is required'),
  aadhaarFront: z.any().refine((val) => val, 'Aadhaar front is required'),
  aadhaarBack: z.any().refine((val) => val, 'Aadhaar back is required'),
  referralCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, 'You must agree to Terms & Conditions'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function RegisterPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [variant, setVariant] = useState<'v1' | 'v2'>('v1');


  // Webcam Modal State
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamField, setWebcamField] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Drag-and-drop state
  const [dragActiveField, setDragActiveField] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const photoVal = watch('photo');
  const panVal = watch('pan');
  const aadhaarFrontVal = watch('aadhaarFront');
  const aadhaarBackVal = watch('aadhaarBack');
  const referralCodeVal = watch('referralCode');

  // Watch field values for subtle valid checkmarks & Live Card in V2
  const firstNameVal = watch('firstName');
  const lastNameVal = watch('lastName');
  const mobileVal = watch('mobile');
  const emailVal = watch('email');
  const dobVal = watch('dob');
  const fatherSpouseVal = watch('fatherSpouseName');
  const addressVal = watch('address');
  const cityVal = watch('city');
  const stateVal = watch('state');
  const pinCodeVal = watch('pinCode');

  // Referral verification
  const [referrerInfo, setReferrerInfo] = useState<{ name: string } | null>(null);
  const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');

  useEffect(() => {
    if (!referralCodeVal || referralCodeVal.trim().length === 0) {
      setReferrerInfo(null);
      setReferralError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifyingReferral(true);
      setReferrerInfo(null);
      setReferralError('');
      try {
        const res = await fetch(`/api/referrals/validate?code=${encodeURIComponent(referralCodeVal)}`);
        const data = await res.json();
        if (res.ok && data.referrer) {
          setReferrerInfo({ name: data.referrer.name });
        } else {
          setReferralError(data.error || 'Invalid referral code');
        }
      } catch (err) {
        setReferralError('Failed to verify code');
      } finally {
        setIsVerifyingReferral(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [referralCodeVal]);

  const fileToBase64 = (file: File | undefined | null): Promise<string | undefined> => {
    if (!file) return Promise.resolve(undefined);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const photoBase64 = await fileToBase64(data.photo as File | undefined);
      const panBase64 = await fileToBase64(data.pan as File | undefined);
      const aadhaarFrontBase64 = await fileToBase64(data.aadhaarFront as File | undefined);
      const aadhaarBackBase64 = await fileToBase64(data.aadhaarBack as File | undefined);

      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.mobile,
        referralCode: data.referralCode,
        dob: data.dob,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        fatherSpouseName: data.fatherSpouseName,
        photo: photoBase64,
        panCard: panBase64,
        aadhaarCard: aadhaarFrontBase64,
        aadhaarCardFront: aadhaarFrontBase64,
        aadhaarCardBack: aadhaarBackBase64,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Registration failed');
        return;
      }

      setIsSuccess(true);
      reset();
    } catch (error) {
      alert('An error occurred during registration. Please try again.');
    }
  };

  const handleFileUpload = (field: keyof RegisterFormValues, file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    setValue(field, file, { shouldValidate: true });
  };

  const openWebcam = (field: string, mode: 'user' | 'environment') => {
    if (window.innerWidth < 1024) {
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
        alert("Could not access camera. Please check permissions.");
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

  // ─── Shared KYC Upload Card Component ───
  const DocUploadTile = ({ title, field, accept, mode, icon: Icon, val }: any) => {
    const isDragActive = dragActiveField === field;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActiveField(field);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActiveField(null);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActiveField(null);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        handleFileUpload(field, droppedFile);
      }
    };

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-3 rounded-2xl border-2 border-dashed transition-all relative flex flex-col justify-between min-h-[135px] ${val
            ? 'bg-[#F1FAF3] border-[#1B7F4B]'
            : isDragActive
              ? 'bg-emerald-100/60 border-[#1B7F4B]'
              : 'bg-[#FCFBF8] border-[#E8DEC8] hover:border-[#1B7F4B]/60'
          }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${val
                ? 'bg-[#1B7F4B] text-white'
                : 'bg-[#1B7F4B]/10 text-[#1B7F4B]'
              }`}>
              {val ? <Check size={14} /> : <Icon size={14} />}
            </div>
            <div>
              <p className="font-bold text-xs leading-tight text-[#1F2937]">
                {title}
              </p>
              <p className="text-[10px] text-[#6B7280]">
                {val ? `${(val.size / 1024).toFixed(0)} KB` : 'Max 5MB'}
              </p>
            </div>
          </div>

          {val && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[#1B7F4B] text-[10px] font-black border border-emerald-300">
              <CheckCircle2 size={11} /> Done
            </span>
          )}
        </div>

        {val ? (
          <div className="w-full mt-2 relative h-14 rounded-xl border border-emerald-200 bg-white overflow-hidden flex items-center justify-center shadow-2xs">
            {val.type?.startsWith('image/') ? (
              <img src={URL.createObjectURL(val)} alt={title} className="object-cover w-full h-full" />
            ) : (
              <div className="text-[#1B7F4B] flex items-center gap-1.5 text-xs font-bold">
                <FileText size={14} /> <span>PDF File</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setValue(field, null, { shouldValidate: true })}
              className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
              title="Remove"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1.5 w-full">
            <label className="flex-1 py-1.5 px-2 border rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs bg-white hover:bg-emerald-50 border-[#E8DEC8] hover:border-[#1B7F4B] text-[#1F2937] hover:text-[#1B7F4B]">
              <Upload size={12} />
              <span>Upload</span>
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
              />
            </label>

            <button
              type="button"
              onClick={() => openWebcam(field, mode)}
              className="p-1.5 px-2.5 border rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs bg-white hover:bg-emerald-50 border-[#E8DEC8] hover:border-[#1B7F4B] text-[#1F2937] hover:text-[#1B7F4B] cursor-pointer"
              title="Camera"
            >
              <Camera size={13} />
              <span className="hidden sm:inline">Camera</span>
            </button>

            <input
              id={`${field}-capture`}
              type="file"
              accept="image/*"
              capture={mode}
              className="hidden"
              onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
            />
          </div>
        )}

        {errors[field as keyof RegisterFormValues] && (
          <span className="text-red-500 text-[10px] font-bold mt-1">
            {errors[field as keyof RegisterFormValues]?.message?.toString() || 'Required'}
          </span>
        )}
      </div>
    );
  };

  // ─── Shared Form Card Renderer ───
  const renderFormCard = (
    maxWidthClass = "max-w-[520px] xl:max-w-[570px]",
    extraCardClasses = "border border-[#EFE5D3] shadow-[0_16px_45px_rgba(0,0,0,0.06)]"
  ) => (
    <div className={`w-full ${maxWidthClass} bg-white rounded-3xl ${extraCardClasses} overflow-hidden flex flex-col lg:max-h-[calc(100vh-2.5rem)]`}>
      {/* Fixed Header */}
      <div className="px-6 sm:px-8 py-4 border-b border-[#F0E6D4] bg-gradient-to-r from-[#FFFDF8] via-[#FFF9EE] to-[#F1FAF3] flex flex-col items-center justify-center text-center flex-shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF9F1C] text-[#1F2937] text-[11px] font-black uppercase tracking-wider mb-1.5 shadow-2xs">
          <Image src="/icon-leaf.webp" alt="" width={12} height={12} className="object-contain" />
          <span>Women Exclusive</span>
        </div>
        <h2 className={`${poppins.className} text-lg sm:text-xl font-black text-[#1F2937]`}>
          Become an Amifresh Sakhi
        </h2>
        <p className="text-xs text-[#1B7F4B] font-bold mt-0.5">
          Convenient Working hour • No Investment  • Opportunity For Only Woman
        </p>
      </div>

      {/* Scrollable Form Body */}
      <div className="p-6 sm:p-8 overflow-y-auto form-scrollbar flex-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-1.5 mb-3.5 pb-1 border-b border-gray-100">
              <User size={14} className="text-[#1B7F4B]" />
              <h3 className={`${poppins.className} font-extrabold text-xs text-[#1F2937] uppercase tracking-wider`}>
                1. Personal &amp; Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">First Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('firstName')} type="text" className="clean-input" placeholder="First Name" />
                  {!errors.firstName && firstNameVal && firstNameVal.length >= 2 && (
                    <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {errors.firstName && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Last Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('lastName')} type="text" className="clean-input" placeholder="Last Name" />
                  {!errors.lastName && lastNameVal && lastNameVal.length >= 2 && (
                    <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {errors.lastName && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.lastName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xs font-black text-[#1F2937] border-r border-gray-300 pr-1.5">+91</span>
                  <input {...register('mobile')} type="tel" maxLength={10} className="clean-input !pl-[4.2rem]" placeholder="9876543210" />
                  {!errors.mobile && mobileVal && /^[6-9]\d{9}$/.test(mobileVal) && (
                    <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {errors.mobile && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.mobile.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('email')} type="email" className="clean-input" placeholder="email@example.com" />
                  {!errors.email && emailVal && /^\S+@\S+\.\S+$/.test(emailVal) && (
                    <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Date of Birth (18+) *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('dob')} type="date" className="clean-input pr-3" />
                  {!errors.dob && dobVal && (
                    <CheckCircle2 size={15} className="absolute right-8 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {errors.dob && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.dob.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Father / Spouse Name *</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('fatherSpouseName')} type="text" className="clean-input" placeholder="Father or Spouse Name" />
                  {!errors.fatherSpouseName && fatherSpouseVal && fatherSpouseVal.length >= 2 && (
                    <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {errors.fatherSpouseName && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.fatherSpouseName.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-1.5 mb-3.5 pb-1 border-b border-gray-100">
              <MapPin size={14} className="text-[#1B7F4B]" />
              <h3 className={`${poppins.className} font-extrabold text-xs text-[#1F2937] uppercase tracking-wider`}>
                2. Address &amp; Referral
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Full Address *</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
                  <textarea {...register('address')} rows={2} className="clean-textarea" placeholder="House / Flat No., Street, Area, Landmark" />
                </div>
                {errors.address && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">City *</label>
                  <input {...register('city')} type="text" className="clean-input !pl-3" placeholder="City" />
                  {errors.city && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">State *</label>
                  <div className="relative">
                    <select {...register('state')} className="clean-input !pl-3 appearance-none pr-8">
                      <option value="">Select State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.state && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.state.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">PIN Code *</label>
                  <input {...register('pinCode')} type="text" maxLength={6} className="clean-input !pl-3" placeholder="6-digit PIN" />
                  {errors.pinCode && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.pinCode.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">Referral Code (Optional)</label>
                <div className="relative">
                  <input {...register('referralCode')} type="text" className="clean-input !pl-3 uppercase pr-10" placeholder="Enter referral code" />
                  {isVerifyingReferral && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#1B7F4B] border-t-transparent rounded-full" />
                    </div>
                  )}
                  {!isVerifyingReferral && referrerInfo && (
                    <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B7F4B]" />
                  )}
                </div>
                {referralError && <p className="text-red-500 text-[11px] mt-1 font-semibold">{referralError}</p>}
                {referrerInfo && (
                  <p className="text-[#1B7F4B] text-[11px] mt-1 font-bold flex items-center gap-1">
                    <Check size={12} /> Referred by: {referrerInfo.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <FileImage size={14} className="text-[#1B7F4B]" />
                <h3 className={`${poppins.className} font-extrabold text-xs text-[#1F2937] uppercase tracking-wider`}>
                  3. KYC Document Upload *
                </h3>
              </div>
              <span className="text-[10px] text-[#6B7280] font-bold">Max 5MB each</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DocUploadTile title="Passport Photo" field="photo" accept="image/*" mode="user" icon={User} val={photoVal} />
              <DocUploadTile title="PAN Card" field="pan" accept="image/*,application/pdf" mode="environment" icon={CreditCard} val={panVal} />
              <DocUploadTile title="Aadhaar Front" field="aadhaarFront" accept="image/*,application/pdf" mode="environment" icon={FileText} val={aadhaarFrontVal} />
              <DocUploadTile title="Aadhaar Back" field="aadhaarBack" accept="image/*,application/pdf" mode="environment" icon={FileText} val={aadhaarBackVal} />
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#6B7280] bg-[#F1FAF3] p-2 rounded-xl border border-emerald-100">
              <Lock size={13} className="text-[#1B7F4B]" />
              <span>Your documents are encrypted and securely stored.</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <div className="flex items-start gap-2.5 mb-4">
              <input id="terms-v1" type="checkbox" {...register('terms')} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#1B7F4B] focus:ring-[#1B7F4B]/30 flex-shrink-0 cursor-pointer" />
              <label htmlFor="terms-v1" className="text-xs text-[#6B7280] cursor-pointer leading-normal">
                I confirm that details provided are accurate and agree to <a href="#" className="text-[#1B7F4B] font-bold hover:underline">Terms &amp; Conditions</a>.
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-[11px] -mt-2 mb-3 font-semibold">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-[#1B7F4B] to-[#125A33] hover:from-[#166F40] hover:to-[#0C4A28] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_25px_rgba(27,127,75,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Submitting Registration...</span>
                </span>
              ) : (
                <span>Join Now! 🌿</span>
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-[#6B7280]">
                Already registered?{' '}
                <Link href="/login" className="font-extrabold text-[#1B7F4B] hover:underline">
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>

        </form>
      </div>

      {/* Card Footer Security Note */}
      <div className="p-2.5 bg-[#F1FAF3] border-t border-emerald-100 text-center text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5 flex-shrink-0">
        <ShieldCheck size={14} className="text-[#1B7F4B]" />
        <span>Authorized 256-bit Encrypted Partner Portal • Verified Safe</span>
      </div>
    </div>
  );

  return (
    <div className={`${nunito.className} relative`}>
      <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#FFFDF7] text-[#1F2937] relative flex flex-col justify-between selection:bg-[#8BC34A]/30 selection:text-[#1B7F4B]">

        <style dangerouslySetInnerHTML={{
          __html: `
          .clean-input {
            height: 44px;
            border-radius: 12px;
            border: 1.5px solid #E8DEC8;
            background-color: #FFFFFF;
            color: #1F2937;
            transition: all 0.2s ease;
            padding-left: 2.4rem;
            padding-right: 2.2rem;
            font-size: 0.875rem;
            width: 100%;
          }
          .clean-input:focus {
            outline: none;
            border-color: #1B7F4B;
            box-shadow: 0 0 0 3px rgba(27, 127, 75, 0.12);
          }
          .clean-textarea {
            border-radius: 12px;
            border: 1.5px solid #E8DEC8;
            background-color: #FFFFFF;
            color: #1F2937;
            transition: all 0.2s ease;
            padding-left: 2.4rem;
            padding-right: 1rem;
            padding-top: 0.65rem;
            padding-bottom: 0.65rem;
            font-size: 0.875rem;
            width: 100%;
            min-height: 72px;
            resize: vertical;
          }
          .clean-textarea:focus {
            outline: none;
            border-color: #1B7F4B;
            box-shadow: 0 0 0 3px rgba(27, 127, 75, 0.12);
          }
          .form-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .form-scrollbar::-webkit-scrollbar-track {
            background: #FDFBF7;
            border-radius: 9999px;
          }
          .form-scrollbar::-webkit-scrollbar-thumb {
            background: #E8DEC8;
            border-radius: 9999px;
          }
          .form-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #1B7F4B;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
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

        {/* ════════════════════════════════════════════════════════════════
            VARIANT 1: CLEAN FORM ALIGNED AT TOP WITH LOGOS
        ════════════════════════════════════════════════════════════════ */}
        {variant === 'v1' && (
          <div className="flex-1 flex flex-col relative w-full h-full lg:h-screen lg:overflow-hidden">
            {/* Mobile Header (< lg screens) */}
            <div className="lg:hidden flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur-md border-b border-[#EFE5D3] sticky top-0 z-30 flex-shrink-0">
              <div className="relative w-36 h-10">
                <Image src="/dark-logo.webp" alt="AmiFresh" fill className="object-contain object-left" priority />
              </div>
              <div className="relative w-32 h-10">
                <Image src="/Sakhi Light.webp" alt="Sakhi" fill className="object-contain object-right" priority />
              </div>
            </div>

            {/* Desktop: 3-Column Layout with items-start aligning Form and Logos at the top */}
            <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-14 sm:pb-16 flex flex-col justify-start z-10 relative lg:h-screen lg:overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-8 items-start lg:h-[calc(100vh-2.5rem)]">

                {/* 👈 Top-Left: AmiFresh Logo (Desktop) */}
                <div className="hidden lg:flex lg:col-span-2 xl:col-span-2 justify-start pt-2">
                  <div className="relative w-44 xl:w-56 h-14 xl:h-18 hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/dark-logo.webp"
                      alt="AmiFresh"
                      fill
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                </div>

                {/* 🎯 Center: Application Form (Increased width & visual weight) */}
                <div className="col-span-1 lg:col-span-8 xl:col-span-8 w-full flex justify-center items-start lg:max-h-[calc(100vh-4.5rem)]">
                  {renderFormCard(
                    "max-w-[740px] xl:max-w-[820px] 2xl:max-w-[880px]",
                    "border-[1.5px] border-[#E0D3BC] shadow-[0_24px_70px_rgba(0,0,0,0.09)]"
                  )}
                </div>

                {/* 👉 Top-Right: Sakhi Logo (Desktop) */}
                <div className="hidden lg:flex lg:col-span-2 xl:col-span-2 justify-end pt-2">
                  <div className="relative w-40 xl:w-52 h-14 xl:h-18 hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/Sakhi Light.webp"
                      alt="Sakhi Program"
                      fill
                      className="object-contain object-right"
                      priority
                    />
                  </div>
                </div>

              </div>
            </main>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            VARIANT 2: 2-COLUMN SPLIT WITH ARTBOARD 5 BANNER
        ════════════════════════════════════════════════════════════════ */}
        {variant === 'v2' && (
          <div className="flex-1 flex flex-col justify-between">
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex flex-col justify-center z-10 relative lg:h-screen lg:overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-10 items-center lg:h-full">

                {/* 👈 LEFT COLUMN: Artboard 5 Brand Banner (Matching Theam idea.webp) */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-full max-w-[520px] xl:max-w-[570px] aspect-square rounded-3xl overflow-hidden shadow-[0_16px_45px_rgba(0,0,0,0.08)] border border-[#EFE5D3] bg-white">
                    <Image
                      src="/Theam-idea.jpg"
                      alt="AmiFresh Sakhi Program - Work from Home"
                      fill
                      className="object-contain"
                      priority
                      quality={95}
                    />
                  </div>

                  {/* Additional Benefit Tags */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-white/95 border border-[#EFE5D3] text-xs font-bold text-[#1F2937] shadow-2xs">
                      ✨ No Joining Fee
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/95 border border-[#EFE5D3] text-xs font-bold text-[#1F2937] shadow-2xs">
                      🛡️ No Security Deposit
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/95 border border-[#EFE5D3] text-xs font-bold text-[#1F2937] shadow-2xs">
                      🌸 Only for Women
                    </span>
                  </div>
                </div>

                {/* 🎯 RIGHT COLUMN: Sakhi Application Form */}
                <div className="lg:col-span-6 xl:col-span-6 w-full flex flex-col items-center justify-center lg:max-h-[calc(100vh-2.5rem)]">
                  {renderFormCard("max-w-[520px] xl:max-w-[570px]")}
                </div>

              </div>
            </main>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            FLOATING VARIANT SWITCHER PILL (Bottom Center)
        ════════════════════════════════════════════════════════════════ */}
        <aside aria-label="Design variant switcher" className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.18)] border border-[#E8DEC8]">
          <button
            type="button"
            onClick={() => setVariant('v1')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${variant === 'v1'
                ? 'bg-[#1B7F4B] text-white shadow-md scale-105'
                : 'text-[#1F2937] hover:bg-gray-100'
              }`}
          >
            <span>✨ Variant 1</span>
            <span className="text-[10px] font-normal opacity-85 hidden sm:inline">(Side Badges)</span>
          </button>
          <button
            type="button"
            onClick={() => setVariant('v2')}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${variant === 'v2'
                ? 'bg-[#1B7F4B] text-white shadow-md scale-105'
                : 'text-[#1F2937] hover:bg-gray-100'
              }`}
          >
            <span>🎨 Variant 2</span>
            <span className="text-[10px] font-normal opacity-85 hidden sm:inline">(Artboard Banner)</span>
          </button>
        </aside>

      </div>


      {/* ════════════════════════════════════════════════════════════════
          WEBCAM MODAL (Shared)
      ════════════════════════════════════════════════════════════════ */}
      {webcamOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl text-gray-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-lg text-gray-900">Snap Photo via Camera</h3>
              <button onClick={closeWebcam} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={closeWebcam} className="flex-1 py-2.5 font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex-1 py-2.5 font-black rounded-xl bg-[#1B7F4B] text-white flex items-center justify-center gap-2 shadow-lg hover:bg-[#166F40]"
              >
                <Camera size={16} /> Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SUCCESS MODAL (Shared)
      ════════════════════════════════════════════════════════════════ */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center relative border border-gray-100 text-gray-900">
            <button
              onClick={() => setIsSuccess(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/30">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
              🌿 Welcome to the Sakhi Family!
            </span>
            <h3 className={`${poppins.className} font-black text-2xl mb-2 text-gray-900`}>
              Application Submitted!
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Your registration has been received and your KYC documents are currently{' '}
              <span className="font-bold text-amber-600">Pending Verification</span>. We will update you via SMS / WhatsApp once approved.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="w-full py-3 font-black rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg"
            >
              Okay, Got It! 👍
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
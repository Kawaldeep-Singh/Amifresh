import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-bg items-center justify-center p-4">
      <div className="mb-10 animate-fade-in-up">
        <Image src="/amifresh-dark-thema.webp" alt="Amifresh Logo" width={200} height={60} className="object-contain" />
      </div>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center max-w-lg w-full relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-orange-500 mb-2 drop-shadow-sm">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Oops! Page not found
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. 
            Maybe you wandered too far into the spice route!
          </p>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-gray-400 font-medium">
        © 2024 Amifresh. All rights reserved.
      </div>
    </div>
  );
}

import { Poppins, Nunito, Caveat } from 'next/font/google';

export const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const nunito = Nunito({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const caveat = Caveat({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Amifresh Sakhi - Register',
};

export default function RegisterRedirectPage() {
  redirect('/join');
}
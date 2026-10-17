import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sakhi Registrations & KYC | Amifresh Admin',
  description: 'Manage and verify pending Sakhi registrations and KYC documents',
};

export default function RegistrationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

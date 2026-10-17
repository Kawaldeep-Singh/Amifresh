import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sakhi/ Partner Login',
  description: 'Sakhi and Partner Login Portal - Amifresh',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

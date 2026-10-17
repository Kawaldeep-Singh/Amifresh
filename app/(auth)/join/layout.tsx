import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amifresh Sakhi',
  description: 'Become an Amifresh Sakhi - Convenient Working Hours, No Investment, Opportunity For Women',
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

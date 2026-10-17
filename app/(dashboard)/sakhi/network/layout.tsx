import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Network Tree | Amifresh Sakhi',
  description: 'View your Sakhi referral network and downline tree',
};

export default function SakhiNetworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp Notification Test | Amifresh Admin',
  description: 'Test WhatsApp message templates and payloads',
};

export default function WhatsAppTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

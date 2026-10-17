import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Access Denied | Amifresh',
};

export default function UnauthorizedPage() {
  // Directly trigger the 404 page when someone lands on /unauthorized
  notFound();
}

import { notFound } from 'next/navigation';

export default function UnauthorizedPage() {
  // Directly trigger the 404 page when someone lands on /unauthorized
  notFound();
}

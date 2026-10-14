import { redirect } from 'next/navigation';

export default async function RegisterRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const entries: [string, string][] = [];

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          entries.push([key, v]);
        }
      } else if (typeof value === 'string') {
        entries.push([key, value]);
      }
    }
  }

  const query = new URLSearchParams(entries).toString();
  redirect(query ? `/join?${query}` : '/join');
}
import React from 'react';
import type { Metadata } from 'next';
import AdminNetworkClient from './AdminNetworkClient';

export const metadata: Metadata = {
  title: 'Network Tree & Hierarchy | Amifresh Admin',
};

export default function AdminNetworkPage() {
  return <AdminNetworkClient />;
}

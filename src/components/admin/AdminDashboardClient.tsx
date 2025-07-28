'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminDashboard } from './AdminDashboard';

type TabType = 'registrations' | 'trainings' | 'paymentMethods';

export default function AdminDashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('registrations');

  useEffect(() => {
    const tab = (searchParams.get('tab') || 'registrations') as TabType;
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  return (
    <AdminDashboard activeTab={activeTab} onTabChange={handleTabChange} />
  );
}
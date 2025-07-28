'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminUsername, setAdminUsername] = useState('Admin'); // Placeholder

  // In a real app, you'd fetch the admin's username from a session or API
  useEffect(() => {
    // Example: Fetch admin info (replace with actual auth logic)
    // const fetchAdminInfo = async () => {
    //   const res = await fetch('/api/admin/me'); // An API route to get current admin info
    //   if (res.ok) {
    //     const data = await res.json();
    //     setAdminUsername(data.username);
    //   }
    // };
    // fetchAdminInfo();
  }, []);

  const handleLogout = () => {
    // Implement actual logout logic (e.g., clear session, invalidate token)
    router.push('/'); // Redirect to login page
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-grow">
          <ul>
            <li>
              <Link href="/admin/dashboard" className={`block py-2 px-4 hover:bg-gray-700 ${pathname === '/admin/dashboard' && (!searchParams || !searchParams.get('tab')) ? 'bg-gray-700' : ''}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard?tab=registrations" className={`block py-2 px-4 hover:bg-gray-700 ${searchParams && searchParams.get('tab') === 'registrations' ? 'bg-gray-700' : ''}`}>
                Management Pendaftaran
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard?tab=trainings" className={`block py-2 px-4 hover:bg-gray-700 ${searchParams && searchParams.get('tab') === 'trainings' ? 'bg-gray-700' : ''}`}>
                Management Pelatihan
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard?tab=paymentMethods" className={`block py-2 px-4 hover:bg-gray-700 ${searchParams && searchParams.get('tab') === 'paymentMethods' ? 'bg-gray-700' : ''}`}>
                Management Pembayaran
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Welcome, {adminUsername}</h2>
          {/* Add any other header elements here */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HomeClient = dynamic(
  () => import('@/components/admin/HomeClient'), // ✅ jika alias @ aktif
  { ssr: false }
);

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading homepage...</div>}>
      <HomeClient />
    </Suspense>
  );
}

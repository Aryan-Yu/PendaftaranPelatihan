'use client';

import { useSearchParams } from 'next/navigation';

export default function HomeClient() {
  const params = useSearchParams();
  const something = params.get('something');
  
  return <div>Param: {something}</div>;
}
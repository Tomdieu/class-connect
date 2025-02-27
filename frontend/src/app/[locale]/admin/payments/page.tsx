'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/payments/plans'); // Use `replace` to prevent back navigation
  }, [router]);

  return <div>Redirecting...</div>; // Optional loading message
}

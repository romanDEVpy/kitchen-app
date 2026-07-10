'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-xs text-neutral-500 font-medium">
      Перенаправление в объединенную панель управления...
    </div>
  );
}

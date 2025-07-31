import { Suspense } from 'react';
import DashboardClient from '@/components/DashboardClient';
import LoadingScreen from '@/components/LoadingScreen';

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardClient />
    </Suspense>
  );
}
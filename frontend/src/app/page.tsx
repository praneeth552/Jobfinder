import { Suspense } from 'react';
import HomeClient from '@/components/HomeClient';
import LoadingScreen from '@/components/LoadingScreen';

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeClient />
    </Suspense>
  );
}
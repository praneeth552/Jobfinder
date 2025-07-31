import { Suspense } from 'react';
import PreferencesClient from '@/components/PreferencesClient';
import LoadingScreen from '@/components/LoadingScreen';

export default function PreferencesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PreferencesClient />
    </Suspense>
  );
}
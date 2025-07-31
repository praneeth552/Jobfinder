import { Suspense } from 'react';
import OtpClient from '@/components/OtpClient';
import LoadingScreen from '@/components/LoadingScreen';

export default function OTPPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OtpClient />
    </Suspense>
  );
}
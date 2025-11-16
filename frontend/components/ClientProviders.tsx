'use client';

import { ReactNode, lazy, Suspense } from 'react';

// Lazy load heavy components to improve initial load
const GoogleAnalytics = lazy(() => import('./GoogleAnalytics'));
const ReCaptchaProvider = lazy(() => import('./ReCaptchaProvider'));

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      <Suspense fallback={<>{children}</>}>
        <ReCaptchaProvider>
          {children}
        </ReCaptchaProvider>
      </Suspense>
    </>
  );
}


'use client';

import { ReactNode } from 'react';
import GoogleAnalytics from "./GoogleAnalytics";
import ReCaptchaProvider from "./ReCaptchaProvider";
import ReCaptchaWrapper from "./ReCaptchaWrapper";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <GoogleAnalytics />
      <ReCaptchaProvider>
        {children}
      </ReCaptchaProvider>
    </>
  );
}


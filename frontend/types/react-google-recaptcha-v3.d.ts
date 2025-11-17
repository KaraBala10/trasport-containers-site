declare module 'react-google-recaptcha-v3' {
  import { ComponentType, ReactNode } from 'react';

  export interface GoogleReCaptchaProviderProps {
    reCaptchaKey: string;
    scriptProps?: {
      async?: boolean;
      defer?: boolean;
      appendTo?: 'head' | 'body';
      nonce?: string;
    };
    children: ReactNode;
  }

  export const GoogleReCaptchaProvider: ComponentType<GoogleReCaptchaProviderProps>;
  
  export interface GoogleReCaptcha {
    executeRecaptcha: (action?: string) => Promise<string>;
  }

  export function useGoogleReCaptcha(): GoogleReCaptcha;
}


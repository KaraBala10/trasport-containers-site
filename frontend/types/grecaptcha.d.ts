// Global type definition for Google reCAPTCHA
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          size?: "normal" | "compact" | "invisible";
          theme?: "light" | "dark";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => number;
    };
  }
}

export {};


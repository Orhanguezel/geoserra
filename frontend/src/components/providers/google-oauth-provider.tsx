'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // Always wrap with GoogleOAuthProvider — if clientId is empty,
  // individual GoogleLogin components should guard themselves.
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID || 'placeholder-not-configured'}>
      {children}
    </GoogleOAuthProvider>
  );
}

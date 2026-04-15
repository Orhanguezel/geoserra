import { env } from '@/core/env';

/**
 * Google ID token doğrulama — external paket KULLANMAZ.
 * Google'ın resmi tokeninfo endpoint'i imza + exp + aud kontrolünü
 * sunucu tarafında bizim için yapar. Bizler dönen claim'leri kullanır,
 * `aud === GOOGLE_CLIENT_ID` kontrolünü tekrar uygularız.
 *
 * NOT: Production'da rate limit/availability nedeniyle yerel JWT doğrulaması
 * (jwks) tercih edilebilir; şimdilik tokeninfo endpoint'i yeterli ve basit.
 */

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

export interface GoogleTokenInfo {
  /** Subject (Google'ın stabil kullanıcı kimliği) */
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  /** Audience — GOOGLE_CLIENT_ID ile eşleşmeli */
  aud: string;
  /** Issuer — accounts.google.com veya https://accounts.google.com */
  iss: string;
  exp: number;
}

interface RawTokenInfo {
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  aud?: string;
  iss?: string;
  exp?: string | number;
  error?: string;
  error_description?: string;
}

const VALID_ISS = new Set(['accounts.google.com', 'https://accounts.google.com']);

export class GoogleTokenError extends Error {
  constructor(
    public readonly code:
      | 'invalid_token'
      | 'aud_mismatch'
      | 'iss_invalid'
      | 'expired'
      | 'no_email'
      | 'email_not_verified'
      | 'config_missing'
      | 'network',
    message: string,
  ) {
    super(message);
    this.name = 'GoogleTokenError';
  }
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new GoogleTokenError('config_missing', 'GOOGLE_CLIENT_ID env tanımlı değil');
  }

  let res: Response;
  try {
    res = await fetch(`${TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`);
  } catch (e) {
    throw new GoogleTokenError('network', `tokeninfo isteği başarısız: ${(e as Error).message}`);
  }

  if (!res.ok) {
    throw new GoogleTokenError('invalid_token', `tokeninfo http ${res.status}`);
  }

  const data = (await res.json()) as RawTokenInfo;

  if (data.error) {
    throw new GoogleTokenError('invalid_token', data.error_description || data.error);
  }

  if (!data.sub || !data.aud || !data.iss) {
    throw new GoogleTokenError('invalid_token', 'tokeninfo eksik claim');
  }

  if (data.aud !== env.GOOGLE_CLIENT_ID) {
    throw new GoogleTokenError('aud_mismatch', 'aud GOOGLE_CLIENT_ID ile eşleşmiyor');
  }

  if (!VALID_ISS.has(data.iss)) {
    throw new GoogleTokenError('iss_invalid', `iss geçersiz: ${data.iss}`);
  }

  const expSec = typeof data.exp === 'string' ? parseInt(data.exp, 10) : (data.exp ?? 0);
  if (!Number.isFinite(expSec) || expSec * 1000 < Date.now()) {
    throw new GoogleTokenError('expired', 'token süresi dolmuş');
  }

  if (!data.email) {
    throw new GoogleTokenError('no_email', 'tokeninfo email içermiyor');
  }

  const emailVerified =
    data.email_verified === true ||
    data.email_verified === 'true';

  if (!emailVerified) {
    throw new GoogleTokenError('email_not_verified', 'Google email doğrulanmamış');
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase(),
    email_verified: emailVerified,
    name: data.name,
    picture: data.picture,
    given_name: data.given_name,
    family_name: data.family_name,
    aud: data.aud,
    iss: data.iss,
    exp: expSec,
  };
}

import type { Metadata, Viewport } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from '@/lib/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from 'sonner';
import { CurrencyInitializer } from '@/components/providers/currency-initializer';
import { AuthInitializer } from '@/components/providers/auth-initializer';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://geoserra.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GeoSerra — AI Görünürlük & SEO Analiz Platformu',
    template: '%s | GeoSerra',
  },
  description:
    'Web sitenizin ChatGPT, Gemini ve Perplexity\'deki görünürlüğünü analiz edin. GEO + SEO + Lighthouse raporu tek platformda.',
  openGraph: {
    type: 'website',
    siteName: 'GeoSerra',
    locale: 'tr_TR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GeoSerra — AI Görünürlük & SEO Analiz Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://geoserra.com/#org',
        name: 'GeoSerra',
        url: 'https://geoserra.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://geoserra.com/logo-small.png',
        },
        description: 'AI destekli GEO ve SEO görünürlük analiz platformu',
        sameAs: ['https://github.com/Orhanguezel/geoserra'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://geoserra.com/#website',
        url: 'https://geoserra.com',
        name: 'GeoSerra',
        publisher: { '@id': 'https://geoserra.com/#org' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://geoserra.com/analyze?url={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://accounts.google.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${jetbrains.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem themes={['dark', 'light']}>
          <QueryProvider>
            <AuthInitializer />
            <CurrencyInitializer />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

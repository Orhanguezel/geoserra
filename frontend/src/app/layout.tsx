import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from 'sonner';
import { CurrencyInitializer } from '@/components/providers/currency-initializer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://geoserra.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7C3AED',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GeoSerra — GEO SEO Performance',
    template: '%s | GeoSerra',
  },
  description: 'Yapay zeka destekli SEO analizi. Sitenizin Google AI, ChatGPT ve Perplexity\'deki görünürlüğünü artırın.',
  openGraph: {
    type: 'website',
    siteName: 'GeoSerra',
    locale: 'tr_TR',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <CurrencyInitializer />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}

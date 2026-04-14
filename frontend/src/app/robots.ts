import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/checkout', '/report', '/thank-you', '/api/'] },
      { userAgent: ['GPTBot', 'Google-Extended', 'PerplexityBot', 'ClaudeBot'], allow: '/' },
    ],
    sitemap: 'https://geoserra.com/sitemap.xml',
  };
}

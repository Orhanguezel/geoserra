import type { MetadataRoute } from 'next';

const base = 'https://geoserra.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/analyze`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/implementation`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/hakkimizda`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/iletisim`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/gizlilik`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/kullanim-sartlari`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];
}

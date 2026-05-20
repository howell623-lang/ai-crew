import { Metadata } from 'next';

const SITE_URL = 'https://ai-crew.vercel.app';

export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
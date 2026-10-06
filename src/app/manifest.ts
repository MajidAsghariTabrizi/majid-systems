import type { MetadataRoute } from 'next';

import { SITE } from '@/content/shared';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quantiviq — Rebuild the Company',
    short_name: 'Quantiviq',
    description:
      'AI-native organization design: structure, workflows, agents, decision systems and a persistent company brain engineered as one operating model.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0b0d',
    theme_color: '#0a0b0d',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
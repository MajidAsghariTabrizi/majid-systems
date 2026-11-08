import type { MetadataRoute } from 'next';

import { SITE } from '@/content/shared';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quantiviq — Better Decisions, Connected Work',
    short_name: 'Quantiviq',
    description:
      'AI-native organization design: structure, workflows, agents, decision systems and a persistent company brain engineered as one operating model.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f1e9',
    theme_color: '#542b3a',
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

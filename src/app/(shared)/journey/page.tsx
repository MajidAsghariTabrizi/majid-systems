import type { Metadata } from 'next';
import { JourneyExperience } from '@/components/journey/JourneyExperience';
import { JOURNEY_META } from '@/content/journey';

export const metadata: Metadata = {
  title: JOURNEY_META.title,
  description: JOURNEY_META.description,
  alternates: { canonical: JOURNEY_META.url },
  openGraph: {
    type: 'website',
    url: JOURNEY_META.url,
    siteName: 'Quantiviq',
    title: JOURNEY_META.title,
    description: JOURNEY_META.description,
  },
};

export default function JourneyPage() {
  return <JourneyExperience />;
}

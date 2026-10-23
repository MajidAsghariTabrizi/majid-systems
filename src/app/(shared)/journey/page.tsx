import type { Metadata } from 'next';
import { JourneyExperience } from '@/components/journey/JourneyExperience';
import { JOURNEY_META } from '@/content/journey';
import { socialMeta } from '@/lib/social';

export const metadata: Metadata = {
  title: JOURNEY_META.title,
  description: JOURNEY_META.description,
  ...socialMeta({
    title: JOURNEY_META.title,
    description: JOURNEY_META.description,
    path: '/journey',
  }),
  
};

export default function JourneyPage() {
  return <JourneyExperience />;
}

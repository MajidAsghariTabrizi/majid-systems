import type { Metadata } from 'next';
import { ExecutiveDialogue } from '@/components/exec/ExecutiveDialogue';

export const metadata: Metadata = {
  title: 'Executive Dialogue — Majid Asghari Tabrizi',
  description: 'An unlisted, AI-powered executive dialogue grounded in verified public material.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noarchive: true } },
};

export default function MeetMajidPage() {
  return <ExecutiveDialogue />;
}

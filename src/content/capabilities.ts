export type CapabilityGroup = {
  title: string;
  category: 'product' | 'ai' | 'systems' | 'engineering';
  blurb: string;
  items: string[];
};

export const CAPABILITIES: CapabilityGroup[] = [
  {
    title: 'Product',
    category: 'product',
    blurb:
      'Strategy, discovery, marketplace mechanics, growth, monetization, experimentation, and analytics — applied to systems that have to ship.',
    items: [
      'Product strategy and discovery',
      'Marketplace and platform products',
      'Growth and monetization',
      'Experimentation and ranking',
      'Analytics and operator dashboards',
      'Risk-controlled decision products',
      'Staged release and rollback planning',
    ],
  },
  {
    title: 'AI / Agents',
    category: 'ai',
    blurb:
      'Models are not the product. Routing, harnesses, evaluation, tooling, and feedback loops are.',
    items: [
      'AI engineering',
      'Agent architecture and operating kernels',
      'Model routing and provider abstraction',
      'Harnesses and tool hygiene',
      'Evaluation and failure classification',
      'Bounded retry and recovery',
      'Context budget and memory management',
    ],
  },
  {
    title: 'Systems',
    category: 'systems',
    blurb:
      'Distributed systems, event-driven architecture, observability, reliability, economic controls, and pipelines.',
    items: [
      'Distributed systems',
      'Event-driven architecture (NATS, queues)',
      'Observability (Prometheus, dashboards)',
      'Reliability and protected release',
      'Economic controls and risk gates',
      'Dual-provider authority and reconciliation',
      'Data pipelines and durable evidence',
    ],
  },
  {
    title: 'Engineering',
    category: 'engineering',
    blurb:
      'Languages and infrastructure I have shipped against. Each one earned its place on a real system.',
    items: [
      'Python',
      'Rust',
      'Go',
      'TypeScript / JavaScript',
      'Solidity',
      'SQL (PostgreSQL, SQLite)',
      'Docker / Docker Compose',
      'PostgreSQL, NATS JetStream, Prometheus',
      'GitHub Actions and protected CI/CD',
    ],
  },
];
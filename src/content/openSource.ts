export type OpenSourceItem = {
  slug: string;
  name: string;
  url: string;
  kind: 'own-original' | 'own-fork' | 'curated';
  description: string;
  language?: string;
  license?: string;
  role: 'maintainer' | 'curator' | 'forker' | 'contributor';
};

export const OPEN_SOURCE_ITEMS: OpenSourceItem[] = [
  {
    slug: 'free-best-router',
    name: 'free-best-router',
    url: 'https://github.com/MajidAsghariTabrizi/free-best-router',
    kind: 'own-original',
    description:
      'Open-source, MIT-licensed, OpenAI-compatible intelligent router for free AI models. 52 deterministic unit tests, GH Actions CI, DeepSeek Harness integration.',
    language: 'JavaScript',
    license: 'MIT',
    role: 'maintainer',
  },
  {
    slug: 'universal-engineering-agent',
    name: 'universal-engineering-agent',
    url: 'https://github.com/MajidAsghariTabrizi/universal-engineering-agent',
    kind: 'own-original',
    description:
      'MIT-licensed reference implementation of the Universal Engineering Agent operating-kernel contract. Profile-agnostic, zero runtime deps, 31 self-tests.',
    language: 'JavaScript',
    license: 'MIT',
    role: 'maintainer',
  },
  {
    slug: 'anti-gravity-phoenix-v4',
    name: 'anti-gravity-phoenix-v4',
    url: 'https://github.com/MajidAsghariTabrizi/anti-gravity-phoenix-v4',
    kind: 'own-original',
    description:
      'Production-grade, AI-assisted financial intelligence and execution system for Arbitrum. Public defaults remain safe; production secrets and activation authority live server-side.',
    language: 'Rust',
    role: 'maintainer',
  },
  {
    slug: 'smart-trader',
    name: 'smart-trader',
    url: 'https://github.com/MajidAsghariTabrizi/smart-trader',
    kind: 'own-original',
    description:
      'Algorithmic trading system with FastAPI backend, multi-provider market data, behavior intelligence, ADX/ATR-gated decision engine, staged deployment.',
    language: 'Python',
    role: 'maintainer',
  },
  {
    slug: 'majid-systems',
    name: 'majid-systems',
    url: 'https://github.com/MajidAsghariTabrizi/majid-systems',
    kind: 'own-original',
    description:
      'This portfolio. Next.js + TypeScript, content as typed modules, build-time GitHub data integration.',
    language: 'TypeScript',
    license: 'MIT',
    role: 'maintainer',
  },
];

export const FORK_ITEMS: OpenSourceItem[] = [
  {
    slug: 'awesome-deepseek-harness',
    name: 'awesome-deepseek-harness',
    url: 'https://github.com/MajidAsghariTabrizi/awesome-deepseek-harness',
    kind: 'curated',
    description:
      'Fork of Dominic789654/awesome-deepseek-harness. A curated list of plugins, skills, MCP servers, patch/profile layers, orchestrators & UIs for DeepSeek Harness (DSH).',
    language: 'TypeScript',
    role: 'curator',
  },
  {
    slug: 'awesome-deepseek-harness-plugins',
    name: 'awesome-deepseek-harness-plugins',
    url: 'https://github.com/MajidAsghariTabrizi/awesome-deepseek-harness-plugins',
    kind: 'curated',
    description:
      'Fork of imsai-sh/awesome-deepseek-harness-plugins. Community plugin catalog with auto-generation, JSON Schema validation, free public query API.',
    language: 'JavaScript',
    license: 'MIT',
    role: 'curator',
  },
  {
    slug: 'awesome-dsh-plugin',
    name: 'awesome-dsh-plugin',
    url: 'https://github.com/MajidAsghariTabrizi/awesome-dsh-plugin',
    kind: 'curated',
    description:
      'Fork of Anil-matcha/awesome-dsh-plugin. Initial plugin directory and community catalog design reference.',
    role: 'curator',
  },
  {
    slug: 'medusa',
    name: 'medusa',
    url: 'https://github.com/MajidAsghariTabrizi/medusa',
    kind: 'own-fork',
    description:
      'Fork of medusajs/medusa. Studied as a reference for commerce platform architecture.',
    language: 'TypeScript',
    role: 'forker',
  },
  {
    slug: 'payload',
    name: 'payload',
    url: 'https://github.com/MajidAsghariTabrizi/payload',
    kind: 'own-fork',
    description:
      'Fork of payloadcms/payload. Studied as a reference for Next.js-native headless CMS / backend architecture.',
    language: 'TypeScript',
    license: 'MIT',
    role: 'forker',
  },
  {
    slug: 'saleor',
    name: 'saleor',
    url: 'https://github.com/MajidAsghariTabrizi/saleor',
    kind: 'own-fork',
    description:
      'Fork of saleor/saleor. Studied as a reference for high-performance, composable, headless commerce API design.',
    language: 'Python',
    license: 'BSD-3-Clause',
    role: 'forker',
  },
  {
    slug: 'v3-periphery',
    name: 'v3-periphery',
    url: 'https://github.com/MajidAsghariTabrizi/v3-periphery',
    kind: 'own-fork',
    description:
      'Fork of Uniswap/v3-periphery. Studied as a reference for peripheral smart-contract design.',
    language: 'TypeScript',
    license: 'GPL-2.0',
    role: 'forker',
  },
  {
    slug: 'arbitrum',
    name: 'Arbitrum',
    url: 'https://github.com/MajidAsghariTabrizi/Arbitrum',
    kind: 'own-original',
    description:
      'Profile-era repository; description "Product manager and web developer". The starting point of this work.',
    role: 'maintainer',
  },
];
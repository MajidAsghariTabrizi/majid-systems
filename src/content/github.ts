/**
 * Build-time GitHub data integration.
 *
 * Caches the API response into .cached-github.json so the production build does
 * not depend on GitHub being available. If the cache exists, the API is not
 * called. The cache is git-ignored (see .gitignore).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { SITE } from './shared';

const CACHE_PATH = resolve(process.cwd(), '.cached-github.json');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export type GitHubRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  fork: boolean;
  archived: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size_kb: number;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  parent_full_name: string | null;
  license_spdx_id: string | null;
};

export type GitHubUser = {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

export type GitHubData = {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  fetchedAt: string;
  source: 'cache' | 'live';
};

const FALLBACK_REPOS: GitHubRepo[] = [
  {
    name: 'anti-gravity-phoenix-v4',
    full_name: 'MajidAsghariTabrizi/anti-gravity-phoenix-v4',
    html_url: 'https://github.com/MajidAsghariTabrizi/anti-gravity-phoenix-v4',
    description:
      'Production-grade, AI-assisted financial intelligence and execution system for Arbitrum: Aave V3 liquidation screening, Atlas auction solver readiness, and DEX arbitrage research. Fail-closed, exact-state authority, protected execution.',
    fork: false,
    archived: false,
    language: 'Rust',
    stargazers_count: 2,
    forks_count: 0,
    size_kb: 4437,
    updated_at: '2026-09-02T14:13:11Z',
    pushed_at: '2026-09-02T14:13:11Z',
    topics: [
      'aave-v3',
      'arbitrum',
      'atlas-auction',
      'dex-arbitrage',
      'fail-closed',
      'financial-infrastructure',
      'liquidation',
      'mev',
      'production-ready',
      'rust',
    ],
    parent_full_name: null,
    license_spdx_id: null,
  },
  {
    name: 'smart-trader',
    full_name: 'MajidAsghariTabrizi/smart-trader',
    html_url: 'https://github.com/MajidAsghariTabrizi/smart-trader',
    description: 'Algorithmic trading system with FastAPI backend and staged deployment.',
    fork: false,
    archived: false,
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    size_kb: 789,
    updated_at: '2026-09-01T07:11:05Z',
    pushed_at: '2026-09-01T07:11:05Z',
    topics: [],
    parent_full_name: null,
    license_spdx_id: null,
  },
  {
    name: 'free-best-router',
    full_name: 'MajidAsghariTabrizi/free-best-router',
    html_url: 'https://github.com/MajidAsghariTabrizi/free-best-router',
    description:
      'Open-source intelligent router for automatically discovering, ranking, health-checking, and routing requests to the best available free AI models.',
    fork: false,
    archived: false,
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    size_kb: 79,
    updated_at: '2026-09-03T13:43:31Z',
    pushed_at: '2026-09-03T13:43:31Z',
    topics: [
      'ai',
      'ai-agents',
      'ai-router',
      'cerebras',
      'deepseek',
      'deepseek-harness',
      'developer-tools',
      'free-ai',
      'free-llm',
      'groq',
      'llm',
      'llm-gateway',
      'llm-router',
      'mistral',
      'model-routing',
      'openai-compatible',
      'openrouter',
    ],
    parent_full_name: null,
    license_spdx_id: 'MIT',
  },
  {
    name: 'universal-engineering-agent',
    full_name: 'MajidAsghariTabrizi/universal-engineering-agent',
    html_url: 'https://github.com/MajidAsghariTabrizi/universal-engineering-agent',
    description:
      'Reference implementation of the Universal Engineering Agent operating-kernel contract — profile-agnostic, runnable, MIT-licensed.',
    fork: false,
    archived: false,
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    size_kb: 55,
    updated_at: '2026-09-03T08:57:27Z',
    pushed_at: '2026-09-03T08:57:27Z',
    topics: [
      'agent-framework',
      'checkpoint',
      'context-engine',
      'deepseek-harness',
      'dsh',
      'engineering-agent',
      'failure-classification',
      'mission',
      'mit-license',
      'open-source',
      'profile-driven',
      'universal-engineering-agent',
      'verification',
    ],
    parent_full_name: null,
    license_spdx_id: 'MIT',
  },
];

const FALLBACK_USER: GitHubUser = {
  login: 'MajidAsghariTabrizi',
  name: 'majid asghari',
  bio: '',
  avatar_url: 'https://avatars.githubusercontent.com/u/59647784',
  html_url: 'https://github.com/MajidAsghariTabrizi',
  public_repos: 17,
  followers: 2,
  following: 5,
  created_at: '2020-01-08T10:47:08Z',
};

function readCache(): GitHubData | null {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    const raw = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as GitHubData;
    if (!raw.fetchedAt) return null;
    const ageMs = Date.now() - new Date(raw.fetchedAt).getTime();
    if (ageMs > CACHE_TTL_MS) return null;
    return { ...raw, source: 'cache' };
  } catch {
    return null;
  }
}

function writeCache(data: GitHubData): void {
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
  } catch {
    // Best-effort cache write; do not fail the build.
  }
}

async function fetchLive(): Promise<GitHubData> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'majid-systems-portfolio',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const userResp = await fetch(`https://api.github.com/users/${SITE.githubUser}`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  let user: GitHubUser | null = null;
  if (userResp.ok) {
    const u = (await userResp.json()) as {
      login: string;
      name: string;
      bio: string;
      avatar_url: string;
      html_url: string;
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    };
    user = {
      login: u.login,
      name: u.name,
      bio: u.bio,
      avatar_url: u.avatar_url,
      html_url: u.html_url,
      public_repos: u.public_repos,
      followers: u.followers,
      following: u.following,
      created_at: u.created_at,
    };
  }

  const reposResp = await fetch(
    `https://api.github.com/users/${SITE.githubUser}/repos?per_page=100&sort=pushed`,
    { headers, signal: AbortSignal.timeout(8000) }
  );
  const repos: GitHubRepo[] = [];
  if (reposResp.ok) {
    const arr = (await reposResp.json()) as Array<{
      name: string;
      full_name: string;
      html_url: string;
      description: string | null;
      fork: boolean;
      archived: boolean;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      size: number;
      updated_at: string;
      pushed_at: string;
      topics?: string[];
      parent?: { full_name: string };
      license?: { spdx_id: string };
    }>;
    for (const r of arr) {
      repos.push({
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description ?? '',
        fork: r.fork,
        archived: r.archived,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        size_kb: r.size,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        topics: r.topics ?? [],
        parent_full_name: r.parent?.full_name ?? null,
        license_spdx_id: r.license?.spdx_id ?? null,
      });
    }
  }

  return {
    user,
    repos,
    fetchedAt: new Date().toISOString(),
    source: 'live',
  };
}

export async function getGitHubData(): Promise<GitHubData> {
  const cached = readCache();
  if (cached) return cached;
  try {
    const live = await fetchLive();
    if (live.repos.length > 0 || live.user) {
      writeCache(live);
      return live;
    }
  } catch {
    // fall through to fallback
  }
  return {
    user: FALLBACK_USER,
    repos: FALLBACK_REPOS,
    fetchedAt: new Date().toISOString(),
    source: 'cache',
  };
}

export const FLAGSHIP_REPOS: ReadonlyArray<{ slug: string; name: string; url: string }> = [
  { slug: 'phoenix', name: 'anti-gravity-phoenix-v4', url: FALLBACK_REPOS[0].html_url },
  { slug: 'smart-trader', name: 'smart-trader', url: FALLBACK_REPOS[1].html_url },
  { slug: 'free-best-router', name: 'free-best-router', url: FALLBACK_REPOS[2].html_url },
  {
    slug: 'universal-engineering-agent',
    name: 'universal-engineering-agent',
    url: FALLBACK_REPOS[3].html_url,
  },
];

export function repoByName(repos: GitHubRepo[], name: string): GitHubRepo | undefined {
  return repos.find((r) => r.name === name);
}
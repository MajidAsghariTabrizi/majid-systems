import type { Project } from '@/content/projects';
import type { Note } from '@/content/notes';
import { SITE } from '@/content/shared';

type JsonLdProps = {
  data: Record<string, unknown>;
};

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function HomeJsonLd() {
  const personData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.canonicalUrl}/#founder`,
    name: SITE.fullName,
    alternateName: [SITE.fullNameFa, SITE.name],
    url: SITE.canonicalUrl,
    image: `${SITE.canonicalUrl}${SITE.ogImage}`,
    sameAs: [SITE.githubUrl, SITE.linkedinUrl].filter(Boolean),
    jobTitle: SITE.founderTitle,
    worksFor: {
      '@id': `${SITE.canonicalUrl}/#organization`,
      '@type': 'Organization',
      name: 'Quantiviq',
      url: SITE.canonicalUrl,
    },
    knowsAbout: [
      'Product strategy',
      'Marketplace systems',
      'AI engineering',
      'Agent architecture',
      'Model routing',
      'Distributed systems',
      'Production engineering',
      'Blockchain infrastructure',
      'Arbitrum',
      'Aave V3',
      'Atlas auction',
      'Solidity',
      'Rust',
      'Go',
      'Python',
      'TypeScript',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: SITE.location,
    },
  };

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${SITE.name} — Portfolio`,
    url: SITE.canonicalUrl,
    description: SITE.description,
    inLanguage: 'en-US',
    author: { '@type': 'Person', name: SITE.name },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.canonicalUrl}/notes?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLdScript data={personData} />
      <JsonLdScript data={websiteData} />
    </>
  );
}

export function QuantiviqJsonLd() {
  // One @graph, two @id-linked entities: the founder and the organization
  // reference each other (Organization.founder <-> Person.worksFor), so any
  // consumer resolves the connection unambiguously. No duplicate Person or
  // Organization nodes are emitted anywhere else on locale pages.
  const ORG_ID = `${SITE.canonicalUrl}/#organization`;
  const FOUNDER_ID = `${SITE.canonicalUrl}/#founder`;
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': FOUNDER_ID,
        name: SITE.fullName,
        alternateName: [SITE.fullNameFa, SITE.name],
        jobTitle: SITE.founderTitle,
        url: `${SITE.canonicalUrl}/en/about`,
        image: `${SITE.canonicalUrl}${SITE.ogImage}`,
        sameAs: [SITE.githubUrl, SITE.linkedinUrl].filter(Boolean),
        worksFor: { '@id': ORG_ID },
        address: { '@type': 'PostalAddress', addressCountry: SITE.location },
      },
      {
        '@type': 'ProfessionalService',
        '@id': ORG_ID,
        name: 'Quantiviq',
        url: SITE.canonicalUrl,
        description:
          'AI-native organization transformation: structure, workflows, agents, decision systems and a persistent company brain engineered as one operating model.',
        slogan: 'Rebuild the company.',
        founder: { '@id': FOUNDER_ID },
        areaServed: 'Worldwide',
        serviceType: [
          'AI-native organization design',
          'Function restructuring',
          'Company brain implementation',
          'Agent runtime and workflow design',
        ],
        knowsAbout: [
          'AI-native organizations',
          'Organizational design',
          'Company brain',
          'Agent runtime',
          'Model routing',
          'Decision systems',
          'Workflow design',
        ],
      },
    ],
  };
  return <JsonLdScript data={graph} />;
}

export function ProjectJsonLd({ project: p }: { project: Project }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: p.name,
    description: p.thesis,
    url: `${SITE.canonicalUrl}/work/${p.slug}`,
    codeRepository: p.githubUrl,
    programmingLanguage: p.languages,
    keywords: p.topics?.join(', '),
    author: { '@type': 'Person', name: SITE.name, url: SITE.githubUrl },
    creator: { '@type': 'Person', name: SITE.name, url: SITE.githubUrl },
    license: 'https://opensource.org/licenses/MIT',
    dateCreated: p.dates.started,
    dateModified: p.dates.latest,
    about: p.problem,
    applicationCategory: p.category === 'flagship' ? 'DeveloperApplication' : 'WebApplication',
  };
  return <JsonLdScript data={data} />;
}

export function NoteJsonLd({ note: n }: { note: Note }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: n.title,
    abstract: n.lede,
    articleBody: n.body.join(' '),
    datePublished: n.date,
    dateModified: n.date,
    inLanguage: 'en-US',
    author: { '@type': 'Person', name: SITE.name, url: SITE.githubUrl },
    publisher: { '@type': 'Person', name: SITE.name, url: SITE.canonicalUrl },
    keywords: n.category,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE.canonicalUrl}/notes/${n.slug}`,
    },
  };
  return <JsonLdScript data={data} />;
}
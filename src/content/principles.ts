export type Principle = {
  title: string;
  body: string;
};

export const PRINCIPLES: Principle[] = [
  {
    title: 'Build for the real constraint',
    body:
      'Systems are constrained by the boring parts: data quality, latency, fees, signers, deploys, recovery. The interesting parts are easy by comparison. Optimize for the boring parts first.',
  },
  {
    title: 'Make uncertainty explicit',
    body:
      'If the system does not know something, the system must say so. Hiding uncertainty turns honest signals into dangerous actions.',
  },
  {
    title: 'Separate intelligence from authority',
    body:
      'The component that computes opportunity must not be the component that holds the keys. Authority is granted through explicit gates, not proximity to the model.',
  },
  {
    title: 'Measure economic reality, not proxy metrics',
    body:
      'Transaction count, gross spread, and modelled PnL are intermediate signals. Realized net PnL after every actual cost is the only authority.',
  },
  {
    title: 'Production is part of the product',
    body:
      'Deployment, rollback, observability, and reconciliation are product capabilities. A system that cannot be safely released is not a product.',
  },
  {
    title: 'Prefer systems that fail safely',
    body:
      'When uncertainty grows, authority should shrink. Fail-closed is not slow — fail-closed is fast at refusing the wrong thing.',
  },
  {
    title: 'Automate the boring path, protect the dangerous path',
    body:
      'Routine decisions should be automated. Decisions with irreversible consequences should pass through gates a human — or a defense-in-depth system — must approve.',
  },
  {
    title: 'Design the interface around what the caller wants to say',
    body:
      'The caller does not want to know your ecosystem. They want to express their intent. Make the interface that intent; absorb the churn underneath.',
  },
  {
    title: 'Trust is a product',
    body:
      'Operators are users. A system they cannot trust in one screen is a system they will not use, regardless of how good its edge is.',
  },
  {
    title: 'Split universal from specific',
    body:
      'Universal behavior belongs in a kernel. Project-specific behavior belongs in a profile. Profiles are inspectable, versionable, and small.',
  },
];
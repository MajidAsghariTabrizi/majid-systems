import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <section className="q-hero" style={{ minHeight: '60vh' }}>
      <div className="container-narrow" style={{ textAlign: 'center' }}>
        <span className="eyebrow sig">404</span>
        <h1 className="q-display">Not found.</h1>
        <p className="q-hero-body">The page you are looking for does not exist — or has moved.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link href="/en" className="btn btn-primary">English home →</Link>
          <Link href="/fa" className="btn">فارسی</Link>
        </div>
      </div>
    </section>
  );
}

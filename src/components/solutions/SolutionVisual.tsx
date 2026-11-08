import type { Locale } from '@/content/i18n';
import type { SolutionCategory } from '@/content/solutions';

type VisualVariant = 'hero' | 'detail' | 'card';

/** Original, code-native illustrations. These describe a possible workflow;
 * they are deliberately not screenshots, fabricated metrics or customer data. */
const VISUAL_COPY = {
  sales: {
    en: ['Customer requests', 'Human review', 'A prepared sales response'],
    fa: ['درخواست‌های مشتری', 'بازبینی و تأیید انسانی', 'پاسخ آماده برای فروش'],
  },
  finance: {
    en: ['Invoices and transactions', 'Human review', 'A clearer cash picture'],
    fa: ['صورتحساب‌ها و تراکنش‌ها', 'بازبینی و تأیید انسانی', 'تصویری روشن از نقدینگی'],
  },
  operations: {
    en: ['Orders and work records', 'Human review', 'An actionable work queue'],
    fa: ['سفارش‌ها و سوابق کار', 'بازبینی و تأیید انسانی', 'صف کاری قابل پیگیری'],
  },
  cx: {
    en: ['Questions and feedback', 'Human review', 'A consistent customer response'],
    fa: ['پرسش‌ها و بازخوردها', 'بازبینی و تأیید انسانی', 'پاسخ منسجم به مشتری'],
  },
  enterprise: {
    en: ['Documents and knowledge', 'Human review', 'Answers linked to their sources'],
    fa: ['اسناد و دانش سازمان', 'بازبینی و تأیید انسانی', 'پاسخ همراه با منبع'],
  },
  commerce: {
    en: ['Product and sales signals', 'Human review', 'A decision ready to examine'],
    fa: ['داده‌های محصول و فروش', 'بازبینی و تأیید انسانی', 'پیشنهاد آماده برای بررسی'],
  },
} satisfies Record<SolutionCategory, { en: string[]; fa: string[] }>;

const C = {
  ink: 'var(--brand, #542b3a)',
  line: 'var(--border, #d9cfc4)',
  muted: 'var(--text-muted, #6c6065)',
  accent: 'var(--celadon, #e7c5a6)',
  pale: 'var(--selected, #eee0dc)',
  paper: 'var(--surface, #fffdf8)',
  warm: 'var(--surface-2, #ece5d9)',
  copper: 'var(--copper, #ab5836)',
};

function Check({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <path d="M-5 0l3.5 3.5L6-5" transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={C.ink} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />;
}

function InputRecords() {
  return (
    <g>
      <rect x="38" y="88" width="126" height="156" rx="12" fill={C.warm} stroke={C.line} transform="rotate(-7 101 166)" />
      <rect x="47" y="92" width="126" height="156" rx="12" fill={C.pale} stroke={C.line} transform="rotate(5 110 170)" />
      <rect x="46" y="87" width="126" height="156" rx="12" fill={C.paper} stroke={C.line} />
      <rect x="61" y="105" width="29" height="29" rx="7" fill={C.pale} />
      <path d="M69 119h13m-13 5h9m-9-10h8" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M103 113h47m-47 10h32" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
      {[156, 178, 200, 222].map((y, i) => (
        <g key={y}>
          <circle cx="64" cy={y} r="3" fill={i === 2 ? C.copper : C.muted} />
          <path d={`M77 ${y}h${i % 2 ? 62 : 74}`} stroke={C.line} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function ReviewEngine() {
  return (
    <g>
      <circle cx="281" cy="167" r="52" fill="none" stroke={C.line} strokeDasharray="3 7" />
      <rect x="246" y="132" width="70" height="70" rx="21" fill={C.ink} />
      <path d="M263 155h13v-9m0 9h14v-9m-27 9v24h13v9m0-9h14v9m0-33v24m-27-12h27m-14-12v24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="304" cy="199" r="17" fill={C.accent} stroke={C.paper} strokeWidth="4" />
      <Check x={304} y={199} />
      <path d="M183 166h39m-7-5 7 5-7 5M339 166h31m-7-5 7 5-7 5" fill="none" stroke={C.muted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="198" cy="166" r="3.5" fill={C.ink} />
      <circle cx="352" cy="166" r="3.5" fill={C.copper} />
    </g>
  );
}

function OutputPanel({ category }: { category: SolutionCategory }) {
  return (
    <g>
      <rect x="383" y="58" width="214" height="218" rx="15" fill={C.paper} stroke={C.line} />
      <path d="M383 95h214" stroke={C.line} />
      <circle cx="400" cy="77" r="3" fill={C.ink} />
      <circle cx="412" cy="77" r="3" fill={C.accent} />
      <path d="M430 77h76" stroke={C.line} strokeWidth="4" strokeLinecap="round" />
      {category === 'sales' && (
        <g>
          <rect x="404" y="114" width="34" height="34" rx="8" fill={C.pale} />
          <path d="M414 124h14m-14 6h14m-14 6h8" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
          <path d="M451 122h118m-118 13h76" stroke={C.line} strokeWidth="4" strokeLinecap="round" />
          {[169, 190, 211].map(y => <g key={y}><path d={`M405 ${y}h97m28 0h42`} stroke={C.line} strokeWidth="4" strokeLinecap="round" /><circle cx="516" cy={y} r="2" fill={C.muted} /></g>)}
          <rect x="497" y="235" width="78" height="22" rx="11" fill={C.accent} />
          <Check x={536} y={247} scale={0.8} />
        </g>
      )}
      {category === 'finance' && (
        <g>
          <rect x="403" y="112" width="174" height="43" rx="8" fill={C.pale} />
          <path d="M415 126h66m-66 13h41" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
          <path d="M527 137l8-6 9 2 14-10" stroke={C.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {[178, 206, 234].map((y, i) => <g key={y}><circle cx="416" cy={y} r="6" fill={i === 1 ? C.warm : C.accent} /><path d={`M433 ${y}h68m21 0h42`} stroke={C.line} strokeWidth="4" strokeLinecap="round" /></g>)}
        </g>
      )}
      {category === 'operations' && (
        <g>
          {[405, 462, 519].map((x, i) => <g key={x}>
            <rect x={x} y="115" width="53" height="141" rx="6" fill={C.pale} />
            <path d={`M${x + 9} 129h32`} stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
            {[147, 180, ...(i === 1 ? [213] : [])].map((y, j) => <g key={y}><rect x={x + 5} y={y} width="43" height="26" rx="4" fill={i === 2 ? C.accent : C.paper} stroke={C.line} />{i === 2 ? <Check x={x + 26} y={y + 14} scale={0.65} /> : <path d={`M${x + 12} ${y + 10}h${j ? 15 : 26}m-26 7h18`} stroke={C.line} strokeWidth="2" strokeLinecap="round" />}</g>)}
          </g>)}
        </g>
      )}
      {category === 'cx' && (
        <g>
          <rect x="403" y="115" width="125" height="43" rx="10" fill={C.pale} />
          <path d="M416 129h93m-93 13h64" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
          <path d="M442 170h132v61H450l-11 10v-63a8 8 0 0 1 3-8Z" fill={C.ink} />
          <path d="M452 185h104m-104 12h88m-88 12h64" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
          <circle cx="563" cy="244" r="10" fill={C.accent} /><Check x={563} y={244} scale={0.65} />
        </g>
      )}
      {category === 'enterprise' && (
        <g>
          <path d="M405 119h124m-124 13h164m-164 13h135" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
          <rect x="403" y="163" width="173" height="32" rx="7" fill={C.pale} />
          <path d="M415 176h109m-109 9h78" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
          {[406, 464, 522].map(x => <g key={x}><rect x={x} y="211" width="49" height="44" rx="6" fill={C.paper} stroke={C.line} /><path d={`M${x + 10} 224h29m-29 8h23m-23 8h17`} stroke={C.line} strokeWidth="2" strokeLinecap="round" /></g>)}
          <path d="M490 195v9m-59 7v-7h118v7" fill="none" stroke={C.muted} strokeWidth="1.3" />
        </g>
      )}
      {category === 'commerce' && (
        <g>
          <path d="M405 119h85m-85 11h47" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
          <path d="M406 222h166" stroke={C.line} />
          {[{x:414,h:35},{x:448,h:58},{x:482,h:48},{x:516,h:85},{x:550,h:69}].map(({x,h}, i) => <rect key={x} x={x} y={222-h} width="21" height={h} rx="4" fill={i === 3 ? C.ink : C.accent} />)}
          <path d="M420 171l38-28 32 9 37-34 31 12" fill="none" stroke={C.copper} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="527" cy="118" r="3.5" fill={C.copper} />
          <path d="M406 244h112" stroke={C.line} strokeWidth="4" strokeLinecap="round" />
          <rect x="542" y="236" width="31" height="16" rx="8" fill={C.pale} />
        </g>
      )}
    </g>
  );
}

export function SolutionVisual({ locale, category = 'enterprise', variant = 'detail' }: {
  locale: Locale;
  category?: SolutionCategory;
  variant?: VisualVariant;
}) {
  const l = locale === 'fa' ? 'fa' : 'en';
  const labels = variant === 'hero'
    ? l === 'fa'
      ? ['داده‌های کسب‌وکار شما', 'هوش مصنوعی، با نظارت شما', 'خروجی قابل استفاده در کار']
      : ['Your business data', 'AI, with your oversight', 'An output your team can use']
    : VISUAL_COPY[category][l];
  const accessibleDescription = l === 'fa'
    ? `نمای مفهومی فرایند: ${labels[0]}، سپس ${labels[1]}، و در پایان ${labels[2]}.`
    : `Illustrative workflow: ${labels[0]}, then ${labels[1]}, resulting in ${labels[2]}.`;
  const card = variant === 'card';

  return (
    <figure className={`sol-visual sol-visual--${variant} sol-visual--${category}`} style={{ margin: 0, minWidth: 0 }}>
      {!card && <div className="sol-visual-kicker">{l === 'fa' ? 'از داده تا اقدام' : 'From information to action'}<span aria-hidden="true">↗</span></div>}
      <svg
        viewBox={card ? '380 56 220 224' : '0 0 640 320'}
        width="640"
        height={card ? '652' : '320'}
        style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
        role={card ? undefined : 'img'}
        aria-label={card ? undefined : accessibleDescription}
        aria-hidden={card || undefined}
        focusable="false"
      >
        {!card && <g stroke={C.line} strokeOpacity="0.27" strokeDasharray="2 6"><path d="M18 38h604M18 292h604M18 38v254M622 38v254" /></g>}
        <g transform={l === 'fa' && !card ? 'translate(640 0) scale(-1 1)' : undefined}>
          {!card && <><InputRecords /><ReviewEngine /></>}
          <OutputPanel category={variant === 'hero' ? 'enterprise' : category} />
        </g>
      </svg>
      {!card && <>
        <div className="sol-visual-labels" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }} aria-hidden="true">
          {labels.map((label, i) => <span key={label}><small>{l === 'fa' ? ['۰۱', '۰۲', '۰۳'][i] : `0${i + 1}`}</small>{label}</span>)}
        </div>
        <figcaption className="sol-visual-caption">{l === 'fa' ? 'نمای مفهومی؛ جزئیات اجرا متناسب با فرایند شما طراحی می‌شود.' : 'Illustrative workflow. The implementation is designed around your process.'}</figcaption>
      </>}
    </figure>
  );
}

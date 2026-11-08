import type { Locale } from '@/content/i18n';

/** Display translations only. Canonical status and evidence codes stay intact. */
const FA_STATUS: Record<string, string> = {
  'IN DAILY USE': 'در استفاده روزانه',
  PRODUCTION: 'در بهره‌برداری',
  'MIT · v0.1.0': 'مجوز MIT · نسخه ۰٫۱٫۰',
  'RETIRED 2026-09-17': 'متوقف‌شده · ۱۷ سپتامبر ۲۰۲۶',
  'MIT · REFERENCE': 'نمونه مرجع · مجوز MIT',
};

const FA_LEVEL: Record<string, string> = {
  'PUBLICLY VERIFIED': 'قابل بررسی عمومی',
  'OWNER-ATTESTED': 'اعلام‌شده توسط سازنده',
  DEMONSTRATION: 'نمایش مفهومی',
  ARCHIVED: 'بایگانی‌شده',
};

const FA_DESCRIPTION: Record<string, string> = {
  'company-brain': 'یک نمونه حافظه شخصی در استفاده عملیاتی روزانه است؛ هر ادعا همراه شواهد، سطح حساسیت و سابقه اصلاح نگهداری می‌شود.',
  'agent-runtime': 'استقرار DeepSeek Harness، مأموریت‌های چندمرحله‌ای را با نقاط کنترل، بودجه مشخص و ثبت و طبقه‌بندی خطاها اجرا می‌کند.',
  'model-router': 'روتر متن‌باز با مجوز MIT، مجموعه آزمون تکرارپذیر و بررسی خودکار کد در مسیر انتشار.',
  phoenix: 'سیستم چندزبانه روی آربیتروم، با انتشار کنترل‌شده و تطبیق نتیجه هر تراکنش. در ۱۷ سپتامبر ۲۰۲۶، پس از ارزیابی متوقف شد؛ نتیجه منفی آن برای بررسی عمومی حفظ شده است.',
  uea: 'پیاده‌سازی مرجع با مجوز MIT؛ شامل راستی‌آزمایی مرحله‌ای، طبقه‌بندی خطاها و نقاط کنترل اجرای مأموریت.',
};

export function proofStatusLabel(status: string, locale: Locale): string {
  return locale === 'fa' ? FA_STATUS[status] ?? status : status;
}

export function proofLevelLabel(level: string, locale: Locale): string {
  return locale === 'fa' ? FA_LEVEL[level] ?? level : level;
}

export function proofDescription(key: string, fallback: string, locale: Locale): string {
  return locale === 'fa' ? FA_DESCRIPTION[key] ?? fallback : fallback;
}

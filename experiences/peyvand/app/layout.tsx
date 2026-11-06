import type { Metadata, Viewport } from 'next';
import './peyvand.css';
export const metadata: Metadata = { title: 'پیوند — نقشه زنده فرصت‌های اقتصادی ایران', description: 'طرح مفهومی و پیشنهاد راهبردی برای یک شبکه فرصت اقتصادی؛ همه نمونه‌ها و نتایج، شبیه‌سازی‌اند.', robots: {index:false,follow:false,nocache:true,googleBot:{index:false,follow:false,noarchive:true}},icons:{icon:'/peyvand/icon.svg'}, referrer:'no-referrer' };
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#09110f',colorScheme:'dark'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><head><link rel="preload" href="/peyvand/fonts/Estedad-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body><a className="pv-skip" href="#simulator">رفتن به شبیه‌سازی</a>{children}</body></html>}

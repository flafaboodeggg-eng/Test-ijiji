import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'قمر الروايات',
  description: 'قمر الروايات - منصة قراءة الروايات العربية والعالمية',
  openGraph: {
    title: 'قمر الروايات',
    description: 'قمر الروايات - منصة قراءة الروايات العربية والعالمية',
    url: 'https://moonnovel.vercel.app/',
    images: ['https://moonnovel.vercel.app/icon.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'قمر الروايات',
    description: 'قمر الروايات - منصة قراءة الروايات العربية والعالمية',
    images: ['https://moonnovel.vercel.app/icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

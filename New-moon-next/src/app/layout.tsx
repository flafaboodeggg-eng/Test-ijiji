import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'قمر الروايات',
  description: 'قمر الروايات - منصة قراءة الروايات العربية والعالمية',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'قمر الروايات',
  },
  formatDetection: {
    telephone: false,
  },
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
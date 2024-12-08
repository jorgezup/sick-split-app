import { Metadata } from 'next';

const appName = 'Sick Split';
const appDescription = 'Split expenses effortlessly with friends and family. Track shared costs, settle debts, and maintain friendships with our easy-to-use expense sharing app.';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sick-split.vercel.app/';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s | ${appName}`
  },
  description: appDescription,
  
  // Application Information
  applicationName: appName,
  generator: 'Next.js',
  keywords: [
    'expense splitting',
    'bill sharing',
    'split bills',
    'expense tracker',
    'group expenses',
    'travel expenses',
    'roommate expenses',
    'money management'
  ],
  authors: [
    {
      name: 'Jorge Augusto Bertolo Zupirolli',
      url: 'https://github.com/jorgezup'
    }
  ],
  
  // Manifest and Icons
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png' }
    ],
    shortcut: ['/shortcut-icon.png']
  },
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    title: appName,
    description: appDescription,
    siteName: appName,
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Sick Split - Split expenses, keep friendships'
      }
    ]
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
    images: [`${appUrl}/twitter-image.png`],
    creator: '@yourtwitterhandle'
  },
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  
  // Theme Color
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  
  // Verification
  // verification: {
  //   google: 'your-google-site-verification',
  //   yandex: 'your-yandex-verification',
  //   yahoo: 'your-yahoo-verification',
  // },
  
  // App Links (for mobile)
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: 'default'
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
};
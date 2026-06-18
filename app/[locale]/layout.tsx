import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '../globals.css';
import IdleTimer from './_components/IdleTimer';
import PanicButton from './_components/PanicButton';
import AIAgentWidget from '@/components/ai/AIAgentWidget';
import { ThemeProvider } from './_components/ThemeProvider';
import PageTransition from './_components/PageTransition';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta-sans' });

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  
  return {
    title: {
      template: '%s | SafePlace',
      default: `SafePlace — ${t('welcome')}`,
    },
    description: 'Platform pelaporan dan pendampingan kekerasan seksual berbasis web yang aman dan rahasia.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://safeplace.com'),
    openGraph: {
      title: 'SafePlace',
      description: 'Platform pelaporan dan pendampingan kekerasan seksual berbasis web yang aman dan rahasia.',
      url: 'https://safeplace.com',
      siteName: 'SafePlace',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SafePlace',
      description: 'Ruang Aman untuk Bersuara.',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: '/',
      languages: {
        'id': '/id',
        'en': '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <IdleTimer>
              <PageTransition>
                {children}
              </PageTransition>
              <AIAgentWidget />
            <PanicButton />
          </IdleTimer>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

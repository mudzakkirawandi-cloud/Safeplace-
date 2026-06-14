import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '../globals.css';
import IdleTimer from './_components/IdleTimer';
import PanicButton from './_components/PanicButton';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta-sans' });

export const metadata = {
  title: 'SafePlace',
  description: 'Platform Pelaporan dan Pendampingan Kekerasan Seksual',
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <IdleTimer>
            {children}
            <PanicButton />
          </IdleTimer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

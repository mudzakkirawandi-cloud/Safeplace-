import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#FAFBFF]">
      <h1 className="text-4xl font-display font-bold text-[#1B4F72] mb-4">
        {tCommon('welcome')}
      </h1>
      <nav className="flex gap-4">
        <a href="/report" className="text-[#4A90B8] hover:underline">{t('report')}</a>
        <a href="/consultant" className="text-[#5B8A6F] hover:underline">{t('consultant')}</a>
        <a href="/admin" className="text-[#2C3E6B] hover:underline">{t('admin')}</a>
      </nav>
    </main>
  );
}

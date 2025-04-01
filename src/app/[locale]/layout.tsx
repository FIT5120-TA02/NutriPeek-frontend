import type { Metadata } from 'next';
import { routing } from '@/libs/i18nNavigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '@/styles/global.css';
import { BaseTemplate } from '@/templates/BaseTemplate';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nurturing Healthy Kids',
  description: 'Supporting the health and wellbeing of children through sustainable development goals',
  icons: [
    {
      rel: 'nurturing-healthy-kids',
      url: '/nurturing_healthy_kids.png',
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // Setting the request locale is important for proper internationalization
  setRequestLocale(locale);

  // Get translations for navigation
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  // Using internationalization in Client Components
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="h-full">
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          <BaseTemplate
            leftNav={
              <>
                <li>
                  <Link 
                    href={`/${locale}`} 
                    className="px-3 py-2 rounded-md text-white hover:bg-white hover:bg-opacity-80 hover:text-[#89BE63] transition-colors"
                  >
                    {t('home_link')}
                  </Link>
                </li>
                <li>
                  <Link 
                    href={`/${locale}/about`} 
                    className="px-3 py-2 rounded-md text-white hover:bg-white hover:bg-opacity-80 hover:text-[#89BE63] transition-colors"
                  >
                    {t('about_link')}
                  </Link>
                </li>
              </>
            }
            rightNav={
              <li>
                <Link 
                  href={`/${locale === 'en' ? 'zh' : 'en'}`} 
                  className="px-3 py-2 rounded-md border-2 border-white text-white hover:bg-white hover:bg-opacity-80 hover:text-[#89BE63] transition-colors"
                  prefetch={false}
                >
                  {locale === 'en' ? '中文' : 'English'}
                </Link>
              </li>
            }
          >
            {props.children}
          </BaseTemplate>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

export default async function Home(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'HomePage',
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="mb-16 relative overflow-hidden rounded-2xl bg-gradient-to-br from-palette-primary-light to-palette-secondary p-8 md:p-12">
        <div className="absolute top-0 right-0 w-72 h-72 bg-palette-primary rounded-full opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-palette-secondary-light rounded-full opacity-30 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('title')}
            </h1>
            <p className="text-lg mb-6 text-white text-opacity-90">
              {t('description')}
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:bg-opacity-80 hover:text-primary">
                {t('learn_more')}
              </Button>
              <Button variant="secondary" size="lg" className="hover:text-white">
                {t('get_started')}
              </Button>
            </div>
          </div>
          
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white border-opacity-40 shadow-xl">
            <Image
              src="/nurturing_healthy_kids.png"
              alt="Nurturing Healthy Kids"
              width={300}
              height={300}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-palette-primary text-center">
          {t('focus_areas')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default" hoverable className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-palette-primary bg-opacity-10 flex items-center justify-center">
                <svg className="w-8 h-8 text-palette-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <CardTitle>{t('health.title')}</CardTitle>
              <CardDescription>{t('health.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t('health.description')}</p>
            </CardContent>
          </Card>
          
          <Card variant="default" hoverable className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-palette-secondary bg-opacity-30 flex items-center justify-center">
                <svg className="w-8 h-8 text-palette-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <CardTitle>{t('education.title')}</CardTitle>
              <CardDescription>{t('education.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t('education.description')}</p>
            </CardContent>
          </Card>
          
          <Card variant="default" hoverable className="text-center">
            <CardHeader>
              <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-palette-primary-light bg-opacity-30 flex items-center justify-center">
                <svg className="w-8 h-8 text-palette-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <CardTitle>{t('community.title')}</CardTitle>
              <CardDescription>{t('community.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{t('community.description')}</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="mb-12 bg-palette-secondary-light rounded-xl p-8 border border-palette-secondary border-opacity-30 text-center">
        <h2 className="text-2xl font-bold mb-4 text-palette-primary">{t('join_mission.title')}</h2>
        <p className="max-w-2xl mx-auto mb-6">
          {t('join_mission.description')}
        </p>
        <Button variant="primary" size="lg">
          {t('join_mission.cta')}
        </Button>
      </section>
    </div>
  );
}
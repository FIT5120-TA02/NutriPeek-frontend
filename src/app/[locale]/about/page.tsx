import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({
  params
}: Props) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  // Get the values list from translations
  const valuesList = [
    t('values.list.0'),
    t('values.list.1'),
    t('values.list.2'),
    t('values.list.3'),
    t('values.list.4')
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-4 text-palette-primary">
          {t('meta_title')}
        </h1>
        
        <div className="h-1.5 w-20 bg-palette-primary rounded mb-8"></div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-palette-neutral-200">
          <p className="text-lg leading-relaxed">
            {t('about_paragraph')}
          </p>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-palette-primary">{t('mission.title')}</h2>
        
        <Card variant="highlight" className="mb-8">
          <CardContent>
            <p className="text-lg italic">
              "{t('mission.statement')}"
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-palette-neutral-200">
            <h3 className="text-xl font-semibold mb-4 text-palette-primary">{t('vision.title')}</h3>
            <p>{t('vision.description')}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-palette-neutral-200">
            <h3 className="text-xl font-semibold mb-4 text-palette-primary">{t('values.title')}</h3>
            <ul className="list-disc list-inside space-y-2">
              {valuesList.map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mb-12 bg-gradient-to-r from-palette-primary-light to-palette-secondary p-8 rounded-xl text-white">
        <h2 className="text-2xl font-bold mb-6">{t('contact.title')}</h2>
        <p className="mb-6">{t('contact.description')}</p>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" size="lg">
            {t('contact.contact_btn')}
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:bg-opacity-80 hover:text-[#89BE63]">
            {t('contact.newsletter_btn')}
          </Button>
        </div>
      </div>
    </div>
  );
} 
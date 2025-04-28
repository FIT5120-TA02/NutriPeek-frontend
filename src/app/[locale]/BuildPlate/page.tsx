/**
 * Build a Balanced Plate Page
 * A drag-and-drop activity where children can build a healthy lunchbox from food options
 */
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { useLocale } from 'next-intl';
import BuildPlateWrapper from '@/components/BuildPlate/PageWrapper';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'BuildPlate' });
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function BuildPlatePage() {
  const t = useTranslations('BuildPlate');
  const locale = useLocale();

  return (
    <BuildPlateWrapper 
      title={t('title')} 
      description={t('description')} 
    />
  );
} 
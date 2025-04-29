/**
 * Match & Learn Nutrient Game Page
 * A memory-based matching game that teaches kids about nutritious foods
 */
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import MatchAndLearnWrapper from '@/components/MatchAndLearn/PageWrapper';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'MatchAndLearn' });
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function MatchAndLearnPage() {
  const t = useTranslations('MatchAndLearn');

  return (
    <MatchAndLearnWrapper 
      title={t('title')} 
      description={t('description')} 
    />
  );
} 
import { AppConfig } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="min-h-screen flex flex-col w-full bg-[rgb(var(--color-primary))] text-foreground antialiased">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-white border-opacity-20 bg-transparent backdrop-blur-sm sticky top-0 z-10">
          <div className="py-4 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-palette-primary font-bold text-xl">
                  NH
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">
                    {AppConfig.name}
                  </h1>
                  <h2 className="text-sm md:text-base text-white text-opacity-80">
                    {t('description')}
                  </h2>
                </div>
              </div>
              
              <div className="flex mt-4 md:mt-0 justify-between">
                <nav className="flex-1">
                  <ul className="flex items-center gap-x-2 md:gap-x-6 text-base md:text-lg">
                    {props.leftNav}
                  </ul>
                </nav>
                
                {props.rightNav && (
                  <nav className="ml-6">
                    <ul className="flex items-center gap-x-4 text-base md:text-lg">
                      {props.rightNav}
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 md:py-12">{props.children}</main>

        <footer className="border-t border-white border-opacity-20 py-8 text-center text-sm text-white text-opacity-80 bg-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4">
              <span className="inline-block w-8 h-8 rounded-full bg-white opacity-80 mr-2"></span>
              <span className="inline-block w-8 h-8 rounded-full bg-palette-secondary opacity-80 mr-2"></span>
              <span className="inline-block w-8 h-8 rounded-full bg-palette-secondary-light opacity-80"></span>
            </div>
            {`${t('copyright')} ${new Date().getFullYear()} ${AppConfig.name}. `}
            <div className="mt-2 text-xs">{t('footer_slogan')}</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

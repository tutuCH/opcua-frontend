import { Cog, Sheet, Factory, CloudAlert, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import SvgColor from 'src/components/svg-color';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

export const useNavConfig = () => {
  const { t, i18n } = useTranslation();
  
  return useMemo(() => [
    {
      title: t('navigation.factory'),
      path: '/factory',
      icon: <Factory size={24} />,
    },
    {
      title: t('navigation.machine'),
      path: '/machine',
      icon: <Cog size={24} />,
    },
    {
      title: t('navigation.records'),
      path: '/records',
      icon: <Sheet size={24} />,
    },
    {
      title: t('navigation.warnings'),
      path: '/warnings',
      icon: <CloudAlert size={24} />,
    },
    {
      title: t('navigation.settings'),
      path: '/settings',
      icon: <Settings size={24} />,
    }
  ], [t, i18n.language]);
};

// All components should use useNavConfig() hook for reactive translations

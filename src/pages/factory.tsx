import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { FactoryView } from 'src/sections/factory/view';

// ----------------------------------------------------------------------

export default function FactoryPage() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title> {t('pages.factory')} </title>
      </Helmet>

      <FactoryView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { FactoryView } from 'src/sections/factory/view';

// ----------------------------------------------------------------------

export default function FactoryPage() {
  return (
    <>
      <Helmet>
        <title> Factory </title>
      </Helmet>

      <FactoryView />
    </>
  );
}

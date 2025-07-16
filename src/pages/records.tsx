import { Helmet } from 'react-helmet-async';

import { RecordsView } from 'src/sections/records/view';

// ----------------------------------------------------------------------

export default function RecordsPage() {
  return (
    <>
      <Helmet>
        <title> Records | Minimal UI </title>
      </Helmet>

      <RecordsView />
    </>
  );
}

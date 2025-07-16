import { Helmet } from 'react-helmet-async';

import WarningsView from 'src/sections/warnings/view/warnings-view';

// ----------------------------------------------------------------------

export default function WarningsPage() {
  return (
    <>
      <Helmet>
        <title> Warnings | Minimal UI </title>
      </Helmet>

      <WarningsView />
    </>
  );
}

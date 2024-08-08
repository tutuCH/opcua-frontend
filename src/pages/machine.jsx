import { Helmet } from 'react-helmet-async';

import { MachineView } from 'src/sections/machine/view';

// ----------------------------------------------------------------------

export default function MachinePage() {
  return (
    <>
      <Helmet>
        <title> Machine </title>
      </Helmet>

      <MachineView />
    </>
  );
}

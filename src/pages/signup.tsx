import { Helmet } from 'react-helmet-async';

import { SignupView } from 'src/sections/signup';

// ----------------------------------------------------------------------

export default function SignupPage() {
  return (
    <>
      <Helmet>
        <title> Sign up | Minimal UI </title>
      </Helmet>

      <SignupView />
    </>
  );
}

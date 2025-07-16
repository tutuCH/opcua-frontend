import { Helmet } from 'react-helmet-async';

import { ForgotPassword } from 'src/sections/forgotPassword';

// ----------------------------------------------------------------------

export default function ForgetPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Sign up | Minimal UI </title>
      </Helmet>

      <ForgotPassword />
    </>
  );
}

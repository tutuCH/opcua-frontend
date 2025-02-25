import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_COGNITO_REGION,               // e.g., us-east-1
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,          // e.g., us-east-1_AbCdEfG
    userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_WEB_CLIENT_ID, // e.g., 12345abcde67890fghij
    oauth: {
      domain: import.meta.env.VITE_COGNITO_DOMAIN,           // e.g., 'yourapp.auth.us-east-1.amazoncognito.com'
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: import.meta.env.VITE_SIGN_IN_URL,       // different per environment
      redirectSignOut: import.meta.env.VITE_SIGN_OUT_URL,     // different per environment
      responseType: 'code', // or 'token' depending on your flow
    },    
    mandatorySignIn: import.meta.env.VITE_COGNITO_MANDATORY_SIGN_IN, // set to true if you want to enforce sign in
  }
});

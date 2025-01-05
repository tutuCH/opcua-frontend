import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Iconify from 'src/components/iconify';
import { userForgetPassword } from 'src/api/authServices';
import { style } from './style';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ----------------------------------------------------------------------

export default function SettingsView() {
  const [resetSuccess, setResetSuccess] = useState(true);

  const handleResetPassword = async () => {
    const email = localStorage.getItem('email');
    try {
      const res = await userForgetPassword(email);
      setResetSuccess(true);
      localStorage.removeItem('access_token');
    } catch (error) {
      alert('An error occurred during password reset. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card className="border border-dashed rounded-lg p-6 shadow-none">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Account</h2>
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="flex items-center gap-2"
            >
              <Iconify icon="carbon:reset" />
              Reset Password
            </Button>
          </div>

          {resetSuccess && (
            <p className="text-green-600">
              Email sent. Please check your inbox for password reset instructions.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

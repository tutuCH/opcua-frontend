import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { subscriptionApi } from '../../api/subscriptionServices';

interface UserProfileForm {
  username: string;
  email: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PersonalInfoSection() {
  const { user, refreshUserData } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty: profileIsDirty },
    reset: resetProfile,
  } = useForm<UserProfileForm>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordChangeForm>();

  const watchNewPassword = watch('newPassword');

  React.useEffect(() => {
    if (user) {
      resetProfile({
        username: user.username,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data: UserProfileForm) => {
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      await subscriptionApi.updateUserProfile(data);
      await refreshUserData();
      setUpdateMessage({ type: 'success', text: '個人資訊已成功更新' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateMessage({ type: 'error', text: '更新失敗，請稍後再試' });
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmitPassword = async (data: PasswordChangeForm) => {
    setIsChangingPassword(true);
    setUpdateMessage(null);

    try {
      await subscriptionApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setUpdateMessage({ type: 'success', text: '密碼已成功更改' });
      setPasswordDialogOpen(false);
      resetPassword();
    } catch (error) {
      console.error('Failed to change password:', error);
      setUpdateMessage({ type: 'error', text: '密碼更改失敗，請檢查當前密碼是否正確' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    resetPassword();
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        個人資訊
      </Typography>

      {updateMessage && (
        <Alert severity={updateMessage.type} sx={{ mb: 3 }}>
          {updateMessage.text}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="用戶名"
                  {...registerProfile('username', {
                    required: '用戶名為必填項',
                    minLength: { value: 2, message: '用戶名至少需要2個字符' },
                  })}
                  error={!!profileErrors.username}
                  helperText={profileErrors.username?.message}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="電子郵件"
                  type="email"
                  {...registerProfile('email', {
                    required: '電子郵件為必填項',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '請輸入有效的電子郵件地址',
                    },
                  })}
                  error={!!profileErrors.email}
                  helperText={profileErrors.email?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!profileIsDirty || isUpdating}
                    startIcon={isUpdating ? <CircularProgress size={20} /> : null}
                  >
                    {isUpdating ? '更新中...' : '保存更改'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    更改密碼
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>更改密碼</DialogTitle>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                fullWidth
                label="當前密碼"
                type="password"
                {...registerPassword('currentPassword', {
                  required: '請輸入當前密碼',
                })}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message}
              />

              <TextField
                fullWidth
                label="新密碼"
                type="password"
                {...registerPassword('newPassword', {
                  required: '請輸入新密碼',
                  minLength: { value: 8, message: '密碼至少需要8個字符' },
                })}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message}
              />

              <TextField
                fullWidth
                label="確認新密碼"
                type="password"
                {...registerPassword('confirmPassword', {
                  required: '請確認新密碼',
                  validate: (value) => value === watchNewPassword || '密碼不匹配',
                })}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePasswordDialogClose}>取消</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isChangingPassword}
              startIcon={isChangingPassword ? <CircularProgress size={20} /> : null}
            >
              {isChangingPassword ? '更改中...' : '更改密碼'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
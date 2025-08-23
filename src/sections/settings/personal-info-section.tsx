import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from 'src/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import {
  Save,
  Key,
  Loader2,
  LogOut,
  Languages,
  Sun,
  Moon,
} from 'lucide-react';

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

interface ActionMessage {
  type: 'success' | 'error';
  text: string;
}

const PersonalInfoSection: React.FC = () => {
  const { user, refreshUserData, logout } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<ActionMessage | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh-TW');

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

  const onSubmitProfile = async (data: UserProfileForm): Promise<void> => {
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

  const onSubmitPassword = async (data: PasswordChangeForm): Promise<void> => {
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

  const handlePasswordDialogClose = (): void => {
    setPasswordDialogOpen(false);
    resetPassword();
  };

  const handleLogout = (): void => {
    logout();
  };

  const handleLanguageToggle = (): void => {
    // Dummy implementation - toggle between languages
    setCurrentLanguage(prev => prev === 'zh-TW' ? 'en-US' : 'zh-TW');
    setUpdateMessage({ 
      type: 'success', 
      text: `語言已切換至 ${currentLanguage === 'zh-TW' ? 'English' : '繁體中文'}` 
    });
  };

  const handleThemeToggle = (): void => {
    // Dummy implementation - toggle theme
    setIsDarkMode(prev => !prev);
    setUpdateMessage({ 
      type: 'success', 
      text: `已切換至${isDarkMode ? '淺色' : '深色'}模式` 
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">個人設定</h2>
        <p className="text-muted-foreground">
          管理您的帳戶資訊和偏好設定
        </p>
      </div>

      {updateMessage && (
        <Alert className={cn(
          updateMessage.type === 'error' && "border-destructive/50 text-destructive dark:border-destructive"
        )}>
          <AlertDescription>
            {updateMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>個人資訊</CardTitle>
          <CardDescription>
            更新您的帳戶基本資訊
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">用戶名</Label>
                <Input
                  id="username"
                  {...registerProfile('username', {
                    required: '用戶名為必填項',
                    minLength: { value: 2, message: '用戶名至少需要2個字符' },
                  })}
                  className={cn(
                    profileErrors.username && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {profileErrors.username && (
                  <p className="text-sm text-destructive">
                    {profileErrors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email', {
                    required: '電子郵件為必填項',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '請輸入有效的電子郵件地址',
                    },
                  })}
                  className={cn(
                    profileErrors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {profileErrors.email && (
                  <p className="text-sm text-destructive">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!profileIsDirty || isUpdating}
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isUpdating ? '更新中...' : '保存更改'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                更改密碼
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>應用程式設定</CardTitle>
          <CardDescription>
            自訂您的應用程式體驗
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">語言設定</h4>
              <p className="text-sm text-muted-foreground">
                當前語言: {currentLanguage === 'zh-TW' ? '繁體中文' : 'English'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLanguageToggle}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              切換語言
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">主題設定</h4>
              <p className="text-sm text-muted-foreground">
                當前主題: {isDarkMode ? '深色模式' : '淺色模式'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleThemeToggle}
              className="flex items-center gap-2"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDarkMode ? '淺色模式' : '深色模式'}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <h4 className="text-sm font-medium">登出帳戶</h4>
              <p className="text-sm text-muted-foreground">
                結束當前會話並返回登錄頁面
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
              登出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更改密碼</DialogTitle>
            <DialogDescription>
              請輸入您的當前密碼和新密碼
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">當前密碼</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword', {
                    required: '請輸入當前密碼',
                  })}
                  className={cn(
                    passwordErrors.currentPassword && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">新密碼</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword', {
                    required: '請輸入新密碼',
                    minLength: { value: 8, message: '密碼至少需要8個字符' },
                  })}
                  className={cn(
                    passwordErrors.newPassword && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認新密碼</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: '請確認新密碼',
                    validate: (value) => value === watchNewPassword || '密碼不匹配',
                  })}
                  className={cn(
                    passwordErrors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={handlePasswordDialogClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    更改中...
                  </>
                ) : (
                  '更改密碼'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalInfoSection;
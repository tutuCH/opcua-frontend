import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n, ready } = useTranslation();
  const { user, refreshUserData, logout } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<ActionMessage | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Don't render until i18n is ready
  if (!ready) {
    return <div>Loading translations...</div>;
  }

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
      setUpdateMessage({ type: 'success', text: t('personalSettings.personalInfo.updateSuccess') });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setUpdateMessage({ type: 'error', text: t('personalSettings.personalInfo.updateError') });
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
      setUpdateMessage({ type: 'success', text: t('personalSettings.passwordDialog.changeSuccess') });
      setPasswordDialogOpen(false);
      resetPassword();
    } catch (error) {
      console.error('Failed to change password:', error);
      setUpdateMessage({ type: 'error', text: t('personalSettings.passwordDialog.changeError') });
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
    const supportedLanguages = ['zh-TW', 'zh-CN', 'en'];
    const currentIndex = supportedLanguages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    const nextLanguage = supportedLanguages[nextIndex];
    
    i18n.changeLanguage(nextLanguage);
    
    const languageNames = {
      'zh-TW': t('personalSettings.appSettings.language.traditionalChinese'),
      'zh-CN': t('personalSettings.appSettings.language.simplifiedChinese'),
      'en': t('personalSettings.appSettings.language.english')
    };
    
    setUpdateMessage({ 
      type: 'success', 
      text: `${t('personalSettings.appSettings.language.current')}: ${languageNames[nextLanguage as keyof typeof languageNames]}` 
    });
  };

  const handleThemeToggle = (): void => {
    // Dummy implementation - toggle theme
    setIsDarkMode(prev => !prev);
    const newTheme = isDarkMode ? t('personalSettings.appSettings.theme.lightMode') : t('personalSettings.appSettings.theme.darkMode');
    setUpdateMessage({ 
      type: 'success', 
      text: `${t('personalSettings.appSettings.theme.current')}: ${newTheme}` 
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('personalSettings.title')}</h2>
        <p className="text-muted-foreground">
          {t('personalSettings.description')}
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
          <CardTitle>{t('personalSettings.personalInfo.title')}</CardTitle>
          <CardDescription>
            {t('personalSettings.personalInfo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">{t('personalSettings.personalInfo.username')}</Label>
                <Input
                  id="username"
                  {...registerProfile('username', {
                    required: t('personalSettings.personalInfo.usernameRequired'),
                    minLength: { value: 2, message: t('personalSettings.personalInfo.usernameMinLength') },
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
                <Label htmlFor="email">{t('personalSettings.personalInfo.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email', {
                    required: t('personalSettings.personalInfo.emailRequired'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('personalSettings.personalInfo.emailInvalid'),
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
                {isUpdating ? t('personalSettings.personalInfo.updating') : t('personalSettings.personalInfo.saveChanges')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                {t('personalSettings.personalInfo.changePassword')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('personalSettings.appSettings.title')}</CardTitle>
          <CardDescription>
            {t('personalSettings.appSettings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">{t('personalSettings.appSettings.language.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('personalSettings.appSettings.language.current')}: {
                  i18n.language === 'zh-TW' ? t('personalSettings.appSettings.language.traditionalChinese') :
                  i18n.language === 'zh-CN' ? t('personalSettings.appSettings.language.simplifiedChinese') :
                  t('personalSettings.appSettings.language.english')
                }
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLanguageToggle}
              className="flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              {t('personalSettings.appSettings.language.switch')}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">{t('personalSettings.appSettings.theme.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('personalSettings.appSettings.theme.current')}: {isDarkMode ? t('personalSettings.appSettings.theme.darkMode') : t('personalSettings.appSettings.theme.lightMode')}
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
              {isDarkMode ? t('personalSettings.appSettings.theme.switchToLight') : t('personalSettings.appSettings.theme.switchToDark')}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <h4 className="text-sm font-medium">{t('personalSettings.appSettings.logout.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('personalSettings.appSettings.logout.description')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t('personalSettings.appSettings.logout.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('personalSettings.passwordDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('personalSettings.passwordDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('personalSettings.passwordDialog.currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...registerPassword('currentPassword', {
                    required: t('personalSettings.passwordDialog.currentPasswordRequired'),
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
                <Label htmlFor="newPassword">{t('personalSettings.passwordDialog.newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword('newPassword', {
                    required: t('personalSettings.passwordDialog.newPasswordRequired'),
                    minLength: { value: 8, message: t('personalSettings.passwordDialog.passwordMinLength') },
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
                <Label htmlFor="confirmPassword">{t('personalSettings.passwordDialog.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: t('personalSettings.passwordDialog.confirmPasswordRequired'),
                    validate: (value) => value === watchNewPassword || t('personalSettings.passwordDialog.passwordMismatch'),
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
                {t('personalSettings.passwordDialog.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('personalSettings.passwordDialog.changing')}
                  </>
                ) : (
                  t('personalSettings.passwordDialog.change')
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
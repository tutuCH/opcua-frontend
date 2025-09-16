import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { Card } from 'src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';

import PersonalInfoSection from '../sections/settings/personal-info-section';
import SubscriptionSection from '../sections/settings/subscription-section';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('pages.settings')} | OPC UA Dashboard</title>
      </Helmet>

      <div className="container max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('settings.description')}
          </p>
        </div>

        <Card className="w-full">
          <Tabs defaultValue="personal" className="w-full">
            <div className="border-b px-6 py-3">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  {t('settings.tabs.personal')}
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  {t('settings.tabs.subscription')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="personal" className="mt-0">
              <PersonalInfoSection />
            </TabsContent>

            <TabsContent value="subscription" className="mt-0">
              <SubscriptionSection />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
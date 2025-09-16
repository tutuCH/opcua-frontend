import { Card, CardContent } from '@/components/ui/card';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SummaryStats {
  totalMachines: number;
  running: number;
  alarms: number;
  avgUtilization: number;
}

interface SummaryKPIsProps {
  summaryStats: SummaryStats;
}

export function SummaryKPIs({ summaryStats }: SummaryKPIsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('summaryKPIs.totalMachines')}</p>
              <p className="text-2xl font-bold">{summaryStats.totalMachines}</p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('summaryKPIs.running')}</p>
              <p className="text-2xl font-bold text-teal-600">{summaryStats.running}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-white"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('summaryKPIs.alarms')}</p>
              <p className="text-2xl font-bold text-red-600">{summaryStats.alarms}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('summaryKPIs.avgUtilization')}</p>
              <p className="text-2xl font-bold">{summaryStats.avgUtilization}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
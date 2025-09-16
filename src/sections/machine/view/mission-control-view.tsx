import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  ScatterChart, 
  Clock, 
  PieChart, 
  Settings, 
  MoreHorizontal, 
  Calendar, 
  CalendarDays, 
  Database, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WebSocketIndicator } from '@/components/WebSocketStatus';

// Import proper components from sample Manufacturing Dashboard
import { ProductionStatusTiles } from '../components/ProductionStatusTiles';
import { QualityView } from '../components/QualityView';
import { ReportsView } from '../components/ReportsView';
import { TrendChart } from '../components/TrendChart';
import { CorrelationChart } from '../components/CorrelationChart';
import { TimelineView } from '../components/TimelineView';
import { UtilizationView } from '../components/UtilizationView';
import { GanttView } from '../components/GanttView';
import { TraceabilityView } from '../components/TraceabilityView';


export default function MissionControlView() {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState('production');
  const [selectedMachine, setSelectedMachine] = useState(null);

  const views = [
    { id: 'production', label: t('dashboard.views.production'), icon: Activity },
    { id: 'quality', label: t('dashboard.views.quality'), icon: BarChart3 },
    { id: 'reports', label: t('dashboard.views.reports'), icon: FileText },
    { id: 'trends', label: t('dashboard.views.trends'), icon: TrendingUp },
    { id: 'correlation', label: t('dashboard.views.correlation'), icon: ScatterChart },
    { id: 'timeline', label: t('dashboard.views.timeline'), icon: Clock },
    { id: 'utilization', label: t('dashboard.views.utilization'), icon: PieChart },
    { id: 'gantt', label: t('dashboard.views.gantt'), icon: CalendarDays },
    { id: 'traceability', label: t('dashboard.views.traceability'), icon: Database }
  ];

  // Production Status View - uses proper component
  const renderProductionStatus = () => <ProductionStatusTiles />;

  // Quality View - uses proper component from sample
  const renderQualityView = () => <QualityView />;

  // Reports View - uses proper component from sample
  const renderReports = () => <ReportsView />;

  // Trend Analysis - uses proper component from sample
  const renderTrendAnalysis = () => <TrendChart />;

  // Correlation Analysis - uses proper component from sample
  const renderCorrelation = () => <CorrelationChart />;

  // Timeline View - uses proper component from sample
  const renderTimeline = () => <TimelineView />;

  // Utilization View - uses proper component from sample
  const renderUtilization = () => <UtilizationView />;

  // Equipment Gantt - uses proper component from sample
  const renderGantt = () => <GanttView />;

  // Traceability View - uses proper component from sample
  const renderTraceability = () => <TraceabilityView />;

  return (
    <>
      <Helmet>
        <title>{t('dashboard.title')} | OPC-UA Industrial Monitoring</title>
        <meta 
          name="description" 
          content={t('dashboard.description')} 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground">{t('dashboard.description')}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <WebSocketIndicator />
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {views.map((view) => (
              <Button
                key={view.id}
                variant={selectedView === view.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedView(view.id)}
                className="text-xs"
              >
                <view.icon className="h-4 w-4 mr-2" />
                {view.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {selectedView === 'production' && renderProductionStatus()}
          {selectedView === 'quality' && renderQualityView()}
          {selectedView === 'reports' && renderReports()}
          {selectedView === 'trends' && renderTrendAnalysis()}
          {selectedView === 'correlation' && renderCorrelation()}
          {selectedView === 'timeline' && renderTimeline()}
          {selectedView === 'utilization' && renderUtilization()}
          {selectedView === 'gantt' && renderGantt()}
          {selectedView === 'traceability' && renderTraceability()}
        </div>
      </div>
    </>
  );
}
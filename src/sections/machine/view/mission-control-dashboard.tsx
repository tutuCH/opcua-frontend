import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Activity, 
  BarChart3, 
  Calendar, 
  FileText, 
  TrendingUp, 
  ScatterChart, 
  Clock, 
  PieChart, 
  CalendarDays, 
  Database,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductionStatusTiles } from '../components/ProductionStatusTiles';
import { QualityView } from '../components/QualityView';
import { ReportsView } from '../components/ReportsView';
import { TrendChart } from '../components/TrendChart';
import { CorrelationChart } from '../components/CorrelationChart';
import { TimelineView } from '../components/TimelineView';
import { UtilizationView } from '../components/UtilizationView';
import { GanttView } from '../components/GanttView';
import { TraceabilityView } from '../components/TraceabilityView';

// Import placeholder components for other views
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

// Simple placeholder components for views that aren't the focus
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Badge variant="secondary">Placeholder</Badge>
    </div>
    
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This view is a placeholder. The focus was on fixing Correlation and Gantt charts.
      </AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle>{title} Content</CardTitle>
        <CardDescription>This would contain the actual {title.toLowerCase()} functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Implementation would go here...</p>
      </CardContent>
    </Card>
  </div>
);

const menuItems = [
  { 
    id: 'production', 
    label: 'Production Status', 
    icon: Activity, 
    description: 'Real-time machine status'
  },
  { 
    id: 'quality', 
    label: '24h Quality View', 
    icon: BarChart3, 
    description: '24-hour quality metrics'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: Calendar, 
    description: 'Daily/weekly/monthly reports'
  },
  { 
    id: 'trend', 
    label: 'Trend Analysis', 
    icon: TrendingUp, 
    description: 'Process trend charts'
  },
  { 
    id: 'correlation', 
    label: 'Correlation', 
    icon: ScatterChart, 
    description: 'Parameter correlations'
  },
  { 
    id: 'timeline', 
    label: 'Summary Timeline', 
    icon: Clock, 
    description: 'Operation timeline view'
  },
  { 
    id: 'utilization', 
    label: 'Utilization', 
    icon: PieChart, 
    description: 'Equipment utilization'
  },
  { 
    id: 'gantt', 
    label: 'Equipment Gantt', 
    icon: CalendarDays, 
    description: 'Equipment scheduling'
  },
  { 
    id: 'traceability', 
    label: 'Traceability', 
    icon: Database, 
    description: 'Material traceability'
  }
];

export default function MissionControlDashboardFixed() {
  const [activeView, setActiveView] = useState('production');

  const renderContent = () => {
    switch (activeView) {
      case 'production':
        return <ProductionStatusTiles />;
      case 'quality':
        return <QualityView />;
      case 'reports':
        return <ReportsView />;
      case 'trend':
        return <TrendChart />;
      case 'correlation':
        return <CorrelationChart />;
      case 'timeline':
        return <TimelineView />;
      case 'utilization':
        return <UtilizationView />;
      case 'gantt':
        return <GanttView />;
      case 'traceability':
        return <TraceabilityView />;
      default:
        return <ProductionStatusTiles />;
    }
  };

  const currentView = menuItems.find(item => item.id === activeView);

  return (
    <>
      <Helmet>
        <title>Manufacturing Dashboard | OPC-UA Industrial Monitoring</title>
        <meta 
          name="description" 
          content="Production Monitor v2.1 - Advanced industrial machine monitoring with real-time insights" 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manufacturing Dashboard</h1>
              <p className="text-muted-foreground">Production Monitor v2.1</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">Live Data</Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current View Info */}
          <div className="mt-4 flex items-center gap-4">
            {currentView && (
              <>
                <currentView.icon className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">{currentView.label}</h2>
                  <p className="text-sm text-muted-foreground">{currentView.description}</p>
                </div>
              </>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {menuItems.map((view) => (
              <Button
                key={view.id}
                variant={activeView === view.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView(view.id)}
                className="text-xs"
              >
                <view.icon className="h-4 w-4 mr-2" />
                {view.label}
                {['production', 'quality', 'reports', 'trend', 'correlation', 'timeline', 'utilization', 'gantt', 'traceability'].includes(view.id) && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">✓</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
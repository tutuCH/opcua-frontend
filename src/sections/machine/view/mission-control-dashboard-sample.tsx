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
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductionStatusTiles } from '../components/ProductionStatusTiles';
import { QualityView } from '../../../sample/Manufacturing Dashboard/src/components/QualityView';
import { ReportsView } from '../../../sample/Manufacturing Dashboard/src/components/ReportsView';
import { TrendChart } from '../../../sample/Manufacturing Dashboard/src/components/TrendChart';
import { CorrelationChart } from '../../../sample/Manufacturing Dashboard/src/components/CorrelationChart';
import { TimelineView } from '../../../sample/Manufacturing Dashboard/src/components/TimelineView';
import { UtilizationView } from '../../../sample/Manufacturing Dashboard/src/components/UtilizationView';
import { GanttView } from '../../../sample/Manufacturing Dashboard/src/components/GanttView';
import { TraceabilityView } from '../../../sample/Manufacturing Dashboard/src/components/TraceabilityView';

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

export default function MissionControlDashboardSample() {
  const [activeView, setActiveView] = useState('production');
  const [timeRange, setTimeRange] = useState('live');
  const [site, setSite] = useState('site1');

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

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <Sidebar className="border-r">
            <SidebarContent>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Manufacturing Dashboard</h2>
                <p className="text-sm text-muted-foreground">Production Monitor v2.1</p>
              </div>
              
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          onClick={() => setActiveView(item.id)}
                          isActive={activeView === item.id}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>System Online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last update: 2s ago
                </p>
              </div>
            </SidebarContent>
          </Sidebar>

          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="border-b bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-xl font-semibold">{currentView?.label}</h1>
                    <p className="text-sm text-muted-foreground">{currentView?.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={site} onValueChange={setSite}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site1">Site 1</SelectItem>
                      <SelectItem value="site2">Site 2</SelectItem>
                      <SelectItem value="site3">Site 3</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="15m">Last 15m</SelectItem>
                      <SelectItem value="1h">Last 1h</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    JST +09:00
                  </Badge>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
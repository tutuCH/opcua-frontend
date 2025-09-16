import { useEffect, useState } from 'react';
import {
  getFactoriesMachinesByUserId,
  updateMachineIndex,
  removeFactory,
} from 'src/api/machinesServices';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Factory as FactoryIcon,
  Cog,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Info,
  Wifi,
  WifiOff,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from 'src/components/ui/button';
import { Card } from 'src/components/ui/card';
import { ScrollArea, ScrollBar } from 'src/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { useParams } from 'react-router-dom';
import { Badge } from 'src/components/ui/badge';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import LoadingSkeleton from '@/components/loadingSkeleton/loadingSkeleton';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { WebSocketEventData, isRealtimeData } from '@/services/websocketService';
import MachineStatusCard from './machine-status-card';
import MachineDialog from './machine-dialog';
import FactoryDialog from './factory-dialog';

export default function Factory() {
  const { t } = useTranslation();
  const [factories, setFactories] = useState([]);
  const [selectedAddMachineIndex, setSelectedAddMachineIndex] = useState(null);
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(-1);
  const [machineDialogState, setMachineDialogState] = useState([]);
  const [factoryDialogState, setFactoryDialogState] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('user_id');

  // WebSocket state for factory-level monitoring
  const [realtimeData, setRealtimeData] = useState(new Map());
  const [spcData, setSpcData] = useState(new Map());
  const [realtimeCount, setRealtimeCount] = useState(0);
  const [spcCount, setSpcCount] = useState(0);
  const [lastRealtime, setLastRealtime] = useState(null);
  const [lastSpc, setLastSpc] = useState(null);
  const [subscribedMachines, setSubscribedMachines] = useState(new Set());

  // Central WebSocket connection for factory page
  const {
    isConnected,
    isConnecting,
    error,
    subscribeToMachine,
    unsubscribeFromMachine,
    requestMachineStatus,
    subscribedMachines: wsSubscribedMachines,
    realtimeData: contextRealtimeData,
    spcData: contextSpcData,
    statusData: contextStatusData,
    alerts: contextAlerts,
    realtimeUpdateCount,
    spcUpdateCount,
    statusUpdateCount,
    alertUpdateCount
  } = useWebSocketContext();

  // Update local state when context data changes
  useEffect(() => {
    setRealtimeData(contextRealtimeData);
    if (contextRealtimeData.size > 0) {
      const latestRealtime = Array.from(contextRealtimeData.values()).pop();
      if (latestRealtime) {
        setLastRealtime(latestRealtime);
        console.log('🏭 FACTORY REALTIME:', {
          deviceId: latestRealtime.deviceId,
          timestamp: latestRealtime.timestamp,
          data: latestRealtime.data,
          dataStructure: latestRealtime.data ? Object.keys(latestRealtime.data) : 'no data'
        });
      }
    }
    setRealtimeCount(realtimeUpdateCount);
  }, [contextRealtimeData, realtimeUpdateCount]);

  useEffect(() => {
    setSpcData(contextSpcData);
    if (contextSpcData.size > 0) {
      const latestSpc = Array.from(contextSpcData.values()).pop();
      if (latestSpc) {
        setLastSpc(latestSpc);
        console.log('🏭 FACTORY SPC:', {
          deviceId: latestSpc.deviceId,
          timestamp: latestSpc.timestamp,
          data: latestSpc.data,
          dataStructure: latestSpc.data ? Object.keys(latestSpc.data) : 'no data'
        });
      }
    }
    setSpcCount(spcUpdateCount);
  }, [contextSpcData, spcUpdateCount]);

  useEffect(() => {
    if (contextStatusData.size > 0) {
      const latestStatus = Array.from(contextStatusData.values()).pop();
      if (latestStatus) {
        console.log('🏭 FACTORY STATUS:', {
          deviceId: latestStatus.deviceId,
          timestamp: latestStatus.timestamp,
          data: latestStatus.data,
          source: latestStatus.source
        });
      }
    }
  }, [contextStatusData, statusUpdateCount]);

  useEffect(() => {
    if (contextAlerts.length > 0) {
      const latestAlert = contextAlerts[0];
      console.warn('🏭 FACTORY ALERT:', {
        deviceId: latestAlert.deviceId,
        alert: latestAlert.alert,
        timestamp: latestAlert.timestamp
      });
    }
  }, [contextAlerts, alertUpdateCount]);

  const ItemTypes = {
    MACHINE: 'machine',
  };
  const { factoryId } = useParams();
  useEffect(() => {
    factoryId && setSelectedFactoryIndex(parseInt(factoryId, 10));
    const getFactoriesMachines = async () => {
      setIsLoading(true);
      const data = await getFactoriesMachinesByUserId(userId);
      setFactories(data);
      setMachineDialogState(new Array(data.length).fill(false));
      setFactoryDialogState(new Array(data.length).fill(false));
      
      if (factoryId) {
        const index = data.findIndex(factory => factory.factoryId === factoryId);
        if (index !== -1) {
          setSelectedFactoryIndex(index);
        }
      }
      
      setIsLoading(false);
    };

    getFactoriesMachines();
  }, [userId, factoryId]);

  // Device ID mapping function - convert machineId to backend format
  const getDeviceId = (machine) => {
    // Based on websocket-test.html working with "postgres machine 1"
    // Try the exact format that works in the test
    const deviceId = `postgres machine ${machine.machineId}`;
    console.log(`🔧 Device ID mapping: machineId ${machine.machineId} -> deviceId "${deviceId}"`);
    return deviceId;
  };

  // Subscribe to all machines when connected and list is loaded
  useEffect(() => {
    if (isConnected && factories.length) {
      console.log('🔌 WebSocket connected, subscribing to machines...');
      const newSubscriptions = new Set();

      factories.forEach(factory => {
        factory.machines?.forEach(machine => {
          const deviceId = getDeviceId(machine);
          console.log(`📡 Subscribing to machine: ${deviceId} (machineId: ${machine.machineId})`);
          subscribeToMachine(deviceId);
          requestMachineStatus(deviceId);
          newSubscriptions.add(deviceId);
        });
      });

      setSubscribedMachines(newSubscriptions);
    } else if (!isConnected) {
      setSubscribedMachines(new Set());
    }
  }, [isConnected, factories, subscribeToMachine, requestMachineStatus]);

  const handleAddMachine = (factoryIndex, index) => {
    setMachineDialogState(machineDialogState.map((open, i) => (i === factoryIndex ? true : open)));
    console.log(`index: ${index}`);
    setSelectedAddMachineIndex(index);
  };

  const handleCloseMachineDialog = (index) => {
    setMachineDialogState(machineDialogState.map((open, i) => (i === index ? false : open)));
    setSelectedAddMachineIndex(null);
  };

  const handleAddFactory = async () => {
    setIsEdit(false);
  
    if (factoryDialogState.length === 0 || factories.length === 0) {
      setFactoryDialogState([true]);
    } else {
      setFactoryDialogState(
        factoryDialogState.map((open, i) => (i === factories.length - 1 ? true : open))
      );
    }
  };

  const handleCloseFactoryDialog = (index) => {
    setFactoryDialogState((prevState) => prevState.map((open, i) => (i === index ? false : open)));
  };

  const handleDropMachine = async (item, index) => {
    const { factoryIndex, machineIndex, machineId } = item;
    if (index !== machineIndex) {
      await updateMachineIndex({ machineId, machineIndex: index, factoryId: factories[factoryIndex].factoryId });
      
      setFactories((prevFactories) => {
        const updatedFactories = [...prevFactories];
        const targetFactory = { ...updatedFactories[factoryIndex] };
        
        // Find the machine to update
        const machineToUpdate = targetFactory.machines.find(
          (machine) => machine.machineIndex === machineIndex
        );
        
        if (machineToUpdate) {
          // Create a new machines array with the updated machine index
          targetFactory.machines = targetFactory.machines.map(machine => {
            if (machine.machineId === machineId) {
              return { ...machine, machineIndex: index };
            }
            return machine;
          });
          
          // Sort machines by index if needed
          targetFactory.machines.sort((a, b) => a.machineIndex - b.machineIndex);
          
          updatedFactories[factoryIndex] = targetFactory;
        }
        
        return updatedFactories;
      });
    }
  };

  useEffect(() => {
    console.log('factories', factories);
  }, [factories]);
  const DropTarget = ({ index, onDrop, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.MACHINE,
      drop: (item) => onDrop(item, index),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    return (
      <div ref={drop} className="h-full w-full" style={{ opacity: isOver && canDrop ? 0.5 : 1 }}>
        {children}
      </div>
    );
  };

  const removeCurrentFactory = async (factoryId, factoryIndex) => {
    setSelectedFactoryIndex(-1);
    await removeFactory(factoryId);
    setFactories((prevFactories) => {
      console.log('prevFactories', prevFactories);
      const updatedFactories = prevFactories.filter(
        (factory) => factory.factoryId !== factoryId
      );
      return updatedFactories;
    });
    setFactoryDialogState((prevFactoryDialogState) => {
      const updatedState = [...prevFactoryDialogState];
      updatedState.splice(factoryIndex, 1);
      return updatedState;
    });
    setMachineDialogState((prevMachineDialogState) => {
      const updatedState = [...prevMachineDialogState];
      updatedState.splice(factoryIndex, 1);
      return updatedState;
    });
  };

  const handleEditFactory = (index) => {
    setIsEdit(true);
    setFactoryDialogState(factoryDialogState.map((open, i) => (i === index ? true : open)));
  };

  // Factory WebSocket Debug Panel Component
  const FactoryWebSocketStatus = () => (
    <div className="mb-4 space-y-3">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <Badge variant="secondary">
              <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1" />
              Connecting...
            </Badge>
          ) : isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="h-3 w-3 mr-1" />
              Connected ({wsSubscribedMachines.length} subscriptions)
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>

        {/* Event Counters */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-green-600" />
            <span>Realtime: {realtimeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-blue-600" />
            <span>SPC: {spcCount}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            WebSocket Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Last Realtime Event */}
        {lastRealtime && (
          <div className="p-2 bg-green-50 rounded border">
            <div className="font-medium text-green-800 mb-1">
              🔄 Last Realtime (Device {lastRealtime.deviceId})
            </div>
            {isRealtimeData(lastRealtime.data) ? (
              <div className="text-green-700">
                STS: {lastRealtime.data.Data?.STS} | T1: {lastRealtime.data.Data?.T1}°C | OT: {lastRealtime.data.Data?.OT}°C
              </div>
            ) : (
              <div className="text-green-700">
                Data: {JSON.stringify(lastRealtime.data).substring(0, 50)}...
              </div>
            )}
            <div className="text-green-600 text-[10px] mt-1">
              {lastRealtime.timestamp && new Date(lastRealtime.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Last SPC Event */}
        {lastSpc && (
          <div className="p-2 bg-blue-50 rounded border">
            <div className="font-medium text-blue-800 mb-1">
              📊 Last SPC (Device {lastSpc.deviceId})
            </div>
            <div className="text-blue-700">
              CYCN: {(lastSpc.data as any)?.Data?.CYCN} | ECYCT: {(lastSpc.data as any)?.Data?.ECYCT}s
            </div>
            <div className="text-blue-600 text-[10px] mt-1">
              {lastSpc.timestamp && new Date(lastSpc.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Machine Subscription Status */}
      <div className="p-2 bg-gray-50 rounded border text-xs">
        <div className="font-medium text-gray-800 mb-1">
          🏭 Factory Machines ({subscribedMachines.size} subscribed)
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {Array.from(subscribedMachines).map(deviceId => (
            <div key={deviceId} className="flex items-center gap-1 text-gray-600">
              <div className={`h-2 w-2 rounded-full ${realtimeData.has(deviceId) ? 'bg-green-400' : 'bg-gray-300'}`} />
              <span className="truncate">{deviceId}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FactoryScrollArea = ({ factory, factoryIndex }) => {
    // Calculate grid dimensions
    const gridWidth = factory.factoryWidth;
    const gridHeight = factory.factoryHeight;
    
    // Generate coordinate labels
    const columnLabels = Array.from({ length: gridWidth }, (_, i) => String.fromCharCode(65 + i)); // A, B, C, etc.
    const rowLabels = Array.from({ length: gridHeight }, (_, i) => i + 1); // 1, 2, 3, etc.
    
    return (
      <Card className="mt-4 overflow-hidden border-2 border-gray-200">
        {/* Factory Header with Industrial Design */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-3 sm:p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10">
                <FactoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">{factory.factoryName || `Factory ${factoryIndex + 1}`}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {gridWidth}×{gridHeight}
                  </Badge>
                  <span>•</span>
                  <span>{factory.machines?.length || 0} {t('factoryView.machines')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {factory.machines?.length === 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeCurrentFactory(factory.factoryId, factoryIndex)}
                  className="flex items-center gap-1 bg-red-500/80 hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{t('factoryView.deleteFactory')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Factory Controls & Legend */}
        <div className="border-b bg-slate-50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-400 ring-2 ring-green-200" />
                <span>{t('factoryView.online')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-gray-400 ring-2 ring-gray-200" />
                <span>{t('factoryView.offline')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-400 ring-2 ring-amber-200" />
                <span>{t('factoryView.warning')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400 ring-2 ring-red-200" />
                <span>{t('factoryView.error')}</span>
              </div>
            </div>
            
            {/* Factory Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm h-8 px-2 sm:px-3">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('factoryView.refresh')}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm h-8 px-2 sm:px-3"
                onClick={() => handleEditFactory(factoryIndex)}
              >
                <Cog className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('factoryView.settings')}</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Factory Floor */}
        <div className="p-3 sm:p-6">
          <ScrollArea className="w-full rounded-md border">
            <div className="p-2 sm:p-4">
              {/* Factory Blueprint Background */}
              <div className="relative">
                {/* Blueprint Grid Pattern */}
                <div className="absolute inset-0 bg-blue-50" 
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                
                <div className="relative">
                  {/* Column headers */}
                  <div className="mb-1 sm:mb-2 ml-8 sm:ml-10 grid gap-1" 
                    style={{ 
                      gridTemplateColumns: `repeat(${gridWidth}, minmax(4rem, 6rem))` 
                    }}>
                    {columnLabels.map(label => (
                      <div key={label} className="flex h-5 sm:h-6 items-center justify-center rounded bg-blue-100/50 text-xs sm:text-sm font-medium text-blue-800">
                        {label}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    {/* Row headers */}
                    <div className="mr-1 sm:mr-2 sm:mt-2 flex flex-col gap-1">
                      {rowLabels.map(label => (
                        <div key={label} className="flex h-16 sm:h-20 md:h-24 w-5 sm:w-6 items-center justify-center rounded bg-blue-100/50 text-xs sm:text-sm font-medium text-blue-800">
                          {label}
                        </div>
                      ))}
                    </div>
                    
                    {/* Grid */}
                    <div 
                      className="grid gap-1 rounded-md bg-white/80 p-1 sm:p-2 shadow-sm"
                      style={{
                        gridTemplateColumns: `repeat(${gridWidth}, minmax(4rem, 6rem))`,
                        gridTemplateRows: `repeat(${gridHeight}, auto)`,
                        minWidth: 'min-content',
                      }}
                    >
                      {Array.from({ length: gridWidth * gridHeight }).map((_, index) => {
                        const row = Math.floor(index / gridWidth);
                        const col = index % gridWidth;
                        const coordinate = `${columnLabels[col]}${rowLabels[row]}`;
                        
                        const matchingMachine = factory.machines?.find(
                          (machine) => machine.machineIndex === index
                        );
                        
                        return (
                          <div key={index} className="relative aspect-square">
                            {matchingMachine ? (
                              <div className="relative h-full w-full">
                                {/* Machine Shadow Effect */}
                                <div className="absolute -inset-0.5 rounded-md bg-black/5" />
                                <MachineStatusCard
                                  key={matchingMachine.machineId}
                                  machineIndex={matchingMachine.machineIndex}
                                  machine={matchingMachine}
                                  setFactories={setFactories}
                                  factoryIndex={factoryIndex}
                                  realtimeData={realtimeData.get(getDeviceId(matchingMachine))}
                                  isConnected={isConnected}
                                  deviceId={getDeviceId(matchingMachine)}
                                />
                              </div>
                            ) : (
                              <DropTarget
                                index={index}
                                onDrop={(item) => handleDropMachine(item, index)}
                                className="h-full w-full rounded-md"
                              >
                                <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-blue-300 bg-white transition-all hover:bg-blue-50/80 hover:shadow-sm"
                                onClick={() => handleAddMachine(factoryIndex, index)}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full text-blue-500 hover:bg-blue-100/50 hover:text-blue-600"
                                    
                                  >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <span className="mt-1 text-[10px] sm:text-xs text-blue-600/70">{coordinate}</span>
                                </div>
                              </DropTarget>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <MachineDialog
              open={machineDialogState[factoryIndex]}
              handleClose={() => handleCloseMachineDialog(factoryIndex)}
              factory={factory}
              factoryIndex={factoryIndex}
              setFactories={setFactories}
              machineIndex={selectedAddMachineIndex}
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          <div className="mt-3 sm:mt-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
            <p>{t('factoryView.dragInstruction')}</p>
          </div>
        </div>
      </Card>
    );
  };

  const SelectFactoryComponent = () => (
      <div className="flex justify-between items-center mb-4">
        <Select onValueChange={(value) => handleSelectFactory(parseInt(value, 10))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue
              placeholder={
                selectedFactoryIndex === -1
                  ? t('factory.allFactories')
                  : factories[selectedFactoryIndex].factoryName
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">{t('factory.allFactories')}</SelectItem>
            {factories.map((factory, index) => (
              <SelectItem key={index} value={index.toString()}>
                {factory.factoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

  const handleSelectFactory = (factoryIndex) => {
    setSelectedFactoryIndex(factoryIndex);
  };

  // Extracted common factory display logic into a reusable component
  const FactoryStatusChart = ({ factory, factoryIndex }) => (
    <div>
      <div className="my-8">
        <FactoryScrollArea factory={factory} factoryIndex={factoryIndex} />
      </div>
      <div className="border-t border-gray-200" />
    </div>
  );

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="w-full">
            {/* WebSocket Status and Debug Panel */}
            <FactoryWebSocketStatus />

            <SelectFactoryComponent />

            {selectedFactoryIndex === -1
              ? // Display all factories
                factories.map((factory, factoryIndex) => (
                  <FactoryStatusChart
                    key={factoryIndex}
                    factory={factory}
                    factoryIndex={factoryIndex}
                  />
                ))
              : // Display only the selected factory if valid
                selectedFactoryIndex >= 0 &&
                selectedFactoryIndex < factories.length && (
                  <FactoryStatusChart
                    factory={factories[selectedFactoryIndex]}
                    factoryIndex={selectedFactoryIndex}
                  />
                )}

            {/* Factory Dialogs */}
            {factoryDialogState.map((factoryState, index) => (
              <FactoryDialog
                key={index}
                open={factoryState}
                handleClose={() => handleCloseFactoryDialog(index)}
                factoryIndex={index}
                setFactories={setFactories}
                factories={factories}
                isEditMode={isEdit}
                setIsEdit={setIsEdit}
                setFactoryDialogState={setFactoryDialogState}
                setMachineDialogState={setMachineDialogState}
              />
            ))}

            {selectedFactoryIndex === -1 && (
              <div className="">
                <Button className="w-full" onClick={handleAddFactory}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('factory.addFactory')}
                </Button>
              </div>
            )}
          </div>
        </DndProvider>
      )}
    </>
  );
}

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { Wifi, WifiOff, AlertTriangle, AlertCircle, X, Thermometer } from 'lucide-react';
import { removeMachine } from 'src/api/machinesServices';
import { useDrag } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'src/components/ui/tooltip';
import { Button } from 'src/components/ui/button';
import { Card } from 'src/components/ui/card';
// import { useMachineRealtime, useMachineStatus } from '@/hooks/useWebSocket'; // Now using factory-level data
import { isRealtimeData } from '@/services/websocketService';

const ItemTypes = {
  MACHINE: 'machine',
};

// Machine statuses with enhanced styling
const STATUS_CONFIG = {
  online: {
    className: 'border-green-400 bg-gradient-to-br from-green-50 to-green-100',
    icon: <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />,
  },
  offline: {
    className: 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100',
    icon: <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />,
  },
  warning: {
    className: 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100',
    icon: <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />,
  },
  error: {
    className: 'border-red-400 bg-gradient-to-br from-red-50 to-red-100',
    icon: <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />,
  },
  running: {
    className: 'border-teal-400 bg-gradient-to-br from-teal-50 to-teal-100',
    icon: <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />,
  },
};

MachineStatusCard.propTypes = {
  machine: PropTypes.object.isRequired,
  setFactories: PropTypes.func,
  machineIndex: PropTypes.number,
  factoryIndex: PropTypes.number,
  status: PropTypes.string,
  realtimeData: PropTypes.object,
  isConnected: PropTypes.bool,
  deviceId: PropTypes.string,
};

export default function MachineStatusCard({
  machine,
  machineIndex,
  factoryIndex,
  setFactories,
  status = 'offline', // Default to offline until realtime says otherwise
  realtimeData = null, // Factory-provided realtime data
  isConnected = false, // Factory-provided connection status
  deviceId = null // Factory-provided device ID
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MACHINE,
    item: { machineIndex, factoryIndex, machineId: machine.machineId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Use factory-provided WebSocket data instead of individual hooks
  // const deviceId = String(machine.machineId); // Now provided by factory
  // Individual hooks disabled in favor of factory-level connection
  console.log(`🔧 Machine ${machine.machineId} status card - deviceId: ${deviceId}, hasRealtimeData: ${!!realtimeData}, isConnected: ${isConnected}`);

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    await removeMachine(machine.machineId);
    deleteMachineFromState(factoryIndex, machineIndex);
  };

  const deleteMachineFromState = (factoryIndex, machineIndex) => {
    setFactories((prevFactories) => {
      const updatedFactories = [...prevFactories];
      const targetFactory = { ...updatedFactories[factoryIndex] };
      targetFactory.machines = targetFactory.machines.filter(
        (m) => m.machineIndex !== machineIndex
      );
      updatedFactories[factoryIndex] = targetFactory;
      return updatedFactories;
    });
  };

  // Determine actual status based on real-time data
  const deriveStatus = (payload: any): keyof typeof STATUS_CONFIG => {
    if (!payload) return 'offline';

    // Handle both realtime data format and cached data format
    let sts: any;
    if (isRealtimeData(payload)) {
      sts = payload.Data?.STS;
    } else {
      sts = payload?.Data?.STS ?? payload?.status ?? payload?.Data?.status;
    }

    // Log the payload for debugging
    console.log('Machine Status Card - deriving status from payload:', {
      deviceId,
      dataType: isRealtimeData(payload) ? 'realtime' : 'other',
      STS: sts,
      payload
    });

    if (typeof sts === 'string') {
      const parsed = parseInt(sts, 10);
      if (!Number.isNaN(parsed)) sts = parsed;
    }

    // Based on backend testing: STS values are 0=offline, 1=online, 2=production, 3=warning
    switch (sts) {
      case 0: return 'offline';   // 0 = offline
      case 1: return 'online';    // 1 = online
      case 2: return 'running';   // 2 = production (shows as running/green)
      case 3: return 'warning';   // 3 = warning
      default:
        console.log('Unknown status value:', sts, 'defaulting to offline');
        return 'offline';
    }
  };

  let actualStatus: keyof typeof STATUS_CONFIG = status as any;

  // Use factory-provided realtime data for status derivation
  if (realtimeData?.data) {
    actualStatus = deriveStatus(realtimeData.data);
    console.log(`🎯 Machine ${machine.machineId} derived status: ${actualStatus} from realtime data`);
  } else {
    console.log(`⚠️ Machine ${machine.machineId} using default status: ${actualStatus} (no realtime data)`);
  }

  const statusConfig = STATUS_CONFIG[actualStatus] || STATUS_CONFIG.offline;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={`/machine/${machine.machineId}`} className="block h-full w-full">
            <Card
              ref={drag}
              className={`
                w-full h-full
                flex flex-col items-center justify-between
                p-1 sm:p-2
                border border-dashed
                rounded-md shadow-sm
                transition-all duration-200
                hover:shadow-md
                hover:translate-y-[-2px]
                ${statusConfig.className}
                ${isDragging ? 'opacity-50' : ''}
                relative
              `}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 sm:h-5 sm:w-5 rounded-full hover:bg-black/10 p-0 absolute top-0.5 right-0.5 sm:top-1 sm:right-1"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              </Button>
              
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="text-center mb-0.5 sm:mb-1">
                  {statusConfig.icon}
                </div>
                <span className="font-medium text-center text-[10px] sm:text-xs leading-tight max-w-full truncate px-1">
                  {machine.machineName}
                </span>
              </div>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <Box>
            <div className="text-xs sm:text-sm">
              Name: <span className="font-bold">{machine.machineName}</span>
            </div>
            <div className="text-xs sm:text-sm">
              IP: <span className="font-bold">{machine.machineIpAddress}</span>
            </div>
            <div className="text-xs sm:text-sm">
              Status: <span className="font-bold capitalize">{actualStatus}</span>
            </div>
            <div className="text-xs sm:text-sm">
              WebSocket: <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {realtimeData?.data && (
              <>
                {isRealtimeData(realtimeData.data) && (
                  <>
                    <div className="text-xs sm:text-sm">
                      T1: <span className="font-bold">{realtimeData.data.Data?.T1 ?? 'N/A'}°C</span>
                    </div>
                    {realtimeData.data.Data?.OT !== undefined && (
                      <div className="text-xs sm:text-sm">
                        Oil Temp: <span className="font-bold">{realtimeData.data.Data.OT}°C</span>
                      </div>
                    )}
                    <div className="text-xs sm:text-sm">
                      Mode: <span className="font-bold">
                        {realtimeData.data.Data?.OPM === 0 ? 'Manual' :
                         realtimeData.data.Data?.OPM === 1 ? 'Semi-auto' :
                         realtimeData.data.Data?.OPM === 2 ? 'Eye auto' : 'Unknown'}
                      </span>
                    </div>
                    {realtimeData.data.lastUpdated && (
                      <div className="text-xs sm:text-sm">
                        Updated: <span className="font-bold">{new Date(realtimeData.data.lastUpdated).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { Wifi, WifiOff, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { removeMachine } from 'src/api/machinesServices';
import { useDrag } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ItemTypes = {
  MACHINE: 'machine',
};

// Machine statuses with enhanced styling
const STATUS_CONFIG = {
  online: {
    className: 'border-green-400 bg-gradient-to-br from-green-50 to-green-100',
    icon: <Wifi className="h-5 w-5 text-green-600" />,
  },
  offline: {
    className: 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100',
    icon: <WifiOff className="h-5 w-5 text-gray-500" />,
  },
  warning: {
    className: 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
  },
  error: {
    className: 'border-red-400 bg-gradient-to-br from-red-50 to-red-100',
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
  },
};

MachineStatusCard.propTypes = {
  machine: PropTypes.object.isRequired,
  setFactories: PropTypes.func,
  machineIndex: PropTypes.number,
  factoryIndex: PropTypes.number,
  status: PropTypes.string,
};

export default function MachineStatusCard({ 
  machine, 
  machineIndex, 
  factoryIndex, 
  setFactories,
  status = 'online' // Default status
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MACHINE,
    item: { machineIndex, factoryIndex, machineId: machine.machineId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.offline;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={`/machine/${machine.machineId}`} className="block">
            <Card
              ref={drag}
              className={`
                w-24 h-24
                flex flex-col items-center justify-between
                p-2
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
                className="h-5 w-5 rounded-full hover:bg-black/10 p-0 absolute top-1 right-1"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
              
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="text-center mb-1">
                  {statusConfig.icon}
                </div>
                <span className="font-medium text-center text-xs leading-tight max-w-full truncate">
                  {machine.machineName}
                </span>
              </div>
            </Card>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <Box>
            <div>
              Name: <span className="font-bold">{machine.machineName}</span>
            </div>
            <div>
              IP: <span className="font-bold">{machine.machineIpAddress}</span>
            </div>
            <div>
              Status: <span className="font-bold capitalize">{status}</span>
            </div>
          </Box>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

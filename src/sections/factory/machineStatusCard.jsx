import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router-dom';
import ConnectIcon from '@mui/icons-material/Power';
import DisconnectIcon from '@mui/icons-material/PowerOff';
import DeleteIcon from '@mui/icons-material/Delete';
import { connectByIpAddress, disconnectByIpAddress, removeMachine } from 'src/api/machinesServices';
import { useDrag } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ItemTypes = {
  MACHINE: 'machine',
};

MachineStatusCard.propTypes = {
  machine: PropTypes.object.isRequired,
  setFactories: PropTypes.func,
  machineIndex: PropTypes.number,
  factoryIndex: PropTypes.number,
};

export default function MachineStatusCard({ machine, machineIndex, factoryIndex, setFactories }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MACHINE,
    item: { machineIndex, factoryIndex, machineId: machine.machineId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleConnect = () => {
    connectByIpAddress(machine.machineIpAddress);
  };

  const handleDisconnect = () => {
    disconnectByIpAddress(machine.machineIpAddress);
  };

  const handleDelete = async () => {
    await disconnectByIpAddress(machine.machineIpAddress);
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

  return (
    <div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Card
                ref={drag}
                className={`grid border border-dashed border-green-400 bg-green-100 h-40 rounded-md w-full justify-center items-center shadow-none ${isDragging ? 'opacity-50' : ''}`}
              >
                <p>{machine.machineName}</p>
                <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                  {/* <Button variant="ghost" className='p-0 rounded-full hover:bg-gray-200 hover:bg-opacity-50' size="icon" onClick={handleConnect} aria-label="Connect">
                    <ConnectIcon className='text-gray-700 !w-5 !h-5'/>
                  </Button>
                  <Button variant="ghost" className='p-0 rounded-full hover:bg-gray-200 hover:bg-opacity-50' size="icon" onClick={handleDisconnect} aria-label="Disconnect">
                    <DisconnectIcon className='text-gray-700 !w-5 !h-5'/>
                  </Button> */}
                  <Link key={`/machine/${machine.machineId}`} to={`/machine/${machine.machineId}`}>
                    <Button variant="link" aria-label="Detail">
                      查看詳情
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="p-0 rounded-full hover:bg-gray-200 hover:bg-opacity-50"
                    size="icon"
                    onClick={handleDelete}
                    aria-label="Delete"
                  >
                    <DeleteIcon className="text-gray-700 !w-5 !h-5" />
                  </Button>
                </Stack>
              </Card>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <Box>
              <div>
                Name: <span className="font-bold">{machine.machineName}</span>
              </div>
              <div>
                IP: <span className="font-bold">{machine.machineIpAddress}</span>
              </div>
            </Box>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

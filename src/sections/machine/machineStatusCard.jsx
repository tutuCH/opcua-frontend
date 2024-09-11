import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ConnectIcon from '@mui/icons-material/Power';
import DisconnectIcon from '@mui/icons-material/PowerOff';
import DeleteIcon from '@mui/icons-material/Delete';
import { connectByIpAddress, disconnectByIpAddress, removeMachine } from 'src/api/machinesServices';
import { useDrag } from 'react-dnd';

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
      <Tooltip
        title={
          <Box>
            <div>Name: {machine.machineName}</div>
            <div>IP: {machine.machineIpAddress}</div>
          </Box>
        }
        arrow
      >
        <Box
          ref={drag}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          sx={{
            border: '1px solid',
            borderColor: 'success.lighter',
            backgroundColor: 'success.lighter',
            height: '150px',
            width: '100%',
            borderRadius: '8px',
            color: 'grey.500',
            display: 'grid',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography>{machine.machineName}</Typography>
          <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
            <IconButton size="small" onClick={handleConnect} aria-label="Connect">
              <ConnectIcon />
            </IconButton>
            <IconButton size="small" onClick={handleDisconnect} aria-label="Disconnect">
              <DisconnectIcon />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </Stack>
          {/* <IconButton onClick={handleConnect} aria-label="Connect">
            <ConnectIcon />
          </IconButton>
          <IconButton onClick={handleDisconnect} aria-label="Disconnect">
            <DisconnectIcon />
          </IconButton>
          <IconButton onClick={handleDelete} aria-label="Delete">
            <DeleteIcon />
          </IconButton> */}
        </Box>
      </Tooltip>
    </div>
  );
}

// import PropTypes from 'prop-types';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import { connectByIpAddress, disconnectByIpAddress, removeMachine } from 'src/api/machinesServices';
// ----------------------------------------------------------------------

MachineStatusCard.propTypes = {
  machine: PropTypes.object.isRequired,
  setFactories: PropTypes.func,
  machineIndex: PropTypes.number,
  factoryIndex: PropTypes.number,
};

export default function MachineStatusCard(prop) {
  const { machine, machineIndex, factoryIndex, setFactories } = prop;
  const deleteMachine = async () => {
    const disconnectRes = await disconnectByIpAddress(machine.machineIpAddress);
    const deleteMachineRes = await removeMachine(machine.machineId);
    deleteMachineFromState(factoryIndex, machineIndex);

  }

  const deleteMachineFromState = (factoryIndex, machineIndex) => {
    setFactories((prevFactories) => {
      const updatedFactories = [...prevFactories];
      const targetFactory = { ...updatedFactories[factoryIndex] };
      const updatedMachines = targetFactory.machines.filter((_, index) => index !== machineIndex);

      targetFactory.machines = updatedMachines;
      updatedFactories[factoryIndex] = targetFactory;
      return updatedFactories;
    });
  };

  return (
    <Grid xs={12} sm={4}>
      <Card>
        <Box sx={{p: (theme) => theme.spacing(4, 3, 3, 3)}}> {machine.machineName} </Box>
        <Box sx={{p: (theme) => theme.spacing(4, 3, 3, 3)}}> {machine.machineIpAddress} </Box>
        <Box sx={{p: (theme) => theme.spacing(4, 3, 3, 3)}}> 
          <Button variant="text" color="primary" onClick={() => connectByIpAddress(machine.machineIpAddress)}>連線</Button>
          <Button variant="text" color="warning" onClick={() => disconnectByIpAddress(machine.machineIpAddress)}>斷線</Button>
        </Box>
        <Box sx={{p: (theme) => theme.spacing(4, 3, 3, 3)}}> 
          <Button variant="text" color="error" onClick={deleteMachine}>移除</Button>
        </Box>
      </Card>
    </Grid>
  );
}



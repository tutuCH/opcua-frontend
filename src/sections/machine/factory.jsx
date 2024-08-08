// import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
// import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import Grid from '@mui/material/Unstable_Grid2';

import { posts } from 'src/_mock/blog';

import Iconify from 'src/components/iconify/iconify';

import MachineStatusCard from './machineStatusCard';
import MachineDialog from './machineDialog';
import FactoryDialog from './factoryDialog';
import { useEffect, useState } from 'react';
import { getFactoriesMachinesByUserId } from 'src/api/machinesServices';
import { createFactory, removeFactory } from '../../api/machinesServices';

export default function Factory() {
  const [factories, setFactories] = useState([]);
  const [machineDialogState, setMachineDialogState] = useState([]);
  const [factoryDialogState, setFactoryDialogState] = useState([]);

  useEffect(() => {
    getFactoriesMachines();
  }, []);

  const getFactoriesMachines = async () => {
    const data = await getFactoriesMachinesByUserId(1);
    setFactories(data);
    setMachineDialogState(new Array(data.length).fill(false));
    setFactoryDialogState(new Array(data.length).fill(false));
  };

  const handleAddMachine = (index) => {
    setMachineDialogState(machineDialogState.map((open, i) => (i === index ? true : open)));
  };

  const handleCloseMachineDialog = (index) => {
    setMachineDialogState(machineDialogState.map((open, i) => (i === index ? false : open)));
  };

  const handleAddFactory = () => {
    setFactoryDialogState(factoryDialogState.map((open, i) => (i === factories.length - 1 ? true : open)));
  };

  const handleCloseFactoryDialog = (index) => {
    setFactoryDialogState(factoryDialogState.map((open, i) => (i === index ? false : open)));
  };

  const removeCurrentFactory = async(factoryId) => {
    const removeFactoryRes = await removeFactory(factoryId);
    setFactories((prevFactories) => {
      const updatedFactories = [...prevFactories];
      updatedFactories.pop();
      return updatedFactories;
    });
  }
  return (
    <Box>
      {factories.map((factory, factoryIndex) => {
        return (
          <div key={factoryIndex}>
            <Typography variant="h5">{factory.factoryName}</Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Grid container spacing={4}>
                {factory.machines?.map((machine, index) => (
                  <MachineStatusCard
                    key={machine.machineId}
                    machineIndex={index}
                    machine={machine}
                    setFactories={setFactories}
                    factoryIndex={factoryIndex}
                  />
                ))}
                <Grid xs={12} sm={4}>
                  <Button
                    // sx={{ p: (theme) => theme.spacing(4, 3, 3, 3) }}
                    variant="contained"
                    color="inherit"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => handleAddMachine(factoryIndex)}
                  >
                    新機台
                  </Button>
                  {factory.machines?.length === 0 && (
                    <Button
                      // sx={{ p: (theme) => theme.spacing(4, 3, 3, 3) }}
                      variant="contained"
                      color="error"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={() => removeCurrentFactory(factory.factoryId)}
                    >
                      刪除廠區
                    </Button>
                  )}
                </Grid>
                <MachineDialog
                  open={machineDialogState[factoryIndex]}
                  handleClose={() => handleCloseMachineDialog(factoryIndex)}
                  factory={factory}
                  factoryIndex={factoryIndex}
                  setFactories={setFactories}
                />

                <FactoryDialog
                  open={factoryDialogState[factoryIndex]}
                  handleClose={() => handleCloseFactoryDialog(factoryIndex)}
                  factory={factory}
                  factoryIndex={factoryIndex}
                  setFactories={setFactories}
                />
              </Grid>
            </Paper>
          </div>
        );
      })}
      <Box sx={{ p: 3 }}>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          // onClick={() => createNewFactory()}
          onClick={handleAddFactory}
        >
          新廠區
        </Button>
      </Box>
    </Box>
  );
}

Factory.propTypes = {
  // post: PropTypes.object.isRequired,
  // index: PropTypes.number,
};

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import AddIcon from '@mui/icons-material/Add';
import MachineStatusCard from './MachineStatusCard';
import MachineDialog from './machineDialog';
import FactoryDialog from './factoryDialog';
import { useEffect, useState } from 'react';
import { getFactoriesMachinesByUserId } from 'src/api/machinesServices';
import { updateMachineIndex, removeFactory } from '../../api/machinesServices';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Iconify from 'src/components/iconify/iconify';

const ItemTypes = {
  MACHINE: 'machine',
};

export default function Factory() {
  const [factories, setFactories] = useState([]);
  const [machineDialogState, setMachineDialogState] = useState([]);
  const [factoryDialogState, setFactoryDialogState] = useState([]);
  const userId = localStorage.getItem('user_id');
  useEffect(() => {
    getFactoriesMachines();
  }, []);

  useEffect(() => {
    console.log(JSON.stringify(factoryDialogState));
  }, [factoryDialogState]);

  const getFactoriesMachines = async () => {
    const data = await getFactoriesMachinesByUserId(userId);
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

  // const handleAddFactory = async () => {
  //   setFactoryDialogState(factoryDialogState.map((open, i) => (i === factories.length - 1 ? true : open)));
  // };
  const handleAddFactory = async () => {
    if (factories.length === 0) {
      // If there are no factories, set the first item in the array to true
      setFactoryDialogState([true]);
    } else {
      // If there are existing factories, update the correct index
      setFactoryDialogState(
        factoryDialogState.map((open, i) => (i === factories.length - 1 ? true : open))
      );
    }
  };
  

  const handleCloseFactoryDialog = (index) => {
    setFactoryDialogState(factoryDialogState.map((open, i) => (i === index ? false : open)));
  };
  
  const handleDropMachine = async (item, index) => {
    const { factoryIndex, machineIndex, machineId } = item;
    if (index !== machineIndex) {
      await updateMachineIndex({ machineId, machineIndex: index });
      // Update the machine's index
      setFactories((prevFactories) => {
        const updatedFactories = [...prevFactories];
        const targetFactory = { ...updatedFactories[factoryIndex] };
        const machine = targetFactory.machines.find((machine) => machine.machineIndex === machineIndex);

        if (machine) {
          machine.machineIndex = index;
          // Remove the machine from its original position
          targetFactory.machines = targetFactory.machines.filter(
            (m) => m.machineIndex !== machineIndex
          );
          // Add the machine to its new position
          targetFactory.machines.push(machine);

          updatedFactories[factoryIndex] = targetFactory;
        }
        return updatedFactories;
      });
    }
  };

  const removeCurrentFactory = async (factoryId) => {
    const removeFactoryRes = await removeFactory(factoryId);
    setFactories((prevFactories) => {
      const updatedFactories = [...prevFactories];
      updatedFactories.pop();
      return updatedFactories;
    });
  }; // Fix: Add the missing closing brace

  return (
    <DndProvider backend={HTML5Backend}>
      <Box>
        {factories.map((factory, factoryIndex) => {
          return (
            <div key={factoryIndex}>
              <Typography variant="h5">{factory.factoryName}</Typography>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  {Array.from({ length: 50 }).map((_, index) => {
                    const matchingMachine = factory.machines?.find(
                      (machine) => machine.machineIndex === index
                    );
                    return (
                      <Grid key={index} xs={1.2}>
                        {matchingMachine ? (
                          <MachineStatusCard
                            key={matchingMachine.machineId}
                            machineIndex={matchingMachine.machineIndex}
                            machine={matchingMachine}
                            setFactories={setFactories}
                            factoryIndex={factoryIndex}
                          />
                        ) : (
                          <DropTarget
                            index={index}
                            onDrop={(item) => handleDropMachine(item, index)}
                          >
                            <Button
                              sx={{
                                border: '2px dotted',
                                borderColor: 'grey.400',
                                backgroundColor: 'transparent',
                                height: '150px',
                                width: '100%',
                                color: 'grey.500',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                '&:hover': {
                                  backgroundColor: 'grey.100',
                                },
                              }}
                              onClick={() => handleAddMachine(factoryIndex)}
                            >
                              <AddIcon sx={{ fontSize: '2rem' }} />
                            </Button>
                          </DropTarget>
                        )}
                      </Grid>
                    );
                  })}

                  <Grid xs={12} sm={4}>
                    {factory.machines?.length === 0 && (
                      <Button
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
            aria-hidden="false" 
            aria-modal="true"          
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAddFactory}
          >
            新廠區
          </Button>
        </Box>
      </Box>
    </DndProvider>
  );
}

function DropTarget({ index, onDrop, children }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.MACHINE,
    drop: (item) => onDrop(item, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop} style={{ opacity: isOver && canDrop ? 0.5 : 1 }}>
      {children}
    </div>
  );
}

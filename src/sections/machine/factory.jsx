import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import MachineStatusCard from './MachineStatusCard';
import MachineDialog from './machineDialog';
import FactoryDialog from './factoryDialog';
import { useEffect, useState } from 'react';
import { getFactoriesMachinesByUserId } from 'src/api/machinesServices';
import { updateMachineIndex, removeFactory } from '../../api/machinesServices';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Iconify from 'src/components/iconify/iconify';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';

export default function Factory() {
  const [factories, setFactories] = useState([]);
  const [machineDialogState, setMachineDialogState] = useState([]);
  const [factoryDialogState, setFactoryDialogState] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const userId = localStorage.getItem('user_id');
  const ItemTypes = {
    MACHINE: 'machine',
  };

  useEffect(() => {
    console.log('after machineDialogState: ' + JSON.stringify(machineDialogState));
  }, [machineDialogState]);
  useEffect(() => {
    getFactoriesMachines();
  }, []);

  const getFactoriesMachines = async () => {
    const data = await getFactoriesMachinesByUserId(userId);
    setFactories(data);
    setMachineDialogState(new Array(data.length).fill(false));
    setFactoryDialogState(new Array(data.length).fill(false));
  };

  const handleAddMachine = (index) => {
    console.log(`before: ${JSON.stringify(machineDialogState)}`);
    setMachineDialogState(machineDialogState.map((open, i) => (i === index ? true : open)));
  };

  const handleCloseMachineDialog = (index) => {
    setMachineDialogState(machineDialogState.map((open, i) => (i === index ? false : open)));
  };

  // const handleAddFactory = async () => {
  //   if (factories.length === 0) {
  //     setFactoryDialogState([true]);
  //   } else {
  //     setFactoryDialogState(
  //       factoryDialogState.map((open, i) => (i === factories.length - 1 ? true : open))
  //     );
  //   }
  // };
  const handleAddFactory = async () => {
    setIsEdit(false);
    setFactoryDialogState(
      factoryDialogState.map((open, i) => (i === factories.length - 1 ? true : open))
    );
  };

  const handleCloseFactoryDialog = (index) => {
    setFactoryDialogState((prevState) => prevState.map((open, i) => (i === index ? false : open)));
  };

  const handleDropMachine = async (item, index) => {
    const { factoryIndex, machineIndex, machineId } = item;
    if (index !== machineIndex) {
      await updateMachineIndex({ machineId, machineIndex: index });
      setFactories((prevFactories) => {
        const updatedFactories = [...prevFactories];
        const targetFactory = { ...updatedFactories[factoryIndex] };
        const machine = targetFactory.machines.find(
          (machine) => machine.machineIndex === machineIndex
        );

        if (machine) {
          machine.machineIndex = index;
          targetFactory.machines = targetFactory.machines.filter(
            (m) => m.machineIndex !== machineIndex
          );
          targetFactory.machines.push(machine);
          updatedFactories[factoryIndex] = targetFactory;
        }
        return updatedFactories;
      });
    }
  };

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
      <div ref={drop} style={{ opacity: isOver && canDrop ? 0.5 : 1 }}>
        {children}
      </div>
    );
  };

  const removeCurrentFactory = async (factoryId, factoryIndex) => {
    const removeFactoryRes = await removeFactory(factoryId);
    setFactories((prevFactories) => {
      const updatedFactories = [...prevFactories];
      updatedFactories.pop();
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

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ width: '100%' }}>
        {factories.map((factory, factoryIndex) => {
          return (
            <div key={factoryIndex}>
              <Box sx={{ margin: '2rem 0' }} >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">{factory.factoryName}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleEditFactory(factoryIndex)}
                    aria-label="Edit"
                  >
                    <EditIcon />
                  </IconButton>
                </Box>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    overflowX: 'auto', // Enable horizontal scroll if needed
                    marginTop: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${factory.factoryWidth}, minmax(120px, 1fr))`, // Create columns based on factoryWidth with a minimum width of 120px
                      gap: 2,
                      marginBottom: 3,
                    }}
                  >
                    {Array.from({ length: factory.factoryWidth * factory.factoryHeight }).map(
                      (_, index) => {
                        const matchingMachine = factory.machines?.find(
                          (machine) => machine.machineIndex === index
                        );
                        return (
                          <Box key={index}>
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
                          </Box>
                        );
                      }
                    )}
                  </Box>

                  {factory.machines?.length === 0 && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={() => removeCurrentFactory(factory.factoryId, factoryIndex)}
                    >
                      刪除廠區
                    </Button>
                  )}

                  <MachineDialog
                    open={machineDialogState[factoryIndex]}
                    handleClose={() => handleCloseMachineDialog(factoryIndex)}
                    factory={factory}
                    factoryIndex={factoryIndex}
                    setFactories={setFactories}
                  />
                </Paper>
              </Box>
              <Divider />
            </div>
          );
        })}
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

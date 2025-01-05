import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import {
  getFactoriesMachinesByUserId,
  updateMachineIndex,
  removeFactory,
} from 'src/api/machinesServices';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Iconify from 'src/components/iconify/iconify';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@/components/ui/button';
import FactoryDialog from './factoryDialog';
import MachineDialog from './machineDialog';
import MachineStatusCard from './machineStatusCard';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Factory() {
  const [factories, setFactories] = useState([]);
  const [selectedAddMachineIndex, setSelectedAddMachineIndex] = useState(null);
  const [machineDialogState, setMachineDialogState] = useState([]);
  const [factoryDialogState, setFactoryDialogState] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const userId = localStorage.getItem('user_id');
  const ItemTypes = {
    MACHINE: 'machine',
  };

  useEffect(() => {}, [machineDialogState]);

  useEffect(() => {
    const getFactoriesMachines = async () => {
      const data = await getFactoriesMachinesByUserId(userId);
      setFactories(data);
      setMachineDialogState(new Array(data.length).fill(false));
      setFactoryDialogState(new Array(data.length).fill(false));
    };

    getFactoriesMachines();
  }, [userId]);

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

  const FactoryScrollArea = ({ factory, factoryIndex }) => {
    return (
      <Card className="mt-4 p-6">
        <ScrollArea className="w-full">
          <div className="grid gap-4 mb-6" 
          style={{
            gridTemplateColumns: `repeat(${factory.factoryWidth}, 1fr)`,
            minWidth: 'min-content'
          }}
          >
            {Array.from({ length: factory.factoryWidth * factory.factoryHeight }).map(
              (_, index) => {
                const matchingMachine = factory.machines?.find(
                  (machine) => machine.machineIndex === index
                );
                return (
                  <div key={index} className="min-w-32">
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
                        className="rounded-sm"
                      >
                        <Button
                          variant="outline"
                          className="h-40 w-full border-dashed border-gray-400 hover:bg-gray-100"
                          onClick={() => handleAddMachine(factoryIndex, index)}
                        >
                          <AddIcon className="h-8 w-8 text-gray-500" />
                        </Button>
                      </DropTarget>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {factory.machines?.length === 0 && (
            <Button
              variant="destructive"
              className="w-auto"
              onClick={() => removeCurrentFactory(factory.factoryId, factoryIndex)}
            >
              <Iconify icon="eva:trash-2-outline" className="mr-2" />
              刪除廠區
            </Button>
          )}

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
      </Card>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full">
        {factories.map((factory, factoryIndex) => (
          <div key={factoryIndex}>
            <div className="my-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{factory.factoryName}</h2>
                <IconButton
                  size="small"
                  onClick={() => handleEditFactory(factoryIndex)}
                  aria-label="Edit"
                >
                  <EditIcon />
                </IconButton>
              </div>
              <FactoryScrollArea factory={factory} factoryIndex={factoryIndex} />
            </div>
            <div className="border-t border-gray-200" />
          </div>
        ))}

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

        <div className="">
          <Button className="w-full" onClick={handleAddFactory}>
            <Iconify icon="eva:plus-fill" className="mr-2" />
            新廠區
          </Button>
        </div>
      </div>
    </DndProvider>
  );
}

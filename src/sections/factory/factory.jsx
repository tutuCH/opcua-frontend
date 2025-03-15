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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FactoryDialog from './factory-dialog';
import MachineDialog from './machine-dialog';
import MachineStatusCard from './machine-status-card';
import { Card } from '@/components/ui/card';
import LoadingSkeleton from '@/components/loadingSkeleton/loadingSkeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function Factory() {
  const [factories, setFactories] = useState([]);
  const [selectedAddMachineIndex, setSelectedAddMachineIndex] = useState(null);
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(-1);
  const [machineDialogState, setMachineDialogState] = useState([]);
  const [factoryDialogState, setFactoryDialogState] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('user_id');
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
                  <span>{factory.machines?.length || 0} machines</span>
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
                  <span className="hidden sm:inline">刪除廠區</span>
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
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-400 ring-2 ring-green-200"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-gray-400 ring-2 ring-gray-200"></div>
                <span>Offline</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-400 ring-2 ring-amber-200"></div>
                <span>Warning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400 ring-2 ring-red-200"></div>
                <span>Error</span>
              </div>
            </div>
            
            {/* Factory Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm h-8 px-2 sm:px-3">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs sm:text-sm h-8 px-2 sm:px-3"
                onClick={() => handleEditFactory(factoryIndex)}
              >
                <Cog className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">設定</span>
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
                  }}>
                </div>
                
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
                        
                        // Determine machine status (in a real app, this would come from your data)
                        const machineStatus = matchingMachine ? 
                          (Math.random() > 0.7 ? 'warning' : Math.random() > 0.9 ? 'error' : 'online') : null;
                        
                        return (
                          <div key={index} className="relative aspect-square">
                            {matchingMachine ? (
                              <div className="relative h-full w-full">
                                {/* Machine Shadow Effect */}
                                <div className="absolute -inset-0.5 rounded-md bg-black/5"></div>
                                <MachineStatusCard
                                  key={matchingMachine.machineId}
                                  machineIndex={matchingMachine.machineIndex}
                                  machine={matchingMachine}
                                  setFactories={setFactories}
                                  factoryIndex={factoryIndex}
                                  status={machineStatus}
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
            <p>Drag machines to rearrange them on the factory floor. Click empty spaces to add new machines.</p>
          </div>
        </div>
      </Card>
    );
  };

  const SelectFactoryComponent = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <Select onValueChange={(value) => handleSelectFactory(parseInt(value, 10))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue
              placeholder={
                selectedFactoryIndex === -1
                  ? '全部廠區'
                  : factories[selectedFactoryIndex].factoryName
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">全部廠區</SelectItem>
            {factories.map((factory, index) => (
              <SelectItem key={index} value={index.toString()}>
                {factory.factoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

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
                  新廠區
                </Button>
              </div>
            )}
          </div>
        </DndProvider>
      )}
    </>
  );
}

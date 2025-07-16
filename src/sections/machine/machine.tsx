import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSkeleton from '@/components/loadingSkeleton/loadingSkeleton';
import { getFactoriesMachinesByUserId } from 'src/api/machinesServices';
import MachineBreadcumbList from './components/machine-breadcumb-list';
import MachineTableChartTab from './components/machine-table-chart-tab';
export default function Machine() {
  const [isLoading, setIsLoading] = useState(false);
  const [factories, setFactories] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [belongsToFactory, setBelongsToFactory] = useState(null);
  const [factoryIndex, setFactoryIndex] = useState(null);
  const userId = localStorage.getItem('user_id');
  
  const { machineId } = useParams();
  useEffect(() => {
    const getFactoriesMachines = async () => {
      setIsLoading(true);
      const factoryMachinesResponse = await getFactoriesMachinesByUserId(userId);
      setFactories(factoryMachinesResponse);
      handlePreloadBreadcrumb(factoryMachinesResponse, machineId);
      setIsLoading(false);
    };
    getFactoriesMachines();
  }, [userId]);

  useEffect(() => {
    setFactoryIndex(factories.findIndex(factory => factory.factoryId === belongsToFactory?.factoryId));
  }, [belongsToFactory]);



  const handlePreloadBreadcrumb = (factories, machineId) => {
    if (machineId) {
      setSelectedMachine(factories.flatMap(factory => factory.machines).find(m => m.machineId === parseInt(machineId, 10)));
      setBelongsToFactory(factories.find(factory => factory.machines.some(machine => machine.machineId === parseInt(machineId, 10))));
    } else {
      if (factories.length > 0 && factories[0].machines && factories[0].machines.length > 0) {
        setSelectedMachine(factories[0].machines[0]);
        setBelongsToFactory(factories[0]);
      } else {
        setSelectedMachine(null);
        setBelongsToFactory(null);
      }
    }
  }

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="w-full">
          <MachineBreadcumbList
            factories={factories}
            selectedMachine={selectedMachine}
            belongsToFactory={belongsToFactory}
            factoryIndex={factoryIndex}
            setSelectedMachine={setSelectedMachine}
            setBelongsToFactory={setBelongsToFactory}
          />
          <MachineTableChartTab />
        </div>
      )}
    </>
  );
}

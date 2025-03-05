import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingSkeleton from '@/components/loadingSkeleton/loadingSkeleton';
import { ChevronDown, Slash } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  getFactoriesMachinesByUserId,
} from 'src/api/machinesServices';

export default function Machine() {
  const [isLoading, setIsLoading] = useState(false);
  const [factories, setFactories] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
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

  const handleSelectMachine = (factory, machine) => {
    setOpen(false);
    setSelectedMachine(machine);
    setBelongsToFactory(factory);
  }

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
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link key={`/factory`} to={`/factory`}>
                    全部工廠
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {belongsToFactory && (
                <>
                  <BreadcrumbSeparator />            
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link key={`/factory/${factoryIndex}`} to={`/factory/${factoryIndex}`}>
                        {belongsToFactory?.factoryName}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              {selectedMachine && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                      <DropdownMenuTrigger className="flex items-center gap-1">
                        {selectedMachine?.machineName || "Components"}
                        <ChevronDown />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="max-h-72 max-w-40 p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search machines..." 
                            value={searchValue}
                            onValueChange={setSearchValue}
                            className="h-9"
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty>No results found.</CommandEmpty>
                            {factories?.map((factory, index) => {
                              const matchingMachines = factory.machines.filter(machine => 
                                machine.machineName.toLowerCase().includes(searchValue.toLowerCase())
                              );
                              const factoryMatches = factory.factoryName.toLowerCase().includes(searchValue.toLowerCase());
                              
                              if (!factoryMatches && matchingMachines.length === 0) {
                                return null;
                              }

                              return (
                                <CommandGroup key={index} heading={factory.factoryName}>
                                  {matchingMachines.map((machine, mIndex) => (
                                    <CommandItem 
                                      key={`${index}-${mIndex}`} 
                                      value={`${factory.factoryName}-${machine.machineName}`}
                                      className={`${machine.machineId === selectedMachine?.machineId ? 'bg-primary-foreground' : ''}`}
                                      onSelect={() => {handleSelectMachine(factory, machine)}}
                                    >
                                      {machine.machineName}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              );
                            })}
                          </CommandList>
                        </Command>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </>
  );
}

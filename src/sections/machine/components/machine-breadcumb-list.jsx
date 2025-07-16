import { useState } from "react";
import { ChevronDown, Slash } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'src/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "src/components/ui/dropdown-menu"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "src/components/ui/command"
import { Link } from "react-router-dom";

export default function MachineBreadcumbList({ factories, selectedMachine, belongsToFactory, factoryIndex, setSelectedMachine, setBelongsToFactory }) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  const handleSelectMachine = (factory, machine) => {
    setOpen(false);
    setSelectedMachine(machine);
    setBelongsToFactory(factory);
  }
  return (
    <Breadcrumb className="mb-4">
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
                  {selectedMachine?.machineName || 'Components'}
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
                        const matchingMachines = factory.machines.filter((machine) =>
                          machine.machineName.toLowerCase().includes(searchValue.toLowerCase())
                        );
                        const factoryMatches = factory.factoryName
                          .toLowerCase()
                          .includes(searchValue.toLowerCase());

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
                                onSelect={() => {
                                  handleSelectMachine(factory, machine);
                                }}
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
  );
}

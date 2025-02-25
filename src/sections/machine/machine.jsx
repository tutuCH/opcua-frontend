import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Machine() {
  const [isLoading, setIsLoading] = useState(false);
  const factoryId = 1;
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const factoryData = [
    {
      name: "工廠一",
      machines: ["機台一", "機台二", "機台三"]
    },
    {
      name: "工廠二", 
      machines: ["機台一", "機台二", "機台三"]
    },
    {
      name: "工廠三",
      machines: ["機台一", "機台二", "機台三"] 
    },
    {
      name: "工廠四",
      machines: ["機台一", "機台二", "機台三"]
    },
    {
      name: "工廠五",
      machines: ["機台一", "機台二", "機台三"]
    },
    {
      name: "工廠六",
      machines: ["機台一", "機台二", "機台三"]
    }
  ];

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
                  <Link key={`/factory/${factoryId}`} to={`/factory/${factoryId}`}>
                    工廠二
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    {selectedMachine || factoryData[0].machines[0]}
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
                        {factoryData.map((factory, index) => {
                          const matchingMachines = factory.machines.filter(machine => 
                            machine.toLowerCase().includes(searchValue.toLowerCase())
                          );
                          const factoryMatches = factory.name.toLowerCase().includes(searchValue.toLowerCase());
                          
                          if (!factoryMatches && matchingMachines.length === 0) {
                            return null;
                          }

                          return (
                            <CommandGroup key={index} heading={factory.name}>
                              {matchingMachines.map((machine, mIndex) => (
                                <CommandItem 
                                  key={`${index}-${mIndex}`} 
                                  value={`${factory.name}-${machine}`}
                                  onSelect={() => {
                                    // Handle selection here
                                    console.log(`Selected ${factory.name} - ${machine}`);
                                    setOpen(false);
                                    setSelectedMachine(`${machine}`);
                                  }}
                                >
                                  {machine}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          );
                        })}
                      </CommandList>
                    </Command>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* <BreadcrumbPage>Sample Server</BreadcrumbPage> */}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </>
  );
}

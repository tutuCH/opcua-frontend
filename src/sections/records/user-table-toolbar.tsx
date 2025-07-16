import React from 'react';
import { Trash2, Filter, Search } from 'lucide-react';

import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { Checkbox } from 'src/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';

interface UserTableToolbarProps {
  numSelected: number;
  filterName: string;
  onFilterName: (value: string) => void;
}

// ----------------------------------------------------------------------

export default function UserTableToolbar({ numSelected, filterName, onFilterName }: UserTableToolbarProps) {
  return (
    <div className={`h-18 flex items-center justify-between px-6 py-3 ${numSelected > 0 ? 'bg-blue-50 text-blue-700' : 'bg-white'}`}>
      {numSelected > 0 ? (
        <div className="text-sm font-medium">
          {numSelected} selected
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={filterName}
              onChange={(e) => onFilterName(e.target.value)}
              placeholder="Search user..."
              className="pl-10 w-64"
            />
          </div>
          
          <Select onValueChange={(value) => onFilterName(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">全部</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => onFilterName(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">全部</SelectItem>
              <SelectItem value="day">過去一日</SelectItem>
              <SelectItem value="week">過去一週</SelectItem>
              <SelectItem value="month">過去一個月</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => onFilterName(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Display columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">全部</SelectItem>
              <SelectItem value="machine">
                <div className="flex items-center space-x-2">
                  <Checkbox id="machine" />
                  <label htmlFor="machine" className="text-sm font-medium">
                    Machine
                  </label>
                </div>
              </SelectItem>
              <SelectItem value="temperature">
                <div className="flex items-center space-x-2">
                  <Checkbox id="temperature" />
                  <label htmlFor="temperature" className="text-sm font-medium">
                    Temperature
                  </label>
                </div>
              </SelectItem>
              <SelectItem value="rate">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rate" />
                  <label htmlFor="rate" className="text-sm font-medium">
                    Rate
                  </label>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <TooltipProvider>
        {numSelected > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filter list</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}

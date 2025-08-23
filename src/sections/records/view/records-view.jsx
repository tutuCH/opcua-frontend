import { useState } from 'react';

import Iconify from 'src/components/iconify';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';

import {
  // ColumnDef,
  // ColumnFiltersState,
  // SortingState,
  // VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Input } from 'src/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';

import { injectionMachine as data } from 'src/_mock/injectionMachine';

export const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'Timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      const date = new Date(row.getValue('Timestamp'));
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'MachineID',
    header: 'Machine ID',
    cell: ({ row }) => <div>{row.getValue('MachineID')}</div>,
  },
  {
    accessorKey: 'CycleTime(s)',
    header: () => <div className="text-right">Cycle Time (s)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('CycleTime(s)'));
      return <div className="text-right font-medium">{value.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'Temperature(C)',
    header: () => <div className="text-right">Temperature (°C)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Temperature(C)'));
      return <div className="text-right font-medium">{value.toFixed(1)}</div>;
    },
  },
  {
    accessorKey: 'Pressure(bar)',
    header: () => <div className="text-right">Pressure (bar)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Pressure(bar)'));
      return <div className="text-right font-medium">{value.toFixed(1)}</div>;
    },
  },
  {
    accessorKey: 'MaterialUsed(kg)',
    header: () => <div className="text-right">Material Used (kg)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('MaterialUsed(kg)'));
      return <div className="text-right font-medium">{value.toFixed(3)}</div>;
    },
  },
  {
    accessorKey: 'PartCount',
    header: () => <div className="text-right">Part Count</div>,
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('PartCount')}</div>,
  },
  {
    accessorKey: 'ErrorCode',
    header: 'Error Code',
    cell: ({ row }) => {
      const errorCode = row.getValue('ErrorCode');
      return (
        <div className={`${errorCode === 'None' ? 'text-green-600' : 'text-red-600'}`}>
          {errorCode}
        </div>
      );
    },
  },
  {
    accessorKey: 'Injection_Pressure(bar)',
    header: () => <div className="text-right">Injection Pressure (bar)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Injection_Pressure(bar)'));
      return <div className="text-right font-medium">{value.toFixed(1)}</div>;
    },
  },
  {
    accessorKey: 'Melt_Temperature(C)',
    header: () => <div className="text-right">Melt Temperature (°C)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Melt_Temperature(C)'));
      return <div className="text-right font-medium">{value.toFixed(1)}</div>;
    },
  },
  {
    accessorKey: 'Mold_Temperature(C)',
    header: () => <div className="text-right">Mold Temperature (°C)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Mold_Temperature(C)'));
      return <div className="text-right font-medium">{value.toFixed(1)}</div>;
    },
  },
  {
    accessorKey: 'Screw_RPM',
    header: () => <div className="text-right">Screw RPM</div>,
    cell: ({ row }) => <div className="text-right font-medium">{row.getValue('Screw_RPM')}</div>,
  },
  {
    accessorKey: 'Clamp_Force(kN)',
    header: () => <div className="text-right">Clamp Force (kN)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Clamp_Force(kN)'));
      return <div className="text-right font-medium">{value.toFixed(1)}</div>;
    },
  },
  {
    accessorKey: 'Cycle_Time(s)',
    header: () => <div className="text-right">Cycle Time (s)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Cycle_Time(s)'));
      return <div className="text-right font-medium">{value.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'Part_Weight(g)',
    header: () => <div className="text-right">Part Weight (g)</div>,
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('Part_Weight(g)'));
      return <div className="text-right font-medium">{value.toFixed(2)}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const machine = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Iconify icon="mdi:dots-vertical" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(machine.MachineID)}>
              Copy Machine ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>View History</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function RecordsPage() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by Machine ID..."
          value={table.getColumn('MachineID')?.getFilterValue() ?? ''}
          onChange={(event) => table.getColumn('MachineID')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <Iconify icon="mdi:chevron-down" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      id="terms"
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      checked={column.getIsVisible()}
                    />
                    <label
                      htmlFor="terms"
                      className="capitalize text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {column.id}
                    </label>
                  </div>
                ))}
          </PopoverContent>
        </Popover>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

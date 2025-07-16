import React from 'react';
import { TableRow, TableCell } from 'src/components/ui/table';

interface TableEmptyRowsProps {
  emptyRows: number;
  height?: number;
}

export default function TableEmptyRows({ emptyRows, height = 53 }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow style={{ height: height * emptyRows }}>
      <TableCell colSpan={9} />
    </TableRow>
  );
}

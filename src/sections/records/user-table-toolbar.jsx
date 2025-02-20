import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// ----------------------------------------------------------------------

export default function UserTableToolbar({ numSelected, filterName, onFilterName }) {
  return (
    <Toolbar
      sx={{
        height: 72,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        // <OutlinedInput
        //   value={filterName}
        //   onChange={onFilterName}
        //   placeholder="Search user..."
        //   startAdornment={
        //     <InputAdornment position="start">
        //       <Iconify
        //         icon="eva:search-fill"
        //         sx={{ color: 'text.disabled', width: 20, height: 20 }}
        //       />
        //     </InputAdornment>
        //   }
        // />
        <>
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
            <SelectTrigger className="w-[500px]">
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
            <SelectTrigger className="w-[400px]">
              <SelectValue placeholder="Display columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">全部</SelectItem>
              <SelectItem value="day">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Machine
                  </label>
                </div>
              </SelectItem>
              <SelectItem value="week">
                {' '}
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Temperature
                  </label>
                </div>
              </SelectItem>
              <SelectItem value="month">
                {' '}
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Rate
                  </label>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

UserTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

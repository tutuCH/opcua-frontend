import { alpha } from '@mui/material/styles';

export const style = {
  accountBorder: {
    borderStyle: 'dashed',
    p: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
  },

  accountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

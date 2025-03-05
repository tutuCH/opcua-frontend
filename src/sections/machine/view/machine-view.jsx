import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Machine from '../machine';

// ----------------------------------------------------------------------

export default function MachineView() {
  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">機台</Typography>

      </Stack>
      <Grid container spacing={3}>
        <Machine/>
      </Grid>      
    </Container>
  );
}

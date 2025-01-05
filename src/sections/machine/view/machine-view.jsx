import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import { posts } from 'src/_mock/blog';

import Factory from '../factory';
import PostSearch from '../post-search';


// ----------------------------------------------------------------------

export default function MachineView() {
  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">機台管理</Typography>

      </Stack>
{/* 
      <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
        <PostSearch posts={posts} />
        <PostSort
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </Stack> */}
      <Grid container spacing={3}>
        <Factory/>
      </Grid>      
    </Container>
  );
}

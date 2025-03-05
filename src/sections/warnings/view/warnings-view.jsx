import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import { demoWarnings } from '../demo-warning';
import WarningCard from '../components/warning-card';
import AdvancedDatePicker from '../components/advanced-date-picker';

export default function WarningsView() {
  const [warnings, setWarnings] = useState(demoWarnings);
  const [dateRange, setDateRange] = useState(null);

  // Filter warnings based on the selected date range
  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      // This is a placeholder for actual filtering logic
      // In a real app, you'd filter based on warning dates
      console.log('Date range selected:', dateRange);
      
      // For demo purposes, just using the original warnings
      // Replace this with actual filtering logic based on warning dates
      setWarnings(demoWarnings);
    } else {
      setWarnings(demoWarnings);
    }
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  return (
    <Container>
      {/* <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
      </Stack> */}
      <div className="flex justify-between mb-8">
        <Typography variant="h4">警告</Typography>
        <AdvancedDatePicker onRangeChange={handleDateRangeChange} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {warnings.map((warning) => (
          <WarningCard key={warning.id} warning={warning} />
        ))}  
      </div>
    </Container>
  );
}

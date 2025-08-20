import React from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PersonalInfoSection from '../sections/settings/personal-info-section';
import SubscriptionSection from '../sections/settings/subscription-section';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  color: 'rgba(0, 0, 0, 0.85)',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.palette.action.focus,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Helmet>
        <title>設定 | OPC UA Dashboard</title>
      </Helmet>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          設定
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <StyledTabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <StyledTab label="個人資訊" {...a11yProps(0)} />
              <StyledTab label="訂閱管理" {...a11yProps(1)} />
            </StyledTabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <PersonalInfoSection />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <SubscriptionSection />
          </TabPanel>
        </Paper>
      </Container>
    </>
  );
}
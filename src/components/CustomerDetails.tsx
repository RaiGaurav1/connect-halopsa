import React from 'react';
import {
  Paper, Typography, Box, Chip, Alert,
  Divider, IconButton, List, ListItem, ListItemText, Avatar,
  ListItemAvatar, TextField, InputAdornment, Button, Tabs, Tab,
  Badge, Skeleton, LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Customer } from '../types';
import EmptyStateIllustration from './EmptyStateIllustration';

interface CustomerDetailsProps {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  onManualLookup?: (phone: string) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ 
  customer, loading, error, onManualLookup 
}) => {
  const [tab, setTab] = React.useState(0);
  const [searchPhone, setSearchPhone] = React.useState('');

  const handleSearch = () => {
    if (searchPhone && onManualLookup) onManualLookup(searchPhone);
  };

  return (
    <Paper elevation={0} sx={{ 
      p: 0, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6">Customer Information</Typography>
        
        <Box>
          <IconButton size="small" color="inherit">
            <HistoryIcon />
          </IconButton>
          <IconButton size="small" color="inherit">
            <AssignmentIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ px: 2, py: 1.5 }}>
        <TextField
          placeholder="Search by phone number"
          fullWidth
          size="small"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <Button 
                size="small" 
                variant="contained"
                onClick={handleSearch}
                disabled={!searchPhone || loading || !onManualLookup}
              >
                Lookup
              </Button>
            )
          }}
        />
      </Box>
      
      {loading && (
        <Box sx={{ px: 2 }}>
          <LinearProgress />
          <Box sx={{ mt: 2 }}>
            <Skeleton animation="wave" height={40} />
            <Skeleton animation="wave" height={20} width="80%" />
            <Skeleton animation="wave" height={20} width="60%" />
            <Skeleton animation="wave" height={80} />
          </Box>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && !customer && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          flexGrow: 1,
          textAlign: 'center'
        }}>
          <EmptyStateIllustration sx={{ width: 180, height: 180, mb: 2, opacity: 0.8 }} />
          <Typography variant="h6" color="text.primary" gutterBottom>
            No active call
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 300, mb: 2 }}>
            Customer information will appear here when a call connects or when you perform a manual lookup.
          </Typography>
          <Button 
            startIcon={<PhoneIcon />}
            variant="outlined"
            size="small"
          >
            Start Test Call
          </Button>
        </Box>
      )}
      
      {customer && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: customer.priority === 'High' ? 'error.main' : 'primary.main',
                  width: 48,
                  height: 48,
                  mr: 2
                }}
              >
                {customer.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{customer.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={customer.status} 
                    size="small"
                    color={customer.status === 'Active' ? 'success' : 'default'}
                  />
                  <Chip 
                    label={customer.priority} 
                    size="small"
                    color={
                      customer.priority === 'High' ? 'error' : 
                      customer.priority === 'Normal' ? 'primary' : 'default'
                    }
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2">{customer.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2">{customer.company}</Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider />
          
          <Tabs 
            value={tab} 
            onChange={(_event, newValue) => setTab(newValue)}
            variant="fullWidth"
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Overview" />
            <Tab 
              label={
                <Badge badgeContent={3} color="primary">
                  Tickets
                </Badge>
              } 
            />
            <Tab label="History" />
          </Tabs>
          
          <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
            {tab === 0 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Detail label="Customer ID" value={customer.id} />
                  <Detail label="Account Type" value="Business" />
                  <Detail label="Last Contact" value="May 28, 2025" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button startIcon={<AddIcon />} variant="contained" color="primary" size="small">
                    New Ticket
                  </Button>
                  <Button variant="outlined" size="small">
                    View Profile
                  </Button>
                </Box>
              </>
            )}
            
            {tab === 1 && (
              <List disablePadding>
                <ListItem divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.light' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Network connectivity issues" 
                    secondary="Opened: June 1, 2025 • Priority: High"
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Software update request" 
                    secondary="Opened: May 28, 2025 • Priority: Normal"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Account configuration" 
                    secondary="Closed: May 15, 2025 • Priority: Normal"
                  />
                </ListItem>
              </List>
            )}
            
            {tab === 2 && (
              <List disablePadding>
                <ListItem divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Inbound Call - 4m 12s" 
                    secondary="June 1, 2025 at 10:23 AM • Agent: Sarah Johnson"
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Outbound Call - 2m 45s" 
                    secondary="May 28, 2025 at 3:45 PM • Agent: David Smith"
                  />
                </ListItem>
              </List>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

interface DetailProps {
  label: string;
  value: string;
}

const Detail: React.FC<DetailProps> = ({ label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

export default CustomerDetails;

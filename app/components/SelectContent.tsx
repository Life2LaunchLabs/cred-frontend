import MuiAvatar from '@mui/material/Avatar';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Select, { type SelectChangeEvent, selectClasses } from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Org admin',
  issuer: 'Badge issuer',
  viewer: 'Viewer',
};

export default function SelectContent() {
  const { orgs, activeOrg, selectOrg, isLoading } = useOrg();
  const navigate = useNavigate();

  const handleChange = (event: SelectChangeEvent) => {
    const orgId = event.target.value;
    selectOrg(orgId);
    const selected = orgs.find((m) => m.org.id === orgId);
    if (selected) {
      navigate(`/${selected.org.slug}`);
    }
  };

  if (isLoading) {
    return (
      <Typography variant="body2" sx={{ p: 1, color: 'text.secondary' }}>
        Loading...
      </Typography>
    );
  }

  return (
    <Select
      labelId="org-select"
      id="org-simple-select"
      value={activeOrg?.org.id ?? ''}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Select organization' }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        '&.MuiList-root': {
          p: '8px',
        },
        [`& .${selectClasses.select}`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          pl: 1,
        },
      }}
    >
      {orgs.map(({ org, membership }) => (
        <MenuItem key={org.id} value={org.id}>
          <ListItemAvatar>
            <Avatar alt={org.name}>
              <BusinessRoundedIcon sx={{ fontSize: '1rem' }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={org.name}
            secondary={ROLE_LABELS[membership.role] ?? membership.role}
          />
        </MenuItem>
      ))}
      <Divider sx={{ mx: -1 }} />
      <MenuItem value="__add_org__" onClick={() => { /* TODO: navigate to create org */ }}>
        <ListItemIcon>
          <AddRoundedIcon />
        </ListItemIcon>
        <ListItemText primary="Add Org" />
      </MenuItem>
    </Select>
  );
}

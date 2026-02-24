/**
 * Demo persona switcher — replaces the org selector in the sidebar during demos.
 * To restore the org selector post-demo, swap this back for SelectContent in SideMenu.tsx.
 */
import MuiAvatar from '@mui/material/Avatar';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Select, { type SelectChangeEvent, selectClasses } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { DEMO_PERSONAS } from '~/mocks/demo-personas';

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  color: (theme.vars || theme).palette.text.secondary,
  border: `1px solid ${(theme.vars || theme).palette.divider}`,
  fontSize: '0.7rem',
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function UserSelectContent() {
  const { user, switchUser } = useAuth();
  const navigate = useNavigate();

  const activePersonaId =
    DEMO_PERSONAS.find((p) => p.user.id === user?.id)?.id ?? DEMO_PERSONAS[0].id;

  const handleChange = (event: SelectChangeEvent) => {
    const personaId = event.target.value;
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (!persona) return;

    switchUser(persona.user, persona.token);

    if (persona.defaultOrgSlug) {
      navigate(`/${persona.defaultOrgSlug}`);
    } else {
      // Learner has no org — go to the landing page
      navigate('/');
    }
  };

  return (
    <Select
      labelId="user-select"
      id="user-simple-select"
      value={activePersonaId}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Select demo user' }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        '&.MuiList-root': { p: '8px' },
        [`& .${selectClasses.select}`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          pl: 1,
        },
      }}
    >
      {DEMO_PERSONAS.map((persona) => (
        <MenuItem key={persona.id} value={persona.id}>
          <ListItemAvatar>
            <Avatar
              alt={persona.user.name ?? persona.label}
              src={persona.user.profileImageUrl}
            >
              {getInitials(persona.user.name ?? persona.label)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={persona.label}
            secondary={
              <Typography
                component="span"
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block' }}
                noWrap
              >
                {persona.description}
              </Typography>
            }
          />
        </MenuItem>
      ))}
    </Select>
  );
}

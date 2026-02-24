import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import VerifiedIcon from '@mui/icons-material/Verified';
// import SelectContent from './SelectContent'; // Restore post-demo
import UserSelectContent from './UserSelectContent';
import MenuContent from './MenuContent';
import ContextualSidebarTree from './ContextualSidebarTree';
import OptionsMenu from './OptionsMenu';
import { useAuth } from '~/context/AuthContext';
import { useNavItems } from '~/hooks/useNavItems';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
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

export default function SideMenu() {
  const { user } = useAuth();
  const { primaryItems, secondaryItems } = useNavItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <SvgIcon sx={{ height: 28, width: 28, color: 'primary.main', flexShrink: 0 }}>
          <VerifiedIcon />
        </SvgIcon>
        <Typography
          variant="h6"
          sx={{
            ml: 1,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #4876EE 0%, #00D3AB 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          LaunchCRED
        </Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          p: 1.5,
        }}
      >
        <UserSelectContent />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent primaryItems={primaryItems} secondaryItems={secondaryItems}>
          <ContextualSidebarTree />
        </MenuContent>
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={user?.name ?? 'User'}
          src={user?.profileImageUrl}
          sx={{ width: 36, height: 36 }}
        >
          {user?.name ? getInitials(user.name) : null}
        </Avatar>
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            {user?.name ?? 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user?.email ?? ''}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}

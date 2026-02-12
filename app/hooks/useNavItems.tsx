import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { useOrgPath } from './useOrgPath';
import type { NavItem } from '~/components/MenuContent';

export function useNavItems() {
  const orgPath = useOrgPath();

  const primaryItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon />, path: orgPath(), exact: true },
    { id: 'learners', label: 'Learners', icon: <PeopleRoundedIcon />, path: orgPath('/learners') },
    { id: 'credentials', label: 'Credentials', icon: <BadgeRoundedIcon />, path: orgPath('/credentials') },
    { id: 'organization', label: 'Organization', icon: <BusinessRoundedIcon />, path: orgPath('/organization') },
  ];

  const secondaryItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: <SettingsRoundedIcon />, path: orgPath('/user/settings') },
    { id: 'about', label: 'About', icon: <InfoRoundedIcon />, path: orgPath('/about') },
    { id: 'feedback', label: 'Feedback', icon: <HelpRoundedIcon />, path: orgPath('/feedback') },
  ];

  return { primaryItems, secondaryItems };
}

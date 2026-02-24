import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import DrawRoundedIcon from '@mui/icons-material/DrawRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { useOrgPath } from './useOrgPath';
import { useOrg } from '~/context/OrgContext';
import type { NavItem } from '~/components/MenuContent';

export function useNavItems() {
  const orgPath = useOrgPath();
  const { activeOrg } = useOrg();

  const features = activeOrg?.org.features ?? [];
  const isCreator = features.includes('creator');
  const isIssuer = features.includes('issuer');

  const primaryItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon />, path: orgPath(), exact: true },
    ...(isIssuer ? [
      { id: 'learners', label: 'Learners', icon: <PeopleRoundedIcon />, path: orgPath('/learners') },
      {
        id: 'credentials',
        label: 'Credentials',
        icon: <BadgeRoundedIcon />,
        path: orgPath('/credentials'),
        subItems: [
          { id: 'credentials-overview', label: 'Overview', path: orgPath('/credentials') },
          { id: 'credentials-programs', label: 'Programs', path: orgPath('/credentials/programs') },
          { id: 'credentials-collections', label: 'Collections', path: orgPath('/credentials/collections') },
        ],
      },
    ] as NavItem[] : []),
    ...(isCreator ? [
      {
        id: 'creator',
        label: 'Creator Studio',
        icon: <DrawRoundedIcon />,
        path: orgPath('/creator'),
        subItems: [
          { id: 'creator-home', label: 'Overview', path: orgPath('/creator') },
          { id: 'creator-collections', label: 'Collections', path: orgPath('/creator/collections') },
          { id: 'creator-authorizations', label: 'Authorizations', path: orgPath('/creator/authorizations') },
          { id: 'creator-analytics', label: 'Analytics', path: orgPath('/creator/analytics') },
        ],
      },
    ] as NavItem[] : []),
    { id: 'organization', label: 'Organization', icon: <BusinessRoundedIcon />, path: orgPath('/organization') },
  ];

  const secondaryItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: <SettingsRoundedIcon />, path: orgPath('/user/settings') },
    { id: 'about', label: 'About', icon: <InfoRoundedIcon />, path: orgPath('/about') },
    { id: 'feedback', label: 'Feedback', icon: <HelpRoundedIcon />, path: orgPath('/feedback') },
  ];

  return { primaryItems, secondaryItems };
}

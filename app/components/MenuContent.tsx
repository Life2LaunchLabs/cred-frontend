import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { NavLink, useLocation } from 'react-router';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SidebarContext, { type SidebarContextValue } from '../context/SidebarContext';
import SidebarPageItem from './SidebarPageItem';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import ContextualSidebarTree from './ContextualSidebarTree';

export default function MenuContent() {
  const location = useLocation();
  const { isAdmin } = useOrg();
  const orgPath = useOrgPath();
  const [expandedItemIds, setExpandedItemIds] = React.useState<string[]>([]);

  const toggleExpanded = React.useCallback((id: string) => {
    setExpandedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const sidebarContextValue: SidebarContextValue = React.useMemo(
    () => ({ expandedItemIds, toggleExpanded }),
    [expandedItemIds, toggleExpanded]
  );

  // Auto-expand sections based on current path
  React.useEffect(() => {
    const path = location.pathname;
    const sectionsToExpand: string[] = [];

    if (path.includes('/badges')) {
      sectionsToExpand.push('badges');
    }
    if (path.includes('/users')) {
      sectionsToExpand.push('users');
    }
    if (path.includes('/organization')) {
      sectionsToExpand.push('organization');
    }

    if (sectionsToExpand.length > 0) {
      setExpandedItemIds((prev) => {
        const newIds = sectionsToExpand.filter((id) => !prev.includes(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });
    }
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === orgPath()) {
      return location.pathname === orgPath();
    }
    return location.pathname === path;
  };

  const isInSection = (basePath: string) => {
    return location.pathname.startsWith(basePath);
  };

  const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon />, path: orgPath('/user/settings') },
    { text: 'About', icon: <InfoRoundedIcon />, path: orgPath('/about') },
    { text: 'Feedback', icon: <HelpRoundedIcon />, path: orgPath('/feedback') },
  ];

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <Stack sx={{ flexGrow: 1, p: 1 }}>
        <List dense>
          {/* Home - no subitems */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={orgPath()}
              selected={isActive(orgPath())}
            >
              <ListItemIcon><HomeRoundedIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          {/* Badges with subitems */}
          <SidebarPageItem
            id="badges"
            title="Badges"
            icon={<BadgeRoundedIcon />}
            href={orgPath('/badges')}
            selected={isInSection(orgPath('/badges'))}
            nestedNavigation={
              <List dense sx={{ pl: 2 }}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to={orgPath('/badges')}
                    selected={isActive(orgPath('/badges'))}
                  >
                    <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
                    <ListItemText primary="Library" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to={orgPath('/badges/browse')}
                    selected={isActive(orgPath('/badges/browse'))}
                  >
                    <ListItemIcon><SearchIcon /></ListItemIcon>
                    <ListItemText primary="Browse" />
                  </ListItemButton>
                </ListItem>
                {isAdmin && (
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={NavLink}
                      to={orgPath('/badges/create')}
                      selected={isActive(orgPath('/badges/create'))}
                    >
                      <ListItemIcon><AddCircleOutlineIcon /></ListItemIcon>
                      <ListItemText primary="Create" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            }
          />

          {/* Users with subitems */}
          <SidebarPageItem
            id="users"
            title="Users"
            icon={<PeopleRoundedIcon />}
            href={orgPath('/users')}
            selected={isInSection(orgPath('/users'))}
            nestedNavigation={
              <List dense sx={{ pl: 2 }}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to={orgPath('/users')}
                    selected={isActive(orgPath('/users'))}
                  >
                    <ListItemIcon><GroupIcon /></ListItemIcon>
                    <ListItemText primary="All Users" />
                  </ListItemButton>
                </ListItem>
                {isAdmin && (
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={NavLink}
                      to={orgPath('/users/add')}
                      selected={isActive(orgPath('/users/add'))}
                    >
                      <ListItemIcon><PersonAddIcon /></ListItemIcon>
                      <ListItemText primary="Add New" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            }
          />

          {/* Organization with subitems */}
          <SidebarPageItem
            id="organization"
            title="Organization"
            icon={<BusinessRoundedIcon />}
            href={orgPath('/organization')}
            selected={isInSection(orgPath('/organization'))}
            nestedNavigation={
              <List dense sx={{ pl: 2 }}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to={orgPath('/organization')}
                    selected={isActive(orgPath('/organization'))}
                  >
                    <ListItemIcon><InfoOutlinedIcon /></ListItemIcon>
                    <ListItemText primary="Details" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to={orgPath('/organization/staff')}
                    selected={isActive(orgPath('/organization/staff'))}
                  >
                    <ListItemIcon><BadgeOutlinedIcon /></ListItemIcon>
                    <ListItemText primary="Staff" />
                  </ListItemButton>
                </ListItem>
                {isAdmin && (
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={NavLink}
                      to={orgPath('/organization/settings')}
                      selected={isActive(orgPath('/organization/settings'))}
                    >
                      <ListItemIcon><SettingsOutlinedIcon /></ListItemIcon>
                      <ListItemText primary="Settings" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            }
          />
        </List>

        <ContextualSidebarTree />

        <List dense sx={{ mt: 'auto' }}>
          {secondaryListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={isActive(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    </SidebarContext.Provider>
  );
}

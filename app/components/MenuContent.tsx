import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { NavLink, useLocation } from 'react-router';
import SidebarContext, { type SidebarContextValue } from '../context/SidebarContext';
import SidebarPageItem from './SidebarPageItem';

export type NavSubItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
};

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  exact?: boolean;
  subItems?: NavSubItem[];
};

export type MenuContentProps = {
  primaryItems: NavItem[];
  secondaryItems?: NavItem[];
  children?: React.ReactNode;
};

function isItemSelected(item: NavItem, pathname: string): boolean {
  if (pathname === item.path) return true;
  if (item.exact) return false;
  return pathname.startsWith(item.path + '/');
}

export default function MenuContent({
  primaryItems,
  secondaryItems = [],
  children,
}: MenuContentProps) {
  const location = useLocation();
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

  // Auto-expand sections with subItems based on current path
  React.useEffect(() => {
    const sectionsToExpand = primaryItems
      .filter((item) => item.subItems && item.subItems.length > 0 && isItemSelected(item, location.pathname))
      .map((item) => item.id);

    if (sectionsToExpand.length > 0) {
      setExpandedItemIds((prev) => {
        const newIds = sectionsToExpand.filter((id) => !prev.includes(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });
    }
  }, [location.pathname, primaryItems]);

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <Stack sx={{ flexGrow: 1, p: 1 }}>
        <List dense>
          {primaryItems.map((item) => {
            const selected = isItemSelected(item, location.pathname);

            if (item.subItems && item.subItems.length > 0) {
              return (
                <SidebarPageItem
                  key={item.id}
                  id={item.id}
                  title={item.label}
                  icon={item.icon}
                  href={item.path}
                  selected={selected}
                  nestedNavigation={
                    <List dense sx={{ pl: 2 }}>
                      {item.subItems.map((sub) => (
                        <ListItem key={sub.path} disablePadding sx={{ display: 'block' }}>
                          <ListItemButton
                            component={NavLink}
                            to={sub.path}
                            selected={location.pathname === sub.path}
                          >
                            <ListItemIcon>{sub.icon}</ListItemIcon>
                            <ListItemText primary={sub.label} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  }
                />
              );
            }

            return (
              <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  selected={selected}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {children}

        {secondaryItems.length > 0 && (
          <List dense sx={{ mt: 'auto' }}>
            {secondaryItems.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Stack>
    </SidebarContext.Provider>
  );
}

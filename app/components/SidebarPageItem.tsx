import * as React from 'react';
import { type Theme, type SxProps } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NavLink } from 'react-router';
import SidebarContext from '../context/SidebarContext';

export interface SidebarPageItemProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  href: string;
  selected?: boolean;
  disabled?: boolean;
  nestedNavigation?: React.ReactNode;
}

export default function SidebarPageItem({
  id,
  title,
  icon,
  href,
  selected = false,
  disabled = false,
  nestedNavigation,
}: SidebarPageItemProps) {
  const sidebarContext = React.useContext(SidebarContext);
  const expandedItemIds = sidebarContext?.expandedItemIds ?? [];
  const toggleExpanded = sidebarContext?.toggleExpanded;

  const expanded = expandedItemIds.includes(id);

  const handleClick = React.useCallback(() => {
    if (toggleExpanded && nestedNavigation) {
      toggleExpanded(id);
    }
  }, [toggleExpanded, id, nestedNavigation]);

  const expandIconSx: SxProps<Theme> = {
    ml: 0.5,
    fontSize: 20,
    transform: `rotate(${expanded ? 0 : -90}deg)`,
    transition: (theme: Theme) =>
      theme.transitions.create('transform', {
        easing: theme.transitions.easing.sharp,
        duration: 100,
      }),
  };

  return (
    <React.Fragment>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          selected={selected}
          disabled={disabled}
          {...(nestedNavigation
            ? { onClick: handleClick }
            : { component: NavLink, to: href })}
        >
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          <ListItemText primary={title} />
          {nestedNavigation && <ExpandMoreIcon sx={expandIconSx} />}
        </ListItemButton>
      </ListItem>
      {nestedNavigation && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {nestedNavigation}
        </Collapse>
      )}
    </React.Fragment>
  );
}

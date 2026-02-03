import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link } from 'react-router';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const routeLabels: Record<string, string> = {
  home: 'Home',
  badges: 'Badges',
  users: 'Users',
  organization: 'Organization',
  settings: 'Settings',
  about: 'About',
  feedback: 'Feedback',
};

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = routeLabels[segment] || segment;
        const isLast = index === pathSegments.length - 1;

        if (isLast) {
          return (
            <Typography
              key={path}
              variant="body1"
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              {label}
            </Typography>
          );
        }

        return (
          <Typography
            key={path}
            component={Link}
            to={path}
            variant="body1"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            {label}
          </Typography>
        );
      })}
    </StyledBreadcrumbs>
  );
}

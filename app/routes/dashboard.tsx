import { useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Outlet, useNavigate, useParams } from 'react-router';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import { useAuth } from '~/context/AuthContext';
import { OrgProvider, useOrg } from '~/context/OrgContext';

/** Syncs the :orgSlug URL param with OrgContext's active org. */
function OrgSlugSync() {
  const { orgSlug } = useParams();
  const { orgs, activeOrg, selectOrg, isLoading } = useOrg();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || orgs.length === 0) return;

    const match = orgs.find((m) => m.org.slug === orgSlug);

    if (match) {
      // URL slug matches an org — sync it as active if needed
      if (activeOrg?.org.id !== match.org.id) {
        selectOrg(match.org.id);
      }
    } else {
      // Invalid slug — redirect to the active org or first org
      const fallback = activeOrg ?? orgs[0];
      navigate(`/${fallback.org.slug}`, { replace: true });
    }
  }, [orgSlug, orgs, activeOrg, selectOrg, isLoading, navigate]);

  return null;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <OrgProvider>
    <OrgSlugSync />
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <AppNavbar />
      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: 'auto',
        })}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            mx: 3,
            pb: 5,
            mt: { xs: 8, md: 0 },
          }}
        >
          <Header />
          <Outlet />
        </Stack>
      </Box>
    </Box>
    </OrgProvider>
  );
}

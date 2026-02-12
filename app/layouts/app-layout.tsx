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

  console.log('[OrgSlugSync] orgSlug:', orgSlug, 'isLoading:', isLoading, 'orgs.length:', orgs.length, 'activeOrg:', activeOrg?.org.slug);

  useEffect(() => {
    console.log('[OrgSlugSync] Effect - checking sync');
    if (isLoading || orgs.length === 0) {
      console.log('[OrgSlugSync] Skipping - still loading or no orgs');
      return;
    }

    const match = orgs.find((m) => m.org.slug === orgSlug);

    if (match) {
      console.log('[OrgSlugSync] Found match:', match.org.slug);
      // URL slug matches an org — sync it as active if needed
      if (activeOrg?.org.id !== match.org.id) {
        console.log('[OrgSlugSync] Selecting org:', match.org.id);
        selectOrg(match.org.id);
      }
    } else {
      console.log('[OrgSlugSync] ⚠️  No match for slug:', orgSlug, '- redirecting!');
      // Invalid slug — redirect to the active org or first org
      const fallback = activeOrg ?? orgs[0];
      console.log('[OrgSlugSync] Redirecting to:', fallback.org.slug);
      navigate(`/${fallback.org.slug}`, { replace: true });
    }
  }, [orgSlug, orgs, activeOrg, selectOrg, isLoading, navigate]);

  return null;
}

export default function AppLayout() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  console.log('[AppLayout] Render - isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    console.log('[AppLayout] Mount/Auth check - isAuthLoading:', isAuthLoading, 'isAuthenticated:', isAuthenticated);
    // Only redirect if we're done loading and still not authenticated
    if (!isAuthLoading && !isAuthenticated) {
      console.log('[AppLayout] ⚠️  Redirecting to signin');
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Show nothing while loading auth state or if not authenticated
  if (isAuthLoading || !isAuthenticated) {
    console.log('[AppLayout] ⏸️  Returning null - not ready');
    return null;
  }

  console.log('[AppLayout] ✅ Rendering authenticated layout');

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

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';
import UsersGrid from '~/components/placeholder/UsersGrid';
import CohortCarousel from '~/components/CohortCarousel';
import { useOrg } from '~/context/OrgContext';
import { useAuth } from '~/context/AuthContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { listCohorts } from '~/api/generated';
import type { Cohort } from '~/api/generated';

export default function Users() {
  console.log('[Learners] Component rendering');
  const { activeOrg, isAdmin } = useOrg();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [cohorts, setCohorts] = React.useState<Cohort[]>([]);
  const [isLoadingCohorts, setIsLoadingCohorts] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(false);

  console.log('[Learners] activeOrg:', activeOrg?.org.slug, 'user:', user?.email, 'orgPath:', orgPath('/learners'));

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!activeOrg || !user) return;
    let cancelled = false;

    async function fetchCohorts() {
      setIsLoadingCohorts(true);
      const params: { status?: string; staffId?: string } = {
        status: 'active',
      };

      // Non-admins only see cohorts they're assigned to
      if (!isAdmin && activeOrg!.membership.id) {
        params.staffId = activeOrg!.membership.id;
      }

      const res = await listCohorts(activeOrg!.org.id, params);
      if (!cancelled && res.status === 200) {
        setCohorts(res.data.data);
      }
      if (!cancelled) setIsLoadingCohorts(false);
    }

    fetchCohorts();
    return () => { cancelled = true; };
  }, [activeOrg, isAdmin, user]);

  const handleCohortClick = (cohort: Cohort) => {
    navigate(orgPath(`/learners/cohorts/${cohort.slug}`));
  };

  const handleSeeAllCohorts = () => {
    navigate(orgPath('/learners/cohorts'));
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Learners
      </Typography>

      <Stack spacing={3}>
        {isMounted && (
          <CohortCarousel
            title="Cohorts"
            cohorts={cohorts}
            isLoading={isLoadingCohorts}
            onCardClick={handleCohortClick}
            onSeeAll={handleSeeAllCohorts}
          />
        )}
        <UsersGrid />
      </Stack>
    </Box>
  );
}

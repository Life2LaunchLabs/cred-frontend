import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router';
import { CohortCard } from '~/components/CohortCard';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { listCohorts } from '~/api/generated';
import type { Cohort } from '~/api/generated';

export default function Cohorts() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [allCohorts, setAllCohorts] = React.useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchCohorts() {
      setIsLoading(true);
      const res = await listCohorts(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setAllCohorts(res.data.data);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchCohorts();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const handleCohortClick = (cohort: Cohort) => {
    navigate(orgPath(`/learners/cohorts/${cohort.slug}`));
  };

  const activeCohorts = allCohorts.filter((c) => c.status === 'active');
  const draftCohorts = allCohorts.filter((c) => c.status === 'draft');
  const archivedCohorts = allCohorts.filter((c) => c.status === 'archived');

  const renderCohortGrid = (cohorts: Cohort[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Box
                sx={{
                  width: '100%',
                  height: 168,
                  borderRadius: 2,
                  bgcolor: 'grey.200',
                }}
              />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (cohorts.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {cohorts.map((cohort) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cohort.id}>
            <CohortCard cohort={cohort} onClick={handleCohortClick} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        All Cohorts
      </Typography>

      <Stack spacing={4}>
        {/* Active Cohorts */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Active Cohorts
          </Typography>
          {renderCohortGrid(activeCohorts, 'No active cohorts')}
        </Box>

        {/* Draft Cohorts */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Draft Cohorts
          </Typography>
          {renderCohortGrid(draftCohorts, 'No draft cohorts')}
        </Box>

        {/* Archived Cohorts */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Archived Cohorts
          </Typography>
          {renderCohortGrid(archivedCohorts, 'No archived cohorts')}
        </Box>
      </Stack>
    </Box>
  );
}

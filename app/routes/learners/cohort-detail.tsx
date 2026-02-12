import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useParams } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { getCohort } from '~/api/generated';
import type { CohortDetail } from '~/api/generated';

export default function CohortDetailPage() {
  const { cohortSlug } = useParams();
  const { activeOrg } = useOrg();
  const [cohortDetail, setCohortDetail] = React.useState<CohortDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg || !cohortSlug) return;
    let cancelled = false;

    async function fetchCohort() {
      try {
        setIsLoading(true);
        const res = await getCohort(activeOrg!.org.id, cohortSlug);
        if (!cancelled && res.status === 200) {
          setCohortDetail(res.data);
        }
      } catch (error) {
        console.error('Error fetching cohort:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchCohort();
    return () => { cancelled = true; };
  }, [activeOrg, cohortSlug]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!cohortDetail) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Typography variant="body2" color="text.secondary">
          Cohort not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Cohort Header */}
      <Box sx={{ mb: 3 }}>
        {cohortDetail.coverImageUrl && (
          <Box
            component="img"
            src={cohortDetail.coverImageUrl}
            alt={cohortDetail.name}
            sx={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 2,
            }}
          />
        )}
        <Typography component="h2" variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {cohortDetail.name}
        </Typography>
        {cohortDetail.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {cohortDetail.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {cohortDetail.learners?.length ?? 0} {cohortDetail.learners?.length === 1 ? 'learner' : 'learners'}
        </Typography>
      </Box>

      {/* Learners Table */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Learners
      </Typography>

      {!cohortDetail.learners || cohortDetail.learners.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No learners in this cohort yet
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cohortDetail.learners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell>{learner.name}</TableCell>
                  <TableCell>{learner.email ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

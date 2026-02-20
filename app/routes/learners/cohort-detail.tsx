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
import MuiLink from '@mui/material/Link';
import { useParams, useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { getCohort, listCohortProgramAssignments, listLearnerProgramAssignments } from '~/api/generated';
import type { CohortDetail, Program, ProgramProgress, ProgramDetail } from '~/api/generated';
import ProgramCarousel from '~/components/ProgramCarousel';

export default function CohortDetailPage() {
  const { cohortSlug } = useParams();
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [cohortDetail, setCohortDetail] = React.useState<CohortDetail | null>(null);
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [learnerProgress, setLearnerProgress] = React.useState<Map<string, Map<string, ProgramProgress>>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg || !cohortSlug) return;
    let cancelled = false;

    async function fetchAll() {
      try {
        setIsLoading(true);

        // Fetch cohort
        const cohortRes = await getCohort(activeOrg!.org.id, cohortSlug!);
        if (cancelled || cohortRes.status !== 200) return;
        const cohort = cohortRes.data;
        if (!cancelled) setCohortDetail(cohort);

        // Fetch cohort program assignments (use real cohort ID, not slug)
        const programsRes = await listCohortProgramAssignments(activeOrg!.org.id, cohort.id);
        if (cancelled || programsRes.status !== 200) return;
        const assignedPrograms: Program[] = (programsRes.data as { data: { program?: ProgramDetail }[] }).data
          .map((a) => a.program)
          .filter((p): p is ProgramDetail => p !== undefined);
        if (!cancelled) setPrograms(assignedPrograms);

        // Fetch per-learner progress in parallel
        const learners = cohort.learners ?? [];
        if (learners.length > 0 && assignedPrograms.length > 0) {
          const progressResults = await Promise.all(
            learners.map((l) => listLearnerProgramAssignments(activeOrg!.org.id, l.id))
          );
          if (!cancelled) {
            const map = new Map<string, Map<string, ProgramProgress>>();
            learners.forEach((l, i) => {
              const lmap = new Map<string, ProgramProgress>();
              const result = progressResults[i];
              if (result.status === 200) {
                const assignments = (result.data as { data: { programId: string; progress?: ProgramProgress }[] }).data;
                assignments.forEach((a) => {
                  if (a.progress) lmap.set(a.programId, a.progress);
                });
              }
              map.set(l.id, lmap);
            });
            setLearnerProgress(map);
          }
        }
      } catch (error) {
        console.error('Error fetching cohort data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
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

      {/* Program Carousel */}
      {programs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ProgramCarousel
            title="Programs"
            programs={programs}
            onCardClick={(p) => navigate(orgPath('/credentials/programs/' + p.slug))}
          />
        </Box>
      )}

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
                {programs.map((p) => (
                  <TableCell key={p.id}>{p.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cohortDetail.learners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell>
                    <MuiLink
                      component="button"
                      variant="body2"
                      onClick={() => navigate(orgPath('/learners/' + (learner.slug ?? learner.id)))}
                      sx={{ textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {learner.name}
                    </MuiLink>
                  </TableCell>
                  <TableCell>{learner.email ?? '—'}</TableCell>
                  {programs.map((p) => {
                    const progress = learnerProgress.get(learner.id)?.get(p.id);
                    return (
                      <TableCell key={p.id}>
                        {progress ? (
                          <Typography variant="caption" color="text.secondary" component="span">
                            {progress.checkpointsSigned}/{progress.checkpointsTotal} ckpts
                            {' · '}
                            {progress.badgesEarned}/{progress.badgesTotal} badges
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled" component="span">—</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

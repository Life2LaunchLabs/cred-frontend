import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router';
import { ProgramCard } from '~/components/ProgramCard';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { listPrograms } from '~/api/generated';
import type { Program } from '~/api/generated';

export default function Programs() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [allPrograms, setAllPrograms] = React.useState<Program[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchPrograms() {
      setIsLoading(true);
      const res = await listPrograms(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setAllPrograms(res.data.data);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchPrograms();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const handleProgramClick = (program: Program) => {
    navigate(orgPath(`/credentials/programs/${program.slug}`));
  };

  const activePrograms = allPrograms.filter((p) => p.status === 'active');
  const draftPrograms = allPrograms.filter((p) => p.status === 'draft');
  const archivedPrograms = allPrograms.filter((p) => p.status === 'archived');

  const renderProgramGrid = (programs: Program[], emptyMessage: string) => {
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

    if (programs.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {programs.map((program) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={program.id}>
            <ProgramCard program={program} onClick={handleProgramClick} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        All Programs
      </Typography>

      <Stack spacing={4}>
        {/* Active Programs */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Active Programs
          </Typography>
          {renderProgramGrid(activePrograms, 'No active programs')}
        </Box>

        {/* Draft Programs */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Draft Programs
          </Typography>
          {renderProgramGrid(draftPrograms, 'No draft programs')}
        </Box>

        {/* Archived Programs */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Archived Programs
          </Typography>
          {renderProgramGrid(archivedPrograms, 'No archived programs')}
        </Box>
      </Stack>
    </Box>
  );
}

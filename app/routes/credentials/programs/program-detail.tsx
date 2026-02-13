import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useParams, useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { getProgram } from '~/api/generated';
import type { ProgramDetail } from '~/api/generated';
import { PhaseSection } from '~/components/PhaseSection';

export default function ProgramDetailPage() {
  const { programSlug } = useParams();
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [programDetail, setProgramDetail] = React.useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeOrg || !programSlug) return;
    let cancelled = false;

    async function fetchProgram() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getProgram(activeOrg!.org.id, programSlug);
        if (!cancelled) {
          if (res.status === 200) {
            setProgramDetail(res.data);
          } else {
            setError('Program not found');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load program');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProgram();
    return () => { cancelled = true; };
  }, [activeOrg, programSlug]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error || !programDetail) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/credentials/programs'))}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Programs
        </Button>
        <Typography variant="body2" color="text.secondary">
          {error || 'Program not found'}
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate(orgPath('/credentials/programs'))}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back to Programs
      </Button>

      {/* Program Header */}
      <Box sx={{ mb: 3 }}>
        {programDetail.imageUrl && (
          <Box
            component="img"
            src={programDetail.imageUrl}
            alt={programDetail.name}
            sx={{
              width: '100%',
              maxHeight: 300,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 2,
            }}
          />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 600 }}>
            {programDetail.name}
          </Typography>
          <Chip
            label={programDetail.status}
            color={getStatusColor(programDetail.status)}
            size="small"
          />
        </Box>

        {programDetail.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {programDetail.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {programDetail.phaseCount ?? 0} {programDetail.phaseCount === 1 ? 'phase' : 'phases'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {programDetail.totalBadgeCount ?? 0} {programDetail.totalBadgeCount === 1 ? 'badge' : 'badges'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {programDetail.totalCheckpointCount ?? 0} {programDetail.totalCheckpointCount === 1 ? 'checkpoint' : 'checkpoints'}
          </Typography>
        </Box>
      </Box>

      {/* Phases */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Program Phases
      </Typography>

      <Stack spacing={2}>
        {programDetail.phases && programDetail.phases.length > 0 ? (
          programDetail.phases.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              onBadgeClick={(badgeId) => console.log('Badge clicked:', badgeId)}
              onCheckpointClick={(checkpointId) => console.log('Checkpoint clicked:', checkpointId)}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No phases defined yet
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

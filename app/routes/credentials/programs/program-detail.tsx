import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useParams, useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { getProgram, updateProgram } from '~/api/generated';
import type { ProgramDetail } from '~/api/generated';
import { PhaseSection } from '~/components/PhaseSection';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success',
  draft: 'warning',
  archived: 'default',
};

export default function ProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [programDetail, setProgramDetail] = React.useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isArchiving, setIsArchiving] = React.useState(false);

  React.useEffect(() => {
    if (!activeOrg || !programId) return;
    let cancelled = false;

    async function fetchProgram() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getProgram(activeOrg!.org.id, programId!);
        if (!cancelled) {
          if (res.status === 200) {
            setProgramDetail(res.data);
          } else {
            setError('Program not found');
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load program'); setIsLoading(false); }
      }
    }

    fetchProgram();
    return () => { cancelled = true; };
  }, [activeOrg, programId]);

  async function handleToggleArchive() {
    if (!activeOrg || !programDetail) return;
    const newStatus = programDetail.status === 'archived' ? 'active' : 'archived';
    setIsArchiving(true);
    try {
      const res = await updateProgram(activeOrg.org.id, programDetail.slug, { status: newStatus });
      if (res.status === 200) {
        setProgramDetail((prev) => prev ? { ...prev, status: res.data.status } : prev);
      }
    } finally {
      setIsArchiving(false);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 820, p: 3 }}>
        <Skeleton width="50%" height={32} />
        <Skeleton width="80%" height={18} sx={{ mt: 1 }} />
        {[1, 2].map((i) => <Skeleton key={i} height={120} sx={{ mt: 2, borderRadius: 1 }} />)}
      </Box>
    );
  }

  if (error || !programDetail) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error ?? 'Program not found'}</Typography>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(orgPath('/credentials/programs'))}>
          Back to Programs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 820, pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 0.5 }}>
        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>{programDetail.name}</Typography>
        {programDetail.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {programDetail.description}
          </Typography>
        )}
      </Box>

      {/* Back + chips + admin edit */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, mb: 2 }} flexWrap="wrap">
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/credentials/programs'))}
          sx={{ textTransform: 'none' }}
        >
          Programs
        </Button>
        <Chip
          label={programDetail.status.charAt(0).toUpperCase() + programDetail.status.slice(1)}
          size="small"
          color={STATUS_COLOR[programDetail.status] ?? 'default'}
          variant="outlined"
        />
        {programDetail.phaseCount != null && (
          <Chip
            label={`${programDetail.phaseCount} ${programDetail.phaseCount === 1 ? 'phase' : 'phases'}`}
            size="small"
            variant="outlined"
          />
        )}
        {programDetail.totalBadgeCount != null && (
          <Chip
            label={`${programDetail.totalBadgeCount} ${programDetail.totalBadgeCount === 1 ? 'badge' : 'badges'}`}
            size="small"
            variant="outlined"
          />
        )}
        {isAdmin && (
          <Button
            size="small"
            startIcon={<EditRoundedIcon />}
            onClick={() => navigate(orgPath(`/credentials/programs/${programId}/edit`))}
            sx={{ ml: 'auto', textTransform: 'none' }}
          >
            Edit
          </Button>
        )}
      </Stack>

      {/* Phases */}
      {(programDetail.phases?.length ?? 0) > 0 ? (
        <Stack gap={2}>
          {programDetail.phases!.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              onBadgeClick={(badgeId, collectionId) =>
                navigate(orgPath(`/credentials/catalog/badges/${badgeId}?from=${collectionId}`))
              }
              onCheckpointClick={() => {}}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">No phases defined yet.</Typography>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <>
          <Divider sx={{ mt: 3 }} />
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Admin controls</Typography>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                size="small"
                color={programDetail.status === 'archived' ? 'primary' : 'warning'}
                disabled={isArchiving}
                onClick={handleToggleArchive}
                sx={{ textTransform: 'none' }}
              >
                {programDetail.status === 'archived' ? 'Unarchive program' : 'Archive program'}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

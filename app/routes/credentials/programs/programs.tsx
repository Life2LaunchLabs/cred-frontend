import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate } from 'react-router';
import { listPrograms } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Program } from '~/api/generated';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success',
  draft: 'warning',
  archived: 'default',
};

function ProgramRow({ program, onClick }: { program: Program; onClick: () => void }) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{program.name}</Typography>
        {program.description && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {program.description}
          </Typography>
        )}
      </Box>
      <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
        {program.totalBadgeCount != null && (
          <Typography variant="caption" color="text.secondary">
            {program.totalBadgeCount} {program.totalBadgeCount === 1 ? 'badge' : 'badges'}
          </Typography>
        )}
        <Chip
          label={program.status.charAt(0).toUpperCase() + program.status.slice(1)}
          size="small"
          color={STATUS_COLOR[program.status] ?? 'default'}
          variant="outlined"
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Stack>
    </Paper>
  );
}

export default function Programs() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [allPrograms, setAllPrograms] = React.useState<Program[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refetchKey, setRefetchKey] = React.useState(0);
  const [isAddingDemo, setIsAddingDemo] = React.useState(false);
  const demoRestoredRef = React.useRef(false);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchPrograms() {
      setIsLoading(true);
      if (!demoRestoredRef.current) {
        demoRestoredRef.current = true;
        const demoKey = `demo:prg_6:${activeOrg!.org.id}`;
        if (localStorage.getItem(demoKey)) {
          await fetch(`/orgs/${activeOrg!.org.id}/programs/demo`, { method: 'POST' });
        }
      }
      const res = await listPrograms(activeOrg!.org.id);
      if (!cancelled) {
        if (res.status === 200) setAllPrograms(res.data.data);
        setIsLoading(false);
      }
    }

    fetchPrograms();
    return () => { cancelled = true; };
  }, [activeOrg, refetchKey]);

  const activePrograms = allPrograms.filter((p) => p.status === 'active');
  const draftPrograms = allPrograms.filter((p) => p.status === 'draft');
  const archivedPrograms = allPrograms.filter((p) => p.status === 'archived');

  function handleProgramClick(program: Program) {
    navigate(orgPath(`/credentials/programs/${program.id}`));
  }

  function renderSection(programs: Program[], emptyMessage: string, showDemoButton = false) {
    if (isLoading) {
      return (
        <Stack gap={1}>
          {[1, 2].map((i) => <Skeleton key={i} height={56} sx={{ borderRadius: 1 }} />)}
        </Stack>
      );
    }
    if (programs.length === 0) {
      return (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            {emptyMessage}
          </Typography>
          {showDemoButton && isAdmin && (
            <Button
              variant="outlined"
              size="small"
              disabled={isAddingDemo}
              sx={{ mt: 0.5, textTransform: 'none' }}
              onClick={async () => {
                setIsAddingDemo(true);
                await fetch(`/orgs/${activeOrg!.org.id}/programs/demo`, { method: 'POST' });
                localStorage.setItem(`demo:prg_6:${activeOrg!.org.id}`, '1');
                setIsAddingDemo(false);
                setRefetchKey((k) => k + 1);
              }}
            >
              {isAddingDemo ? 'Adding…' : 'Load demo program'}
            </Button>
          )}
        </Box>
      );
    }
    return (
      <Stack gap={1}>
        {programs.map((p) => (
          <ProgramRow key={p.id} program={p} onClick={() => handleProgramClick(p)} />
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 820, pb: 4 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }} gap={2}>
        <Box>
          <Typography component="h2" variant="h6">Programs</Typography>
          <Typography variant="body2" color="text.secondary">
            Structured credential pathways for your learners
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate(orgPath('/credentials/programs/new'))}
            sx={{ textTransform: 'none', flexShrink: 0 }}
          >
            New program
          </Button>
        )}
      </Stack>

      <Stack gap={3}>
        {/* Active */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Active
          </Typography>
          {renderSection(activePrograms, 'No active programs.', true)}
        </Box>

        {/* Draft — admin only */}
        {(isAdmin || draftPrograms.length > 0) && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                Draft
              </Typography>
              {renderSection(draftPrograms, 'No draft programs.')}
            </Box>
          </>
        )}

        {/* Archived — admin only */}
        {(isAdmin || archivedPrograms.length > 0) && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                Archived
              </Typography>
              {renderSection(archivedPrograms, 'No archived programs.')}
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}

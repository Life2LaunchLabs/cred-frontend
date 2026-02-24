import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate, useParams } from 'react-router';
import { getProgram, updateProgram } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { ProgramDetail } from '~/api/generated';

export default function ProgramEdit() {
  const { programId } = useParams<{ programId: string }>();
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [program, setProgram] = React.useState<ProgramDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'active' | 'archived'>('draft');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (activeOrg && !isAdmin) {
      navigate(orgPath(`/credentials/programs/${programId}`), { replace: true });
    }
  }, [activeOrg, isAdmin, navigate, orgPath, programId]);

  React.useEffect(() => {
    if (!activeOrg || !programId) return;
    let cancelled = false;

    async function fetchProgram() {
      setIsLoading(true);
      try {
        const res = await getProgram(activeOrg!.org.id, programId!);
        if (!cancelled && res.status === 200) {
          setProgram(res.data);
          setName(res.data.name);
          setDescription(res.data.description ?? '');
          setStatus(res.data.status as 'draft' | 'active' | 'archived');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProgram();
    return () => { cancelled = true; };
  }, [activeOrg, programId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg || !program || !name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await updateProgram(activeOrg.org.id, program.slug, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      });
      if (res.status === 200) {
        navigate(orgPath(`/credentials/programs/${programId}`));
      } else {
        setError('Failed to save changes. Please try again.');
      }
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, p: 3 }}>
        <Skeleton width="40%" height={28} sx={{ mb: 3 }} />
        <Skeleton height={56} sx={{ mb: 2 }} />
        <Skeleton height={100} sx={{ mb: 2 }} />
        <Skeleton height={56} />
      </Box>
    );
  }

  if (!program) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Program not found</Typography>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(orgPath('/credentials/programs'))}>
          Back to Programs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, pb: 4 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath(`/credentials/programs/${programId}`))}
          sx={{ textTransform: 'none' }}
        >
          {program.name}
        </Button>
      </Stack>

      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>Edit program</Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack gap={2.5}>
            <TextField
              label="Program name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              inputProps={{ maxLength: 255 }}
            />

            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              inputProps={{ maxLength: 2000 }}
            />

            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'archived')}
              fullWidth
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>

            {error && (
              <Typography variant="body2" color="error">{error}</Typography>
            )}

            <Stack direction="row" gap={1} justifyContent="flex-end">
              <Button
                onClick={() => navigate(orgPath(`/credentials/programs/${programId}`))}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !name.trim()}
                sx={{ textTransform: 'none' }}
              >
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

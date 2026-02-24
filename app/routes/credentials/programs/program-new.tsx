import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router';
import { createProgram } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';

export default function ProgramNew() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'active'>('draft');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Redirect non-admins
  React.useEffect(() => {
    if (activeOrg && !isAdmin) {
      navigate(orgPath('/credentials/programs'), { replace: true });
    }
  }, [activeOrg, isAdmin, navigate, orgPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg || !name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createProgram(activeOrg.org.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      });
      if (res.status === 201) {
        navigate(orgPath(`/credentials/programs/${res.data.id}`));
      } else {
        setError('Failed to create program. Please try again.');
      }
    } catch {
      setError('Failed to create program. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, pb: 4 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/credentials/programs'))}
          sx={{ textTransform: 'none' }}
        >
          Programs
        </Button>
      </Stack>

      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>New program</Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack gap={2.5}>
            <TextField
              label="Program name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
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
              label="Initial status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
              fullWidth
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
            </TextField>

            {error && (
              <Typography variant="body2" color="error">{error}</Typography>
            )}

            <Stack direction="row" gap={1} justifyContent="flex-end">
              <Button
                onClick={() => navigate(orgPath('/credentials/programs'))}
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
                {isSubmitting ? 'Creating…' : 'Create program'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

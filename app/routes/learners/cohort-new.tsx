import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';

export default function CohortNew() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'active'>('draft');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isAdmin) {
    return (
      <Box sx={{ width: '100%', maxWidth: 640 }}>
        <Typography color="text.secondary">You do not have permission to create cohorts.</Typography>
      </Box>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg || !name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/orgs/${activeOrg.org.id}/cohorts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, status }),
      });
      if (res.ok) {
        navigate(orgPath('/learners?tab=cohorts'));
      } else {
        setError('Failed to create cohort. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 640 }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate(orgPath('/learners?tab=cohorts'))}
        sx={{ mb: 2, textTransform: 'none' }}
        size="small"
      >
        Back to Learners
      </Button>

      <Typography component="h2" variant="h6" sx={{ mb: 0.5 }}>
        New Cohort
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cohorts group learners together for program delivery and progress tracking.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              size="small"
              placeholder="e.g. Spring 2026 Cohort"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              minRows={3}
              placeholder="Optional description for this cohort"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Typography color="error" variant="body2">{error}</Typography>
            )}

            <Stack direction="row" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate(orgPath('/learners?tab=cohorts'))}
                sx={{ textTransform: 'none' }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!name.trim() || isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                {isSubmitting ? 'Creating…' : 'Create Cohort'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

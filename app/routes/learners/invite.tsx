import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import { useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';

// Placeholder sent-invite data
const PLACEHOLDER_INVITES = [
  { id: 'inv_1', email: 'alex.chen@example.com', sentAt: '2026-02-10T14:00:00Z', status: 'pending' },
  { id: 'inv_2', email: 'priya.nair@example.com', sentAt: '2026-02-12T09:30:00Z', status: 'accepted' },
  { id: 'inv_3', email: 'marco.rossi@example.com', sentAt: '2026-02-14T16:45:00Z', status: 'pending' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InviteLearner() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [emailInput, setEmailInput] = React.useState('');
  const [emails, setEmails] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isAdmin) {
    return (
      <Box sx={{ width: '100%', maxWidth: 640 }}>
        <Typography color="text.secondary">You do not have permission to invite learners.</Typography>
      </Box>
    );
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  }

  function addEmail() {
    const trimmed = emailInput.trim().replace(/,$/, '');
    if (trimmed && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
    }
    setEmailInput('');
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allEmails = [...emails];
    if (emailInput.trim()) allEmails.push(emailInput.trim());
    if (!activeOrg || allEmails.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/orgs/${activeOrg.org.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: allEmails, message: message.trim() || undefined }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmails([]);
        setEmailInput('');
        setMessage('');
      } else {
        setError('Failed to send invites. Please try again.');
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
        onClick={() => navigate(orgPath('/learners?tab=learners'))}
        sx={{ mb: 2, textTransform: 'none' }}
        size="small"
      >
        Back to Learners
      </Button>

      <Typography component="h2" variant="h6" sx={{ mb: 0.5 }}>
        Invite Learners
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Send email invitations to learners to join this organization.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {/* Email chips input */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Email addresses — press Enter or comma to add multiple
              </Typography>
              {emails.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                  {emails.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      size="small"
                      onDelete={() => removeEmail(email)}
                    />
                  ))}
                </Stack>
              )}
              <TextField
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                onBlur={addEmail}
                placeholder="learner@example.com"
                fullWidth
                size="small"
                type="email"
              />
            </Box>

            <TextField
              label="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              size="small"
              multiline
              minRows={3}
              placeholder="Add a personal message to the invitation email"
            />

            {submitted && (
              <Typography variant="body2" color="success.main">
                Invites sent successfully.
              </Typography>
            )}
            {error && (
              <Typography color="error" variant="body2">{error}</Typography>
            )}

            <Stack direction="row" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendRoundedIcon />}
                disabled={(emails.length === 0 && !emailInput.trim()) || isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                {isSubmitting ? 'Sending…' : 'Send Invites'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Sent invites */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Sent Invites
      </Typography>
      <Paper variant="outlined">
        {PLACEHOLDER_INVITES.map((inv, i) => (
          <React.Fragment key={inv.id}>
            {i > 0 && <Divider />}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <ScheduleSendRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">{inv.email}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Typography variant="caption" color="text.secondary">{formatDate(inv.sentAt)}</Typography>
                <Chip
                  label={inv.status === 'accepted' ? 'Accepted' : 'Pending'}
                  size="small"
                  color={inv.status === 'accepted' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
            </Stack>
          </React.Fragment>
        ))}
      </Paper>
    </Box>
  );
}

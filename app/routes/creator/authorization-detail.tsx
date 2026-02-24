import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate, useParams } from 'react-router';
import { getIssueAuthorization, approveIssueAuthorization, rejectIssueAuthorization } from '~/api/generated';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { IssueAuthorizationRequestDetail } from '~/api/generated';

type AuthStatus = 'pending' | 'approved' | 'rejected';

const STATUS_COLORS: Record<AuthStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const STATUS_LABELS: Record<AuthStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function AuthorizationDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [request, setRequest] = React.useState<IssueAuthorizationRequestDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [decisionNote, setDecisionNote] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    async function fetchRequest() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getIssueAuthorization(requestId!);
        if (!cancelled) {
          if (res.status === 200) {
            setRequest(res.data);
          } else {
            setError('Authorization request not found');
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load authorization request');
          setIsLoading(false);
        }
      }
    }

    fetchRequest();
    return () => { cancelled = true; };
  }, [requestId]);

  const handleApprove = async () => {
    if (!requestId) return;
    setIsSubmitting(true);
    try {
      await approveIssueAuthorization(requestId);
      setRequest((prev) => prev ? { ...prev, status: 'approved', decisionNote } : prev);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!requestId) return;
    setIsSubmitting(true);
    try {
      await rejectIssueAuthorization(requestId);
      setRequest((prev) => prev ? { ...prev, status: 'rejected', decisionNote } : prev);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Skeleton width={160} height={36} sx={{ mb: 3 }} />
        <Skeleton width={300} height={32} sx={{ mb: 2 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} gap={3}>
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={200} sx={{ flex: 1 }} />
        </Stack>
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900, p: 3 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          {error || 'Authorization request not found'}
        </Typography>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/creator/authorizations'))}
          sx={{ textTransform: 'none' }}
        >
          Back to Authorizations
        </Button>
      </Box>
    );
  }

  const orgName = request.requestingOrg?.name ?? request.requestingOrgId;
  const collectionName = request.collection?.name ?? request.collectionId;
  const status = request.status as AuthStatus;

  return (
    <Box sx={{ width: '100%', maxWidth: 900 }}>
      {/* Back button */}
      <Button
        size="small"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate(orgPath('/creator/authorizations'))}
        sx={{ textTransform: 'none', mb: 3 }}
      >
        Back to Authorizations
      </Button>

      {/* Title + status */}
      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {orgName} — Authorization Request
        </Typography>
        <Chip
          label={STATUS_LABELS[status]}
          color={STATUS_COLORS[status]}
          size="small"
        />
      </Stack>

      {/* Two-panel layout */}
      <Stack direction={{ xs: 'column', md: 'row' }} gap={3} sx={{ mb: 4 }}>
        {/* Left panel: Requesting Org */}
        <Paper variant="outlined" sx={{ flex: 1, p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Requesting Org
          </Typography>
          <Stack gap={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                Organization
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {orgName}
              </Typography>
            </Box>
            {request.requestingOrg?.about && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  About
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {request.requestingOrg.about}
                </Typography>
              </Box>
            )}
            {request.requestingOrg?.location && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Location
                </Typography>
                <Typography variant="body2">{request.requestingOrg.location}</Typography>
              </Box>
            )}
            {request.requestingOrg?.website && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Website
                </Typography>
                <Link
                  href={request.requestingOrg.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                >
                  {request.requestingOrg.website}
                </Link>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Right panel: Request Details */}
        <Paper variant="outlined" sx={{ flex: 1, p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
            Request Details
          </Typography>
          <Stack gap={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                Collection
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {collectionName}
              </Typography>
            </Box>
            {request.collection?.badgeCount != null && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Badges
                </Typography>
                <Typography variant="body2">{request.collection.badgeCount}</Typography>
              </Box>
            )}
            {request.message && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Message
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {request.message}
                </Typography>
              </Box>
            )}
            {request.createdAt && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Submitted
                </Typography>
                <Typography variant="body2">{formatDate(request.createdAt)}</Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Decision section */}
      {status === 'pending' ? (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Decision
          </Typography>
          <TextField
            label="Decision Note"
            multiline
            minRows={3}
            fullWidth
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder="Add an optional note to accompany your decision..."
            sx={{ mb: 2 }}
          />
          <Stack direction="row" gap={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckRoundedIcon />}
              disabled={isSubmitting}
              onClick={handleApprove}
              sx={{ textTransform: 'none' }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseRoundedIcon />}
              disabled={isSubmitting}
              onClick={handleReject}
              sx={{ textTransform: 'none' }}
            >
              Reject
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Decision
          </Typography>
          <Stack gap={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                Status
              </Typography>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                <Chip
                  label={STATUS_LABELS[status]}
                  color={STATUS_COLORS[status]}
                  size="small"
                />
              </Stack>
            </Box>
            {request.decisionNote && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Decision Note
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {request.decisionNote}
                </Typography>
              </Box>
            )}
            {request.decidedAt && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Decided
                </Typography>
                <Typography variant="body2">{formatDate(request.decidedAt)}</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

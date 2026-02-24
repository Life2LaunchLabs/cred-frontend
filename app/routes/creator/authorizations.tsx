import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router';
import { listCreatorAuthorizations, approveIssueAuthorization } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { IssueAuthorizationRequest } from '~/api/generated';

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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CreatorAuthorizations() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [requests, setRequests] = React.useState<IssueAuthorizationRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<AuthStatus>('pending');
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchRequests() {
      setIsLoading(true);
      const res = await listCreatorAuthorizations(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setRequests(res.data.data);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchRequests();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const filteredRequests = requests.filter((r) => r.status === activeTab);

  const countByStatus = (status: AuthStatus) => requests.filter((r) => r.status === status).length;

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    try {
      await approveIssueAuthorization(requestId);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const } : r))
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography component="h2" variant="h6">
          Authorization Requests
        </Typography>
      </Stack>

      {/* Tab bar */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {(['pending', 'approved', 'rejected'] as AuthStatus[]).map((status) => (
          <Tab
            key={status}
            value={status}
            label={
              <Stack direction="row" alignItems="center" gap={0.75}>
                {STATUS_LABELS[status]}
                {!isLoading && (
                  <Chip
                    label={countByStatus(status)}
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem', pointerEvents: 'none' }}
                  />
                )}
              </Stack>
            }
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
        ))}
      </Tabs>

      {/* Request list */}
      {isLoading ? (
        <Stack gap={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Stack>
      ) : filteredRequests.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No {STATUS_LABELS[activeTab].toLowerCase()} authorization requests
          </Typography>
        </Paper>
      ) : (
        <Stack gap={1.5}>
          {filteredRequests.map((request) => (
            <Paper
              key={request.id}
              variant="outlined"
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                transition: 'border-color 0.15s',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.requestingOrgId}
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[request.status as AuthStatus]}
                    color={STATUS_COLORS[request.status as AuthStatus]}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Collection: {request.collectionId}
                  {request.createdAt && ` · Submitted ${formatDate(request.createdAt)}`}
                </Typography>
              </Box>

              <Stack direction="row" gap={1} flexShrink={0}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => navigate(orgPath(`/creator/authorizations/${request.id}`))}
                  sx={{ textTransform: 'none' }}
                >
                  View Details
                </Button>
                {request.status === 'pending' && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckRoundedIcon />}
                    disabled={approvingId === request.id}
                    onClick={() => handleApprove(request.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Approve
                  </Button>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

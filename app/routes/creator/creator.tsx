import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useNavigate } from 'react-router';
import { listCollections, listCreatorAuthorizations, approveIssueAuthorization } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Collection, IssueAuthorizationRequest } from '~/api/generated';
import type { CollectionStatus } from '~/api/generated';

const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  draft: 'default',
  in_review: 'info',
  changes_requested: 'warning',
  approved: 'success',
  published: 'success',
  archived: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function KpiCard({ label, value, isLoading }: { label: string; value: number; isLoading: boolean }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        flex: 1,
        minWidth: { xs: 'calc(50% - 8px)', sm: 160 },
        textAlign: 'center',
      }}
    >
      {isLoading ? (
        <>
          <Skeleton variant="text" width={40} height={48} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width={80} sx={{ mx: 'auto' }} />
        </>
      ) : (
        <>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </>
      )}
    </Paper>
  );
}

export default function CreatorStudio() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [authRequests, setAuthRequests] = React.useState<IssueAuthorizationRequest[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = React.useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = React.useState(true);
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchCollections() {
      setIsLoadingCollections(true);
      if (!sessionStorage.getItem('collections_added')) {
        if (!cancelled) { setCollections([]); setIsLoadingCollections(false); }
        return;
      }
      const res = await listCollections({ orgId: activeOrg!.org.id });
      if (!cancelled && res.status === 200) {
        setCollections(res.data.data);
      }
      if (!cancelled) setIsLoadingCollections(false);
    }

    fetchCollections();
    return () => { cancelled = true; };
  }, [activeOrg]);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchAuthorizations() {
      setIsLoadingAuth(true);
      const res = await listCreatorAuthorizations(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setAuthRequests(res.data.data);
      }
      if (!cancelled) setIsLoadingAuth(false);
    }

    fetchAuthorizations();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const draftCount = collections.filter((c) => c.status === 'draft').length;
  const inReviewCount = collections.filter((c) => c.status === 'in_review').length;
  const publishedCount = collections.filter((c) => c.status === 'published').length;
  const pendingAuthCount = authRequests.filter((r) => r.status === 'pending').length;

  const pendingRequests = authRequests.filter((r) => r.status === 'pending').slice(0, 5);

  const handleApprove = async (requestId: string) => {
    setApprovingId(requestId);
    try {
      await approveIssueAuthorization(requestId);
      setAuthRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const } : r))
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Page header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography component="h2" variant="h6">
            Creator Studio
          </Typography>
          <Chip label="Approved" color="success" size="small" sx={{ ml: 1 }} />
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate(orgPath('/creator/collections/new'))}
          sx={{ textTransform: 'none' }}
        >
          New Collection
        </Button>
      </Stack>

      {/* KPI strip */}
      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mb: 4 }}>
        <KpiCard label="Draft Collections" value={draftCount} isLoading={isLoadingCollections} />
        <KpiCard label="In Review" value={inReviewCount} isLoading={isLoadingCollections} />
        <KpiCard label="Published" value={publishedCount} isLoading={isLoadingCollections} />
        <KpiCard label="Pending Authorizations" value={pendingAuthCount} isLoading={isLoadingAuth} />
      </Stack>

      {/* Work Queue */}
      <Stack spacing={4}>
        {/* Pending Authorization Requests */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Pending Authorization Requests
          </Typography>
          {isLoadingAuth ? (
            <Stack gap={1}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={64} />
              ))}
            </Stack>
          ) : pendingRequests.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No pending authorization requests
              </Typography>
            </Paper>
          ) : (
            <Stack gap={1}>
              {pendingRequests.map((request) => (
                <Paper
                  key={request.id}
                  variant="outlined"
                  sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {request.requestingOrgId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Collection: {request.collectionId}
                      {request.createdAt && ` · Submitted ${formatDate(request.createdAt)}`}
                    </Typography>
                  </Box>
                  <Stack direction="row" gap={1}>
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
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => navigate(orgPath(`/creator/authorizations/${request.id}`))}
                      sx={{ textTransform: 'none' }}
                    >
                      View
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>

        {/* Your Collections */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Your Collections
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(orgPath('/creator/collections'))}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Stack>
          {isLoadingCollections ? (
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton variant="rounded" height={140} />
                </Grid>
              ))}
            </Grid>
          ) : collections.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No collections yet. Create your first collection to get started.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {collections.map((collection) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={collection.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      transition: 'border-color 0.15s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" gap={1.5}>
                      <Avatar
                        variant="rounded"
                        src={collection.imageUrl}
                        sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'grey.300' }}
                      >
                        {getInitials(collection.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {collection.name}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                          <Chip
                            label={STATUS_LABELS[collection.status ?? 'draft'] ?? collection.status}
                            color={STATUS_COLORS[collection.status ?? 'draft'] ?? 'default'}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" gap={1} sx={{ mt: 'auto' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                        {collection.badgeCount ?? 0} badges
                        {collection.updatedAt && ` · ${formatDate(collection.updatedAt)}`}
                      </Typography>
                    </Stack>
                    <Stack direction="row" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => navigate(orgPath(`/creator/collections/${collection.id}/edit`))}
                        sx={{ textTransform: 'none', flex: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => navigate(orgPath(`/creator/collections/${collection.id}`))}
                        sx={{ textTransform: 'none', flex: 1 }}
                      >
                        View
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

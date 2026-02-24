import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router';
import { listCollections } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Collection, CollectionStatus } from '~/api/generated';

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

const TAB_STATUSES: Array<CollectionStatus | 'all'> = [
  'all',
  'draft',
  'in_review',
  'changes_requested',
  'approved',
  'published',
  'archived',
];

const TAB_LABELS: Record<string, string> = {
  all: 'All',
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

export default function CreatorCollections() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<CollectionStatus | 'all'>('all');

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchCollections() {
      setIsLoading(true);
      const res = await listCollections({ orgId: activeOrg!.org.id });
      if (!cancelled && res.status === 200) {
        setCollections(res.data.data);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchCollections();
    return () => { cancelled = true; };
  }, [activeOrg]);

  const filteredCollections =
    activeTab === 'all'
      ? collections
      : collections.filter((c) => c.status === activeTab);

  const countByStatus = (status: CollectionStatus | 'all') =>
    status === 'all'
      ? collections.length
      : collections.filter((c) => c.status === status).length;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography component="h2" variant="h6">
          Collections
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate(orgPath('/creator/collections/new'))}
          sx={{ textTransform: 'none' }}
        >
          New Collection
        </Button>
      </Stack>

      {/* Tab bar */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {TAB_STATUSES.map((status) => (
          <Tab
            key={status}
            value={status}
            label={
              <Stack direction="row" alignItems="center" gap={0.75}>
                {TAB_LABELS[status]}
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

      {/* Collection grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : filteredCollections.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No{activeTab !== 'all' ? ` ${STATUS_LABELS[activeTab].toLowerCase()}` : ''} collections found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredCollections.map((collection) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={collection.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                  <Avatar
                    variant="rounded"
                    src={collection.imageUrl}
                    sx={{ width: 52, height: 52, borderRadius: 1.5, bgcolor: 'grey.300' }}
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
                        mb: 0.5,
                      }}
                    >
                      {collection.name}
                    </Typography>
                    <Chip
                      label={STATUS_LABELS[collection.status ?? 'draft'] ?? collection.status}
                      color={STATUS_COLORS[collection.status ?? 'draft'] ?? 'default'}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  {collection.badgeCount ?? 0} {collection.badgeCount === 1 ? 'badge' : 'badges'}
                  {collection.updatedAt && ` · Updated ${formatDate(collection.updatedAt)}`}
                </Typography>

                <Stack direction="row" gap={1} sx={{ mt: 'auto' }}>
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
  );
}

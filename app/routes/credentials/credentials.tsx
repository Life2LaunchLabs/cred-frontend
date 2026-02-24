import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { useNavigate, useSearchParams } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { listOrgCollectionRels, listOrgBadgeRels } from '~/api/generated';
import type { OrgCollectionRel, OrgBadgeRel } from '~/api/generated';

type StatusFilter = 'all' | 'active' | 'pending' | 'archived';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function StatusChip({ status }: { status: OrgCollectionRel['status'] }) {
  const colorMap = {
    active: 'success',
    pending: 'warning',
    archived: 'default',
    rejected: 'error',
  } as const;
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      color={colorMap[status]}
      variant="outlined"
      sx={{ height: 20, fontSize: '0.7rem' }}
    />
  );
}

function CollectionRelCard({ rel, onClick }: { rel: OrgCollectionRel; onClick: () => void }) {
  const c = rel.collection;
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Avatar
        variant="rounded"
        src={c.imageUrl}
        sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }}
      >
        {getInitials(c.name)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
          <StatusChip status={rel.status} />
          {rel.source === 'authorized' && (
            <Chip label="Authorized" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Stack>
        {c.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.25 }}
          >
            {c.description}
          </Typography>
        )}
        <Stack direction="row" gap={2} sx={{ mt: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            <VerifiedOutlinedIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.25 }} />
            {c.badgeCount ?? 0} badges
          </Typography>
          {(rel.programCount ?? 0) > 0 && (
            <Typography variant="caption" color="text.secondary">
              Used in {rel.programCount} {rel.programCount === 1 ? 'program' : 'programs'}
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

function BadgeRelCard({ badgeRel, onClick }: { badgeRel: OrgBadgeRel; onClick: () => void }) {
  const b = badgeRel.badge;
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Avatar
        variant="rounded"
        src={b.imageUrl}
        sx={{ width: 40, height: 40, borderRadius: 1, flexShrink: 0 }}
      >
        {getInitials(b.name)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.name}
          </Typography>
          <Chip
            label={badgeRel.status}
            size="small"
            color={badgeRel.status === 'active' ? 'success' : badgeRel.status === 'pending' ? 'warning' : 'default'}
            variant="outlined"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        </Stack>
        {b.description && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.description}
          </Typography>
        )}
        {(badgeRel.programCount ?? 0) > 0 && (
          <Typography variant="caption" color="text.secondary">
            {badgeRel.programCount} {badgeRel.programCount === 1 ? 'program' : 'programs'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function CardSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
        <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
      </Box>
    </Paper>
  );
}

export default function CredentialsLibrary() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [searchParams] = useSearchParams();
  const [tab, setTab] = React.useState<'collections' | 'badges'>(
    () => searchParams.get('tab') === 'badges' ? 'badges' : 'collections'
  );
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('active');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  const [collectionRels, setCollectionRels] = React.useState<OrgCollectionRel[]>([]);
  const [badgeRels, setBadgeRels] = React.useState<OrgBadgeRel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refetchKey, setRefetchKey] = React.useState(0);
  const [isAddingDemo, setIsAddingDemo] = React.useState(false);
  // Tracks whether we've already restored demo SW state this page load
  const demoRestoredRef = React.useRef(false);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchLibrary() {
      setIsLoading(true);
      // On first fetch per page load: restore demo SW state from localStorage
      if (!demoRestoredRef.current) {
        demoRestoredRef.current = true;
        const demoKey = `demo:col_rci_1:${activeOrg!.org.id}`;
        if (localStorage.getItem(demoKey)) {
          await fetch(`/orgs/${activeOrg!.org.id}/library/demo`, { method: 'POST' });
        }
      }
      const [colRes, bdgRes] = await Promise.all([
        listOrgCollectionRels(activeOrg!.org.id, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          q: debouncedSearch || undefined,
        }),
        listOrgBadgeRels(activeOrg!.org.id, {
          status: statusFilter === 'all' || statusFilter === 'archived' ? statusFilter as 'active' | 'archived' | undefined :
                  statusFilter === 'pending' ? 'pending' : 'active',
          q: debouncedSearch || undefined,
        }),
      ]);
      if (!cancelled) {
        if (colRes.status === 200) setCollectionRels(colRes.data.data);
        if (bdgRes.status === 200) setBadgeRels(bdgRes.data.data);
        setIsLoading(false);
      }
    }

    fetchLibrary();
    return () => { cancelled = true; };
  }, [activeOrg, statusFilter, debouncedSearch, refetchKey]);

  const pendingCount = collectionRels.filter((r) => r.status === 'pending').length;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }} gap={2}>
        <Box>
          <Typography component="h2" variant="h6">Credential Library</Typography>
          <Typography variant="body2" color="text.secondary">
            Collections and badges your organization has access to
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate(orgPath('/credentials/catalog'))}
            sx={{ textTransform: 'none', flexShrink: 0 }}
          >
            Browse Catalog
          </Button>
        )}
      </Stack>

      {/* Pending work queue (admin only) */}
      {isAdmin && pendingCount > 0 && !isLoading && (
        <Paper
          variant="outlined"
          sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'warning.50' }}
        >
          <PendingActionsOutlinedIcon color="warning" />
          <Typography variant="body2">
            <strong>{pendingCount}</strong> pending authorization {pendingCount === 1 ? 'request' : 'requests'} awaiting approval
          </Typography>
          <Button
            size="small"
            sx={{ ml: 'auto', textTransform: 'none' }}
            onClick={() => setStatusFilter('pending')}
          >
            View
          </Button>
        </Paper>
      )}

      {/* Tabs + filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontSize: '0.875rem' } }}
        >
          <Tab value="collections" label="Collections" />
          <Tab value="badges" label="Badges" />
        </Tabs>

        <Stack direction="row" gap={1} sx={{ ml: { sm: 'auto' } }} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 200 }}
          />
          <ToggleButtonGroup
            size="small"
            value={statusFilter}
            exclusive
            onChange={(_, v) => v && setStatusFilter(v)}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.8rem', px: 1.5 } }}
          >
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="archived">Archived</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Content */}
      {tab === 'collections' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : collectionRels.length === 0
            ? (
              <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">No collections match the current filter.</Typography>
                {isAdmin && !debouncedSearch && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isAddingDemo}
                    sx={{ mt: 1.5, textTransform: 'none' }}
                    onClick={async () => {
                      setIsAddingDemo(true);
                      await fetch(`/orgs/${activeOrg!.org.id}/library/demo`, { method: 'POST' });
                      localStorage.setItem(`demo:col_rci_1:${activeOrg!.org.id}`, '1');
                      setIsAddingDemo(false);
                      setRefetchKey((k) => k + 1);
                    }}
                  >
                    {isAddingDemo ? 'Adding…' : 'Add demo collection'}
                  </Button>
                )}
              </Box>
            )
            : collectionRels.map((rel) => (
              <CollectionRelCard
                key={rel.id}
                rel={rel}
                onClick={() => navigate(orgPath(`/credentials/collections/${rel.id}`))}
              />
            ))
          }
        </Box>
      )}

      {tab === 'badges' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)
            : badgeRels.length === 0
            ? (
              <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">No badges match the current filter.</Typography>
              </Box>
            )
            : badgeRels.map((br) => (
              <BadgeRelCard
                key={br.id}
                badgeRel={br}
                onClick={() => navigate(orgPath(`/credentials/badges/${br.id}`))}
              />
            ))
          }
        </Box>
      )}
    </Box>
  );
}

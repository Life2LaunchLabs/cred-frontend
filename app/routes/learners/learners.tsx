import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useNavigate, useSearchParams } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { listCohorts, listOrgLearners } from '~/api/generated';
import type { Cohort, OrgLearnerDetail, ListCohortsStatus } from '~/api/generated';

type CohortStatusFilter = 'active' | 'draft' | 'archived' | 'all';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CohortStatusChip({ status }: { status: Cohort['status'] }) {
  const colorMap = { active: 'success', draft: 'default', archived: 'default' } as const;
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

function CohortGridCard({ cohort, onClick }: { cohort: Cohort; onClick: () => void }) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      {/* Cover image */}
      {cohort.coverImageUrl ? (
        <Box
          component="img"
          src={cohort.coverImageUrl}
          alt={cohort.name}
          sx={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box
          sx={{
            height: 100,
            background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GroupsRoundedIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.6)' }} />
        </Box>
      )}
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {cohort.name}
          </Typography>
          <CohortStatusChip status={cohort.status} />
        </Stack>
        {cohort.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 0.5 }}
          >
            {cohort.description}
          </Typography>
        )}
        <Stack direction="row" gap={2}>
          <Typography variant="caption" color="text.secondary">
            {cohort.learnerCount ?? 0} {cohort.learnerCount === 1 ? 'learner' : 'learners'}
          </Typography>
          {cohort.assignedStaffIds && cohort.assignedStaffIds.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {cohort.assignedStaffIds.length} staff
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

function CohortCardSkeleton() {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={100} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton width="70%" height={20} />
        <Skeleton width="50%" height={16} sx={{ mt: 0.5 }} />
      </Box>
    </Paper>
  );
}

function LearnerRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
      <TableCell><Skeleton width={120} /></TableCell>
      <TableCell><Skeleton width={180} /></TableCell>
      <TableCell><Skeleton width={60} /></TableCell>
      <TableCell><Skeleton width={90} /></TableCell>
    </TableRow>
  );
}

export default function LearnersPage() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = React.useState<'cohorts' | 'learners'>(
    () => searchParams.get('tab') === 'learners' ? 'learners' : 'cohorts'
  );
  const [cohortFilter, setCohortFilter] = React.useState<CohortStatusFilter>('active');
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  const [cohorts, setCohorts] = React.useState<Cohort[]>([]);
  const [learners, setLearners] = React.useState<OrgLearnerDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refetchKey, setRefetchKey] = React.useState(0);
  const [isAddingDemo, setIsAddingDemo] = React.useState(false);
  const demoRestoredRef = React.useRef(false);

  // Dropdown state
  const [addAnchorEl, setAddAnchorEl] = React.useState<null | HTMLElement>(null);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Sync tab → searchParams
  React.useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch cohorts
  React.useEffect(() => {
    if (!activeOrg || tab !== 'cohorts') return;
    let cancelled = false;
    async function fetchCohorts() {
      setIsLoading(true);
      // Restore demo cohort state from localStorage on first load
      if (!demoRestoredRef.current) {
        demoRestoredRef.current = true;
        const demoKey = `demo:coh_demo_1:${activeOrg!.org.id}`;
        if (localStorage.getItem(demoKey)) {
          await fetch(`/orgs/${activeOrg!.org.id}/cohorts/demo`, { method: 'POST' });
        }
      }
      const res = await listCohorts(activeOrg!.org.id, {
        status: cohortFilter !== 'all' ? cohortFilter as ListCohortsStatus : undefined,
        q: debouncedSearch || undefined,
      });
      if (!cancelled && res.status === 200) setCohorts(res.data.data);
      if (!cancelled) setIsLoading(false);
    }
    fetchCohorts();
    return () => { cancelled = true; };
  }, [activeOrg, tab, cohortFilter, debouncedSearch, refetchKey]);

  // Fetch learners
  React.useEffect(() => {
    if (!activeOrg || tab !== 'learners') return;
    let cancelled = false;
    async function fetchLearners() {
      setIsLoading(true);
      const res = await listOrgLearners(activeOrg!.org.id, {
        q: debouncedSearch || undefined,
      });
      if (!cancelled && res.status === 200) setLearners(res.data.data);
      if (!cancelled) setIsLoading(false);
    }
    fetchLearners();
    return () => { cancelled = true; };
  }, [activeOrg, tab, debouncedSearch]);

  function handleTabChange(_: React.SyntheticEvent, v: 'cohorts' | 'learners') {
    setTab(v);
    setSearch('');
    setIsLoading(true);
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }} gap={2}>
        <Box>
          <Typography component="h2" variant="h6">Learners</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage cohorts and learners in your organization
          </Typography>
        </Box>
        {isAdmin && (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setAddAnchorEl(e.currentTarget)}
              sx={{ textTransform: 'none', flexShrink: 0 }}
            >
              Add
            </Button>
            <Menu
              anchorEl={addAnchorEl}
              open={Boolean(addAnchorEl)}
              onClose={() => setAddAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => { setAddAnchorEl(null); navigate(orgPath('/learners/cohorts/new')); }}
                sx={{ gap: 1.5 }}
              >
                <GroupsRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>New Cohort</Typography>
                  <Typography variant="caption" color="text.secondary">Create a group of learners</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                onClick={() => { setAddAnchorEl(null); navigate(orgPath('/learners/invite')); }}
                sx={{ gap: 1.5 }}
              >
                <PersonAddRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Invite Learners</Typography>
                  <Typography variant="caption" color="text.secondary">Send email invitations</Typography>
                </Box>
              </MenuItem>
            </Menu>
          </>
        )}
      </Stack>

      {/* Tabs + filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontSize: '0.875rem' } }}
        >
          <Tab value="cohorts" label="Cohorts" />
          <Tab value="learners" label="Learners" />
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
          {tab === 'cohorts' && (
            <ToggleButtonGroup
              size="small"
              value={cohortFilter}
              exclusive
              onChange={(_, v) => v && setCohortFilter(v)}
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.8rem', px: 1.5 } }}
            >
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="draft">Draft</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
              <ToggleButton value="all">All</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
      </Stack>

      {/* Cohorts grid */}
      {tab === 'cohorts' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CohortCardSkeleton key={i} />)
            : cohorts.length === 0
            ? (
              <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {cohortFilter === 'all' ? 'No cohorts yet.' : `No ${cohortFilter} cohorts.`}
                </Typography>
                {isAdmin && !debouncedSearch && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isAddingDemo}
                    sx={{ mt: 1.5, textTransform: 'none' }}
                    onClick={async () => {
                      setIsAddingDemo(true);
                      await fetch(`/orgs/${activeOrg!.org.id}/cohorts/demo`, { method: 'POST' });
                      localStorage.setItem(`demo:coh_demo_1:${activeOrg!.org.id}`, '1');
                      setIsAddingDemo(false);
                      setRefetchKey((k) => k + 1);
                    }}
                  >
                    {isAddingDemo ? 'Adding…' : 'Load demo cohort'}
                  </Button>
                )}
              </Box>
            )
            : cohorts.map((c) => (
              <CohortGridCard
                key={c.id}
                cohort={c}
                onClick={() => navigate(orgPath(`/learners/cohorts/${c.slug}`))}
              />
            ))
          }
        </Box>
      )}

      {/* Learners table */}
      {tab === 'learners' && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40, pl: 2 }} />
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <LearnerRowSkeleton key={i} />)
                : learners.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                      <Typography color="text.secondary">No learners yet.</Typography>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1.5, textTransform: 'none', display: 'block', mx: 'auto' }}
                          startIcon={<PersonAddRoundedIcon />}
                          onClick={() => navigate(orgPath('/learners/invite'))}
                        >
                          Invite Learners
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
                : learners.map((ol) => {
                  const l = ol.learner;
                  const name = l?.name ?? '—';
                  return (
                    <TableRow
                      key={ol.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(orgPath(`/learners/${l?.slug ?? ol.learnerId}`))}
                    >
                      <TableCell sx={{ pl: 2, pr: 0 }}>
                        <Avatar src={l?.profileImageUrl} sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {getInitials(name)}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>
                        {l?.title && (
                          <Typography variant="caption" color="text.secondary">{l.title}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{l?.email ?? '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ol.status === 'active' ? 'Active' : 'Archived'}
                          size="small"
                          color={ol.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(l?.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty state icon watermark for cohorts tab when no search */}
      {tab === 'cohorts' && !isLoading && cohorts.length === 0 && !debouncedSearch && (
        <Box sx={{ display: 'none' }}>
          <VerifiedUserOutlinedIcon />
        </Box>
      )}
    </Box>
  );
}

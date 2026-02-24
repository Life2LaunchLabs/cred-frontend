import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { useNavigate, useParams } from 'react-router';
import { getOrgCollectionRel, updateOrgCollectionRel } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { OrgCollectionRelDetail, OrgBadgeRel } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function StatusChip({ status }: { status: string }) {
  const colorMap: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
    active: 'success', pending: 'warning', archived: 'default', rejected: 'error',
  };
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      color={colorMap[status] ?? 'default'}
      variant="outlined"
    />
  );
}

function BadgeRelRow({ badgeRel, onNavigate }: { badgeRel: OrgBadgeRel; onNavigate: () => void }) {
  return (
    <Paper
      variant="outlined"
      onClick={onNavigate}
      sx={{
        p: 1.5,
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Avatar variant="rounded" src={badgeRel.badge.imageUrl} sx={{ width: 36, height: 36, borderRadius: 1 }}>
        {getInitials(badgeRel.badge.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {badgeRel.badge.name}
        </Typography>
        {badgeRel.programCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            Used in {badgeRel.programCount} {badgeRel.programCount === 1 ? 'program' : 'programs'}
          </Typography>
        )}
      </Box>
      <Chip
        label={badgeRel.status}
        size="small"
        color={badgeRel.status === 'active' ? 'success' : badgeRel.status === 'pending' ? 'warning' : 'default'}
        variant="outlined"
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    </Paper>
  );
}

export default function CollectionRelDetail() {
  const { collectionRelId } = useParams<{ collectionRelId: string }>();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const { activeOrg, isAdmin } = useOrg();

  const [rel, setRel] = React.useState<OrgCollectionRelDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Admin editing state
  const [notes, setNotes] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!collectionRelId || !activeOrg) return;
    let cancelled = false;

    async function fetchRel() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getOrgCollectionRel(activeOrg!.org.id, collectionRelId!);
        if (!cancelled) {
          if (res.status === 200) {
            setRel(res.data);
            setNotes(res.data.notes ?? '');
          } else {
            setError('Collection relationship not found');
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load'); setIsLoading(false); }
      }
    }

    fetchRel();
    return () => { cancelled = true; };
  }, [collectionRelId, activeOrg]);

  async function handleArchive() {
    if (!rel || !activeOrg) return;
    setIsSaving(true);
    const newStatus = rel.status === 'archived' ? 'active' : 'archived';
    const res = await updateOrgCollectionRel(activeOrg.org.id, rel.id, { status: newStatus });
    if (res.status === 200) {
      setRel((prev) => prev ? { ...prev, status: newStatus } : prev);
    }
    setIsSaving(false);
  }

  async function handleSaveNotes() {
    if (!rel || !activeOrg) return;
    setIsSaving(true);
    await updateOrgCollectionRel(activeOrg.org.id, rel.id, { notes });
    setRel((prev) => prev ? { ...prev, notes } : prev);
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
        <Stack direction="row" alignItems="flex-end" gap={2} sx={{ px: 3, mt: -5 }}>
          <Skeleton variant="rounded" width={80} height={80} />
          <Skeleton width={220} height={28} />
        </Stack>
        <Box sx={{ px: 3, mt: 3 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={60} sx={{ mb: 1, borderRadius: 1 }} />)}
        </Box>
      </Box>
    );
  }

  if (error || !rel) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error ?? 'Not found'}</Typography>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(orgPath('/credentials'))}>
          Back to Library
        </Button>
      </Box>
    );
  }

  const c = rel.collection;

  return (
    <Box sx={{ width: '100%', maxWidth: 900, pb: 4 }}>
      {/* Cover */}
      <Box
        sx={{
          position: 'relative', height: { xs: 140, sm: 180 }, borderRadius: 2,
          overflow: 'hidden', bgcolor: 'grey.200',
        }}
      >
        {c.imageUrl ? (
          <Box component="img" src={c.imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B2845 0%, #274060 50%, #1B6B93 100%)' }} />
        )}
      </Box>

      {/* Avatar + name */}
      <Stack direction="row" alignItems="flex-end" gap={2} sx={{ px: 3, mt: -5 }}>
        <Avatar
          variant="rounded"
          src={c.imageUrl}
          sx={{ width: 80, height: 80, borderRadius: 2, border: '4px solid', borderColor: 'background.paper', bgcolor: 'grey.300', fontSize: '1.75rem', fontWeight: 700 }}
        >
          {getInitials(c.name)}
        </Avatar>
        <Stack gap={0.5} sx={{ flex: 1, pb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{c.name}</Typography>
        </Stack>
      </Stack>

      {/* Back + status */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ px: 3, mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/credentials'))}
          sx={{ textTransform: 'none' }}
        >
          Library
        </Button>
        <StatusChip status={rel.status} />
        {rel.source === 'authorized' && (
          <Chip label="Authorized" size="small" icon={<LockOutlinedIcon />} variant="outlined" />
        )}
        {isAdmin && (
          <Button
            size="small"
            startIcon={<BarChartRoundedIcon />}
            onClick={() => navigate(orgPath(`/credentials/analytics/collections/${rel.id}`))}
            sx={{ ml: 'auto', textTransform: 'none' }}
          >
            Analytics
          </Button>
        )}
      </Stack>

      {/* Description */}
      {c.description && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 3, mt: 1.5, maxWidth: 600 }}>
          {c.description}
        </Typography>
      )}

      {/* Meta row */}
      <Stack direction="row" gap={2.5} flexWrap="wrap" sx={{ px: 3, mt: 1.5, color: 'text.secondary' }}>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <VerifiedOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">{c.badgeCount ?? 0} badges</Typography>
        </Stack>
        {rel.requestedAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">Requested {formatDate(rel.requestedAt)}</Typography>
          </Stack>
        )}
        {rel.approvedAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">Approved {formatDate(rel.approvedAt)}</Typography>
          </Stack>
        )}
        {rel.programCount > 0 && (
          <Typography variant="caption">
            Used in {rel.programCount} {rel.programCount === 1 ? 'program' : 'programs'}
          </Typography>
        )}
      </Stack>

      <Divider sx={{ mx: 3, mt: 3 }} />

      {/* Badge roster */}
      {(rel.badgeRels?.length ?? 0) > 0 && (
        <Box sx={{ px: 3, mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Badges in this collection
          </Typography>
          <Stack gap={1}>
            {rel.badgeRels!.map((br) => (
              <BadgeRelRow
                key={br.id}
                badgeRel={br}
                onNavigate={() => navigate(orgPath(`/credentials/badges/${br.id}`))}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Used by programs */}
      {rel.programCount > 0 && (
        <Box sx={{ px: 3, mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Used by programs
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={() => navigate(orgPath('/credentials/programs'))}
          >
            View programs ({rel.programCount})
          </Button>
        </Box>
      )}

      {/* Admin-only controls */}
      {isAdmin && (
        <>
          <Divider sx={{ mx: 3, mt: 3 }} />
          <Box sx={{ px: 3, mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Admin controls</Typography>
            <Stack gap={2}>
              <TextField
                label="Internal notes"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                size="small"
                sx={{ maxWidth: 480 }}
              />
              <Stack direction="row" gap={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveNotes}
                  disabled={isSaving || notes === (rel.notes ?? '')}
                  sx={{ textTransform: 'none' }}
                >
                  Save notes
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color={rel.status === 'archived' ? 'primary' : 'warning'}
                  onClick={handleArchive}
                  disabled={isSaving || rel.status === 'pending' || rel.status === 'rejected'}
                  sx={{ textTransform: 'none' }}
                >
                  {rel.status === 'archived' ? 'Unarchive' : 'Archive'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </>
      )}

      {/* Staff read-only request info */}
      {!isAdmin && rel.status === 'pending' && (
        <Box sx={{ px: 3, mt: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Typography variant="body2" color="text.secondary">
              Authorization request pending. An admin is managing this request.
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

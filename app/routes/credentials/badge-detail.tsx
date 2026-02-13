import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useNavigate, useParams } from 'react-router';
import { getBadge, getOrg } from '~/api/generated';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Badge, Org } from '~/api/generated';

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
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BadgeDetail() {
  const { collectionId, badgeId } = useParams();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [badge, setBadge] = React.useState<Badge | null>(null);
  const [creatorOrg, setCreatorOrg] = React.useState<Org | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!badgeId) return;
    let cancelled = false;

    async function fetchBadge() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getBadge(badgeId!);
        if (!cancelled) {
          if (res.status === 200) {
            setBadge(res.data);
          } else {
            setError('Badge not found');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load badge');
          setIsLoading(false);
        }
      }
    }

    fetchBadge();
    return () => { cancelled = true; };
  }, [badgeId]);

  React.useEffect(() => {
    if (!badge?.createdByOrgId) return;
    let cancelled = false;

    async function fetchOrg() {
      try {
        const res = await getOrg(badge!.createdByOrgId!);
        if (!cancelled && res.status === 200) {
          setCreatorOrg(res.data);
        }
      } catch {
        // External org - gracefully handle 404
      }
    }

    fetchOrg();
    return () => { cancelled = true; };
  }, [badge?.createdByOrgId]);

  const backPath = collectionId
    ? orgPath(`/credentials/collections/${collectionId}`)
    : orgPath('/credentials/collections');

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        <Stack sx={{ px: 3, mt: -4 }} direction="row" alignItems="flex-end" gap={2}>
          <Skeleton variant="rounded" width={96} height={96} sx={{ borderRadius: 2 }} />
          <Stack gap={1} sx={{ flex: 1, pb: 1 }}>
            <Skeleton width={220} height={28} />
            <Skeleton width={300} height={18} />
          </Stack>
        </Stack>
        <Stack direction="row" gap={2} sx={{ px: 3, mt: 3 }} flexWrap="wrap">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width={180} height={40} />
          ))}
        </Stack>
      </Box>
    );
  }

  if (error || !badge) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900, p: 3 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          {error || 'Badge not found'}
        </Typography>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(backPath)}
          sx={{ textTransform: 'none' }}
        >
          Back to Collection
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900 }}>
      {/* Cover area */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 160, sm: 200 },
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'grey.200',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1B2845 0%, #274060 50%, #1B6B93 100%)',
          }}
        />
      </Box>

      {/* Badge avatar + name */}
      <Stack sx={{ px: 3, mt: -4 }} direction="row" alignItems="flex-end" gap={2}>
        <Avatar
          variant="rounded"
          src={badge.imageUrl}
          sx={{
            width: 96,
            height: 96,
            borderRadius: 2,
            border: '4px solid',
            borderColor: 'background.paper',
            bgcolor: 'grey.300',
            fontSize: '2rem',
            fontWeight: 700,
          }}
        >
          {getInitials(badge.name)}
        </Avatar>
        <Stack gap={0.5} sx={{ flex: 1, pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {badge.name}
          </Typography>
          {badge.description && badge.description.length <= 120 && (
            <Typography variant="body2" color="text.secondary">
              {badge.description}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Back button */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ px: 3, mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(backPath)}
          sx={{ textTransform: 'none' }}
        >
          Back to Collection
        </Button>
      </Stack>

      {/* Full description if long */}
      {badge.description && badge.description.length > 120 && (
        <Typography variant="body1" sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}>
          {badge.description}
        </Typography>
      )}

      {/* Meta row */}
      <Stack
        direction="row"
        gap={2}
        flexWrap="wrap"
        sx={{ px: 3, mt: 2, color: 'text.secondary' }}
      >
        {badge.createdAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">Created {formatDate(badge.createdAt)}</Typography>
          </Stack>
        )}
        {creatorOrg && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Avatar src={creatorOrg.imageUrl} sx={{ width: 20, height: 20, fontSize: 10 }}>
              {getInitials(creatorOrg.name)}
            </Avatar>
            <Typography variant="body2">Created by {creatorOrg.name}</Typography>
          </Stack>
        )}
      </Stack>

      {/* Criteria */}
      {(badge.criteria?.length ?? 0) > 0 && (
        <Box sx={{ px: 3, mt: 4, pb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.75rem',
            }}
          >
            Criteria
          </Typography>
          <Stack gap={1}>
            {badge.criteria!.map((criterion) => (
              <Paper
                key={criterion.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                {criterion.isRequired ? (
                  <CheckCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {criterion.label}
                  </Typography>
                </Box>
                <Chip
                  label={criterion.isRequired ? 'Required' : 'Optional'}
                  size="small"
                  variant="outlined"
                  color={criterion.isRequired ? 'primary' : 'default'}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

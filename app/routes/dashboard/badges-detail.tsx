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
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { useNavigate, useParams } from 'react-router';
import { getCollection, getOrg } from '~/api/generated';
import type { CollectionDetail, Org } from '~/api/generated';

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

export default function BadgesDetail() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = React.useState<CollectionDetail | null>(null);
  const [creatorOrg, setCreatorOrg] = React.useState<Org | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!collectionId) return;
    let cancelled = false;

    async function fetchCollection() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getCollection(collectionId!);
        if (!cancelled) {
          if (res.status === 200) {
            setCollection(res.data);
          } else {
            setError('Collection not found');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load collection');
          setIsLoading(false);
        }
      }
    }

    fetchCollection();
    return () => { cancelled = true; };
  }, [collectionId]);

  React.useEffect(() => {
    if (!collection?.createdByOrgId) return;
    let cancelled = false;

    async function fetchOrg() {
      try {
        const res = await getOrg(collection!.createdByOrgId);
        if (!cancelled && res.status === 200) {
          setCreatorOrg(res.data);
        }
      } catch {
        // External org - gracefully handle 404
      }
    }

    fetchOrg();
    return () => { cancelled = true; };
  }, [collection?.createdByOrgId]);

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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width={180} height={80} />
          ))}
        </Stack>
      </Box>
    );
  }

  if (error || !collection) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900, p: 3 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          {error || 'Collection not found'}
        </Typography>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/home/badges')}
          sx={{ textTransform: 'none' }}
        >
          Back to Badges
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 900 }}>
      {/* Cover image */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 160, sm: 200 },
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'grey.200',
        }}
      >
        {collection.imageUrl ? (
          <Box
            component="img"
            src={collection.imageUrl}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1B2845 0%, #274060 50%, #1B6B93 100%)',
            }}
          />
        )}
      </Box>

      {/* Collection avatar + name */}
      <Stack sx={{ px: 3, mt: -4 }} direction="row" alignItems="flex-end" gap={2}>
        <Avatar
          variant="rounded"
          src={collection.imageUrl}
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
          {getInitials(collection.name)}
        </Avatar>
        <Stack gap={0.5} sx={{ flex: 1, pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {collection.name}
          </Typography>
          {collection.description && collection.description.length <= 120 && (
            <Typography variant="body2" color="text.secondary">
              {collection.description}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Back button + Published chip */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ px: 3, mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/home/badges')}
          sx={{ textTransform: 'none' }}
        >
          Back to Badges
        </Button>
        <Chip
          label={collection.published ? 'Published' : 'Draft'}
          size="small"
          color={collection.published ? 'success' : 'default'}
          variant="outlined"
        />
      </Stack>

      {/* Full description if long */}
      {collection.description && collection.description.length > 120 && (
        <Typography variant="body1" sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}>
          {collection.description}
        </Typography>
      )}

      {/* Meta row */}
      <Stack
        direction="row"
        gap={2}
        flexWrap="wrap"
        sx={{ px: 3, mt: 2, color: 'text.secondary' }}
      >
        <Stack direction="row" alignItems="center" gap={0.5}>
          <VerifiedOutlinedIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">
            {collection.badgeCount ?? 0} {collection.badgeCount === 1 ? 'badge' : 'badges'}
          </Typography>
        </Stack>
        {collection.createdAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">Created {formatDate(collection.createdAt)}</Typography>
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

      {/* Stats cards */}
      {collection.stats && (
        <Box sx={{ px: 3, mt: 4 }}>
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
            Collection Stats
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap">
            {([
              { label: 'Total Issuances', value: collection.stats.totalIssuances, icon: <AssignmentTurnedInOutlinedIcon /> },
              { label: 'Unique Learners', value: collection.stats.uniqueLearners, icon: <PeopleOutlinedIcon /> },
              { label: 'Badges', value: collection.stats.badgeCount, icon: <VerifiedOutlinedIcon /> },
              { label: 'Avg Completion', value: `${collection.stats.averageCompletionRate?.toFixed(1) ?? '—'}%`, icon: <TrendingUpOutlinedIcon /> },
            ] as const).map((stat) => (
              <Paper
                key={stat.label}
                variant="outlined"
                sx={{
                  p: 2.5,
                  width: { xs: 'calc(50% - 8px)', sm: 180 },
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 0.5 }}>{stat.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Badges in this collection */}
      {(collection.badgeSummaries?.length ?? 0) > 0 && (
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
            Badges
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap">
            {collection.badgeSummaries!.map((badge) => (
              <Paper
                key={badge.id}
                variant="outlined"
                sx={{
                  p: 2,
                  width: { xs: '100%', sm: 260 },
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={badge.imageUrl}
                  sx={{ width: 48, height: 48, borderRadius: 1.5 }}
                >
                  {getInitials(badge.name)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {badge.name}
                  </Typography>
                  {badge.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {badge.description}
                    </Typography>
                  )}
                  {badge.issuanceCount != null && (
                    <Chip
                      label={`${badge.issuanceCount.toLocaleString()} issued`}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

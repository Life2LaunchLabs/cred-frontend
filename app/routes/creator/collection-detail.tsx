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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import { useNavigate, useParams } from 'react-router';
import { getCollection } from '~/api/generated';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { CollectionDetail } from '~/api/generated';

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

export default function CreatorCollectionDetail() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [collection, setCollection] = React.useState<CollectionDetail | null>(null);
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
      } catch {
        if (!cancelled) {
          setError('Failed to load collection');
          setIsLoading(false);
        }
      }
    }

    fetchCollection();
    return () => { cancelled = true; };
  }, [collectionId]);

  const getPrimaryAction = () => {
    if (!collection) return null;
    const status = collection.status;

    if (status === 'draft') {
      return (
        <Button
          variant="contained"
          startIcon={<SendRoundedIcon />}
          onClick={() => navigate(orgPath(`/creator/collections/${collectionId}/submission`))}
          sx={{ textTransform: 'none' }}
        >
          Submit for Review
        </Button>
      );
    }
    if (status === 'changes_requested') {
      return (
        <Button
          variant="contained"
          color="warning"
          startIcon={<EditRoundedIcon />}
          onClick={() => navigate(orgPath(`/creator/collections/${collectionId}/submission`))}
          sx={{ textTransform: 'none' }}
        >
          Address Feedback
        </Button>
      );
    }
    if (status === 'approved') {
      return (
        <Button
          variant="outlined"
          color="success"
          onClick={() => {}}
          sx={{ textTransform: 'none' }}
        >
          Publish
        </Button>
      );
    }
    if (status === 'published') {
      return (
        <Button
          variant="outlined"
          color="warning"
          onClick={() => {}}
          sx={{ textTransform: 'none' }}
        >
          Unpublish
        </Button>
      );
    }
    return null;
  };

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
          onClick={() => navigate(orgPath('/creator/collections'))}
          sx={{ textTransform: 'none' }}
        >
          Back to Collections
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

      {/* Back button + status chip + primary CTA */}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ px: 3, mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/creator/collections'))}
          sx={{ textTransform: 'none' }}
        >
          Back to Collections
        </Button>
        <Chip
          label={STATUS_LABELS[collection.status ?? 'draft'] ?? collection.status}
          size="small"
          color={STATUS_COLORS[collection.status ?? 'draft'] ?? 'default'}
          variant="outlined"
        />
        <Box sx={{ flex: 1 }} />
        {getPrimaryAction()}
      </Stack>

      {/* Full description if long */}
      {collection.description && collection.description.length > 120 && (
        <Typography variant="body1" sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}>
          {collection.description}
        </Typography>
      )}

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
              { label: 'Issuer(s) Authorized', value: 0, icon: <LockOpenOutlinedIcon /> },
            ]).map((stat) => (
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

      {/* Badge roster */}
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
            Badges in this Collection
          </Typography>
          <Stack gap={1}>
            {collection.badgeSummaries!.map((badge) => (
              <Paper
                key={badge.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={badge.imageUrl}
                  sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: 'grey.300' }}
                >
                  {getInitials(badge.name)}
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
                    {badge.name}
                  </Typography>
                  {badge.issuanceCount != null && (
                    <Typography variant="caption" color="text.secondary">
                      {badge.issuanceCount.toLocaleString()} issued
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => navigate(orgPath(`/creator/badges/${badge.id}/edit`))}
                  sx={{ textTransform: 'none', flexShrink: 0 }}
                >
                  Edit Badge
                </Button>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

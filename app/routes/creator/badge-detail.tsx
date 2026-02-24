import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useNavigate, useParams } from 'react-router';
import { getBadge } from '~/api/generated';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { Badge } from '~/api/generated';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function CreatorBadgeDetail() {
  const { collectionId, badgeId } = useParams();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [badge, setBadge] = React.useState<Badge | null>(null);
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
      } catch {
        if (!cancelled) {
          setError('Failed to load badge');
          setIsLoading(false);
        }
      }
    }

    fetchBadge();
    return () => { cancelled = true; };
  }, [badgeId]);

  const backPath = collectionId
    ? orgPath(`/creator/collections/${collectionId}`)
    : orgPath('/creator/collections');

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
            <Skeleton key={i} variant="rounded" width="100%" height={52} />
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

      {/* Back button + Edit button */}
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ px: 3, mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(backPath)}
          sx={{ textTransform: 'none' }}
        >
          Back to Collection
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditRoundedIcon />}
          onClick={() => navigate(orgPath(`/creator/badges/${badgeId}/edit`))}
          sx={{ textTransform: 'none' }}
        >
          Edit Badge
        </Button>
      </Stack>

      {/* Full description if long */}
      {badge.description && badge.description.length > 120 && (
        <Typography variant="body1" sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}>
          {badge.description}
        </Typography>
      )}

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
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {badge.criteria!.map((criterion) => (
              <Paper
                key={criterion.id}
                variant="outlined"
                component={ListItem}
                sx={{ p: 1.5, borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {criterion.isRequired ? (
                    <CheckCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 22 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={criterion.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
                <Chip
                  label={criterion.isRequired ? 'Required' : 'Optional'}
                  size="small"
                  variant="outlined"
                  color={criterion.isRequired ? 'primary' : 'default'}
                  sx={{ height: 22, fontSize: '0.7rem', flexShrink: 0 }}
                />
              </Paper>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}

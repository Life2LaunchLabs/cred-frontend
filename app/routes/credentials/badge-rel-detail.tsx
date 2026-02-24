import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { useNavigate, useParams } from 'react-router';
import { getOrgBadgeRel } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { OrgBadgeRelDetail } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function BadgeRelDetail() {
  const { badgeRelId } = useParams<{ badgeRelId: string }>();
  const navigate = useNavigate();
  const orgPath = useOrgPath();
  const { activeOrg, isAdmin } = useOrg();

  const [rel, setRel] = React.useState<OrgBadgeRelDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!badgeRelId || !activeOrg) return;
    let cancelled = false;

    async function fetchRel() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getOrgBadgeRel(activeOrg!.org.id, badgeRelId!);
        if (!cancelled) {
          if (res.status === 200) {
            setRel(res.data);
          } else {
            setError('Badge relationship not found');
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load'); setIsLoading(false); }
      }
    }

    fetchRel();
    return () => { cancelled = true; };
  }, [badgeRelId, activeOrg]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 720, p: 3 }}>
        <Skeleton variant="rounded" width={72} height={72} sx={{ mb: 2 }} />
        <Skeleton width="50%" height={28} />
        <Skeleton width="80%" height={18} sx={{ mt: 1 }} />
        {[1, 2, 3].map((i) => <Skeleton key={i} height={40} sx={{ mt: 1 }} />)}
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

  const badge = rel.badge;
  const colRel = rel.collectionRel;
  const requiredCriteria = badge.criteria?.filter((c) => c.isRequired) ?? [];
  const optionalCriteria = badge.criteria?.filter((c) => !c.isRequired) ?? [];

  return (
    <Box sx={{ width: '100%', maxWidth: 720, pb: 4 }}>
      {/* Badge header */}
      <Stack direction="row" gap={2} alignItems="flex-start" sx={{ mb: 0.5 }}>
        <Avatar
          variant="rounded"
          src={badge.imageUrl}
          sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: 'grey.200', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}
        >
          {getInitials(badge.name)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{badge.name}</Typography>
          {badge.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 540 }}>
              {badge.description}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Back + status chips */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, mb: 2 }} flexWrap="wrap">
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath(`/credentials/collections/${colRel.id}`))}
          sx={{ textTransform: 'none' }}
        >
          {colRel.collection.name}
        </Button>
        <Chip
          label={rel.status.charAt(0).toUpperCase() + rel.status.slice(1)}
          size="small"
          color={rel.status === 'active' ? 'success' : rel.status === 'pending' ? 'warning' : 'default'}
          variant="outlined"
        />
        {rel.programCount > 0 && (
          <Chip
            label={`${rel.programCount} ${rel.programCount === 1 ? 'program' : 'programs'}`}
            size="small"
            variant="outlined"
          />
        )}
        {isAdmin && (
          <Button
            size="small"
            startIcon={<BarChartRoundedIcon />}
            onClick={() => navigate(orgPath(`/credentials/analytics/badges/${rel.id}`))}
            sx={{ ml: 'auto', textTransform: 'none' }}
          >
            Analytics
          </Button>
        )}
      </Stack>

      {/* Criteria */}
      {(requiredCriteria.length > 0 || optionalCriteria.length > 0) && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Criteria</Typography>

          {requiredCriteria.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                Required
              </Typography>
              <List dense disablePadding>
                {requiredCriteria.map((c) => (
                  <ListItem key={c.id} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleOutlineRoundedIcon color="primary" sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary={c.label} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {optionalCriteria.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', mt: requiredCriteria.length > 0 ? 1.5 : 0, display: 'block' }}>
                Optional
              </Typography>
              <List dense disablePadding>
                {optionalCriteria.map((c) => (
                  <ListItem key={c.id} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <RadioButtonUncheckedRoundedIcon color="disabled" sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={c.label}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}

      {/* Collection context */}
      <Box sx={{ mt: 2.5 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
          Part of collection
        </Typography>
        <Paper
          variant="outlined"
          onClick={() => navigate(orgPath(`/credentials/collections/${colRel.id}`))}
          sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
        >
          <Avatar variant="rounded" src={colRel.collection.imageUrl} sx={{ width: 36, height: 36, borderRadius: 1 }}>
            {getInitials(colRel.collection.name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{colRel.collection.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {colRel.collection.badgeCount ?? 0} badges
            </Typography>
          </Box>
          <Chip
            label={colRel.status.charAt(0).toUpperCase() + colRel.status.slice(1)}
            size="small"
            color={colRel.status === 'active' ? 'success' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Paper>
      </Box>

      {/* Used by programs */}
      {rel.programCount > 0 && (
        <Box sx={{ mt: 2.5 }}>
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

      {/* Admin controls */}
      {isAdmin && (
        <>
          <Divider sx={{ mt: 3 }} />
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Admin controls</Typography>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                size="small"
                color={rel.status === 'archived' ? 'primary' : 'warning'}
                disabled={rel.status === 'pending'}
                sx={{ textTransform: 'none' }}
              >
                {rel.status === 'archived' ? 'Unarchive badge' : 'Archive badge'}
              </Button>
              {isAdmin && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(orgPath('/credentials/catalog'))}
                  sx={{ textTransform: 'none' }}
                >
                  Find similar in catalog
                </Button>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { getOrgBadgeRelAnalytics } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { CredBadgeAnalytics } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function AnalyticsBadge() {
  const { badgeRelId } = useParams<{ badgeRelId: string }>();
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [data, setData] = React.useState<CredBadgeAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!badgeRelId || !activeOrg) return;
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getOrgBadgeRelAnalytics(activeOrg!.org.id, badgeRelId!);
        if (!cancelled) {
          if (res.status === 200) {
            setData(res.data);
          } else {
            setError('Analytics not found');
          }
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) { setError('Failed to load'); setIsLoading(false); }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [badgeRelId, activeOrg]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 720, p: 3 }}>
        <Skeleton variant="rounded" width={56} height={56} sx={{ mb: 2 }} />
        <Skeleton width="50%" height={28} />
        <Skeleton width="80%" height={18} sx={{ mt: 1 }} />
        {[1, 2].map((i) => <Skeleton key={i} height={56} sx={{ mt: 1.5 }} />)}
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error ?? 'Not found'}</Typography>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(orgPath('/credentials/analytics'))}>
          Back to Analytics
        </Button>
      </Box>
    );
  }

  const badge = data.badge;
  const requiredCriteria = badge.criteria?.filter((c) => c.isRequired) ?? [];
  const optionalCriteria = badge.criteria?.filter((c) => !c.isRequired) ?? [];

  return (
    <Box sx={{ width: '100%', maxWidth: 720, pb: 4 }}>
      {/* Header */}
      <Stack direction="row" gap={2} alignItems="flex-start" sx={{ mb: 0.5 }}>
        <Avatar
          variant="rounded"
          src={badge.imageUrl}
          sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: 'grey.200', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}
        >
          {getInitials(badge.name)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{badge.name}</Typography>
          {badge.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {badge.description}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Back + nav */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, mb: 2.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>
        <Button
          size="small"
          onClick={() => navigate(orgPath(`/credentials/badges/${badgeRelId}`))}
          sx={{ textTransform: 'none' }}
        >
          View in library
        </Button>
      </Stack>

      {/* Summary stat */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, display: 'inline-flex', gap: 1, alignItems: 'center' }}>
        <BarChartRoundedIcon color="primary" sx={{ fontSize: 20 }} />
        <Typography variant="body2">
          Used in <strong>{data.programCount}</strong> {data.programCount === 1 ? 'program' : 'programs'}
        </Typography>
      </Paper>

      {/* Programs */}
      {data.programs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Programs using this badge
          </Typography>
          <Stack gap={1}>
            {data.programs.map((program) => (
              <Paper
                key={program.id}
                variant="outlined"
                onClick={() => navigate(orgPath(`/credentials/programs/${program.id}`))}
                sx={{ p: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{program.name}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Criteria (for reference) */}
      {(requiredCriteria.length > 0 || optionalCriteria.length > 0) && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Criteria
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
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
                      <ListItemText primary={c.label} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

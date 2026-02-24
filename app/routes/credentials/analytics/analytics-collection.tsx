import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { useNavigate, useParams } from 'react-router';
import { getOrgCollectionRelAnalytics } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { CredCollectionAnalytics } from '~/api/generated';

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function AnalyticsCollection() {
  const { collectionRelId } = useParams<{ collectionRelId: string }>();
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [data, setData] = React.useState<CredCollectionAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!collectionRelId || !activeOrg) return;
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getOrgCollectionRelAnalytics(activeOrg!.org.id, collectionRelId!);
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
  }, [collectionRelId, activeOrg]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 720, p: 3 }}>
        <Skeleton width="60%" height={28} />
        <Skeleton width="40%" height={18} sx={{ mt: 1 }} />
        {[1, 2, 3].map((i) => <Skeleton key={i} height={56} sx={{ mt: 1.5 }} />)}
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

  return (
    <Box sx={{ width: '100%', maxWidth: 720, pb: 4 }}>
      {/* Header */}
      <Stack direction="row" gap={2} alignItems="flex-start" sx={{ mb: 0.5 }}>
        <Avatar
          variant="rounded"
          src={data.collection.imageUrl}
          sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'grey.200', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}
        >
          {getInitials(data.collection.name)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{data.collection.name}</Typography>
          <Typography variant="body2" color="text.secondary">Collection analytics</Typography>
        </Box>
      </Stack>

      {/* Back + breadcrumb */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, mb: 2.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(orgPath('/credentials/analytics'))}
          sx={{ textTransform: 'none' }}
        >
          Analytics
        </Button>
        <Button
          size="small"
          onClick={() => navigate(orgPath(`/credentials/collections/${collectionRelId}`))}
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
            Programs using this collection
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

      {/* Badge adoption */}
      {data.badgeAdoption.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
            Badge adoption
          </Typography>
          <Stack gap={1}>
            {data.badgeAdoption.map((item) => (
              <Paper
                key={item.badgeRelId}
                variant="outlined"
                onClick={() => navigate(orgPath(`/credentials/analytics/badges/${item.badgeRelId}`))}
                sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{item.badgeName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.programCount} {item.programCount === 1 ? 'program' : 'programs'}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

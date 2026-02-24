import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useNavigate } from 'react-router';
import { getOrgLibraryAnalytics } from '~/api/generated';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import type { CredLibraryAnalytics } from '~/api/generated';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 120 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  );
}

export default function Analytics() {
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [analytics, setAnalytics] = React.useState<CredLibraryAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchAnalytics() {
      setIsLoading(true);
      const res = await getOrgLibraryAnalytics(activeOrg!.org.id);
      if (!cancelled) {
        if (res.status === 200) setAnalytics(res.data);
        setIsLoading(false);
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [activeOrg]);

  return (
    <Box sx={{ width: '100%', maxWidth: 820, pb: 4 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 3 }} gap={2}>
        <Box>
          <Typography component="h2" variant="h6">Library Analytics</Typography>
          <Typography variant="body2" color="text.secondary">
            How your org is using the credential library
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(orgPath('/credentials'))}
          sx={{ textTransform: 'none', flexShrink: 0 }}
        >
          Back to Library
        </Button>
      </Stack>

      {/* Adoption funnel */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
        Adoption funnel
      </Typography>
      {isLoading ? (
        <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="rounded" width={120} height={68} />)}
        </Stack>
      ) : (
        <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
          <StatCard label="Viewed in catalog" value={analytics?.adoptionFunnel.viewedInCatalog ?? 0} />
          <StatCard label="Requested" value={analytics?.adoptionFunnel.requested ?? 0} />
          <StatCard label="Approved" value={analytics?.adoptionFunnel.approved ?? 0} />
          <StatCard label="Active in library" value={analytics?.adoptionFunnel.activeInLibrary ?? 0} />
          <StatCard label="Used in programs" value={analytics?.adoptionFunnel.referencedInPrograms ?? 0} />
        </Stack>
      )}

      {/* Summary stats */}
      <Stack direction="row" gap={2} sx={{ mb: 3 }} flexWrap="wrap">
        {isLoading ? (
          <>
            <Skeleton width={160} height={18} />
            <Skeleton width={180} height={18} />
          </>
        ) : (
          <>
            {(analytics?.unusedActiveCount ?? 0) > 0 && (
              <Typography variant="body2" color="warning.main">
                {analytics!.unusedActiveCount} active {analytics!.unusedActiveCount === 1 ? 'collection' : 'collections'} not yet used in any program
              </Typography>
            )}
            {(analytics?.avgTimeToApprovalDays ?? 0) > 0 && (
              <Typography variant="body2" color="text.secondary">
                Avg. time to approval: <strong>{analytics!.avgTimeToApprovalDays.toFixed(1)} days</strong>
              </Typography>
            )}
          </>
        )}
      </Stack>

      {/* Top collections */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
        Top collections by program usage
      </Typography>
      {isLoading ? (
        <Stack gap={1}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={56} sx={{ borderRadius: 1 }} />)}
        </Stack>
      ) : !analytics?.topCollections?.length ? (
        <Typography variant="body2" color="text.secondary">No data yet.</Typography>
      ) : (
        <Stack gap={1}>
          {analytics.topCollections.map((item) => (
            <Paper
              key={item.collectionRelId}
              variant="outlined"
              onClick={() => navigate(orgPath(`/credentials/analytics/collections/${item.collectionRelId}`))}
              sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
            >
              <BarChartRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{item.collectionName}</Typography>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <CheckCircleRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {item.programCount} {item.programCount === 1 ? 'program' : 'programs'}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

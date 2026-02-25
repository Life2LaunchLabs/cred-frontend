import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DateRange = '30d' | '90d' | '12m';
type ChartSplit = 'aggregate' | 'badge' | 'issuer';
type SortDir = 'asc' | 'desc';

interface BadgeRow {
  name: string;
  collection: string;
  issuances: number;
  change: number;
  activeIssuers: number;
  lifetime: number;
}

interface IssuerRow {
  org: string;
  issuances: number;
  distinctBadges: number;
  change: number;
  firstIssued: string;
}

interface SeriesEntry {
  label: string;
  color: string;
  data: Record<DateRange, number[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static fake data
// ─────────────────────────────────────────────────────────────────────────────

const KPI_DATA: Record<DateRange, {
  totalIssuances: number;
  activeIssuers: number;
  newIssuers: number;
  lifetimeIssuances: number;
  avgPerIssuer: number;
  revocations: number;
}> = {
  '30d': { totalIssuances: 342,  activeIssuers: 8, newIssuers: 1, lifetimeIssuances: 2406, avgPerIssuer: 42.8,  revocations: 3  },
  '90d': { totalIssuances: 937,  activeIssuers: 8, newIssuers: 3, lifetimeIssuances: 2406, avgPerIssuer: 117.1, revocations: 8  },
  '12m': { totalIssuances: 2406, activeIssuers: 8, newIssuers: 5, lifetimeIssuances: 2406, avgPerIssuer: 300.8, revocations: 16 },
};

const X_LABELS: Record<DateRange, string[]> = {
  '30d': ['Jan 27', 'Feb 3', 'Feb 10', 'Feb 17'],
  '90d': ['Nov 25', 'Dec 2', 'Dec 9', 'Dec 16', 'Dec 23', 'Dec 30', 'Jan 6', 'Jan 13', 'Jan 20', 'Jan 27', 'Feb 3', 'Feb 10', 'Feb 17'],
  '12m': ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
};

const AGG_DATA: Record<DateRange, number[]> = {
  '30d': [72, 88, 95, 87],
  '90d': [58, 65, 70, 62, 45, 55, 68, 75, 80, 72, 88, 95, 87],
  '12m': [120, 145, 138, 160, 175, 210, 195, 230, 260, 285, 310, 342],
};

const BADGE_SERIES: SeriesEntry[] = [
  {
    label: 'Python Fundamentals',
    color: '#1565c0',
    data: {
      '30d': [26, 32, 35, 35],
      '90d': [22, 24, 27, 23, 17, 21, 25, 28, 30, 26, 32, 35, 35],
      '12m': [45, 52, 48, 58, 65, 78, 72, 85, 95, 105, 115, 128],
    },
  },
  {
    label: 'Data Analysis I',
    color: '#2e7d32',
    data: {
      '30d': [20, 24, 27, 25],
      '90d': [16, 18, 20, 17, 12, 15, 19, 21, 23, 20, 24, 27, 25],
      '12m': [30, 35, 33, 40, 45, 55, 52, 62, 70, 78, 88, 96],
    },
  },
  {
    label: 'Cloud Practitioner',
    color: '#e65100',
    data: {
      '30d': [15, 18, 20, 19],
      '90d': [12, 14, 16, 13, 9, 12, 14, 16, 18, 15, 18, 20, 19],
      '12m': [22, 28, 25, 30, 35, 42, 38, 45, 52, 58, 65, 72],
    },
  },
  {
    label: 'Agile Foundations',
    color: '#6a1b9a',
    data: {
      '30d': [8, 10, 10, 9],
      '90d': [6, 7, 5, 7, 6, 5, 8, 8, 7, 8, 10, 10, 9],
      '12m': [15, 20, 18, 22, 18, 25, 23, 28, 32, 35, 30, 34],
    },
  },
  {
    label: 'Cybersec Basics',
    color: '#b71c1c',
    data: {
      '30d': [3, 4, 3, 4],
      '90d': [2, 2, 2, 2, 1, 2, 2, 2, 2, 3, 4, 3, 4],
      '12m': [8, 10, 14, 10, 12, 10, 10, 10, 11, 9, 12, 12],
    },
  },
];

const ISSUER_SERIES: SeriesEntry[] = [
  {
    label: 'TechCorp Training',
    color: '#1565c0',
    data: {
      '30d': [28, 35, 38, 33],
      '90d': [22, 25, 27, 24, 18, 22, 25, 28, 32, 28, 35, 38, 33],
      '12m': [45, 55, 52, 60, 65, 80, 75, 88, 100, 110, 118, 128],
    },
  },
  {
    label: 'Apex Learning Co.',
    color: '#2e7d32',
    data: {
      '30d': [22, 28, 30, 26],
      '90d': [18, 20, 22, 19, 14, 17, 20, 23, 26, 22, 28, 30, 26],
      '12m': [36, 45, 42, 50, 52, 65, 60, 70, 78, 85, 92, 102],
    },
  },
  {
    label: 'Meridian Institute',
    color: '#e65100',
    data: {
      '30d': [15, 18, 20, 19],
      '90d': [13, 14, 16, 13, 10, 12, 15, 16, 18, 15, 18, 20, 19],
      '12m': [25, 30, 28, 33, 36, 42, 38, 45, 50, 52, 55, 60],
    },
  },
  {
    label: 'Horizon Academy',
    color: '#00695c',
    data: {
      '30d': [5, 5, 5, 7],
      '90d': [4, 5, 4, 5, 3, 4, 5, 6, 3, 5, 5, 5, 7],
      '12m': [8, 8, 10, 10, 12, 14, 14, 16, 18, 22, 20, 22],
    },
  },
  {
    label: 'Stellar Education',
    color: '#6a1b9a',
    data: {
      '30d': [2, 2, 2, 2],
      '90d': [1, 1, 1, 1, 0, 0, 3, 2, 1, 2, 2, 2, 2],
      '12m': [6, 7, 6, 7, 10, 9, 8, 11, 14, 16, 25, 30],
    },
  },
];

const TOP_BADGES: Record<DateRange, BadgeRow[]> = {
  '30d': [
    { name: 'Python Fundamentals', collection: 'Software Dev',  issuances: 128, change:  11, activeIssuers: 6, lifetime: 892 },
    { name: 'Data Analysis I',     collection: 'Data Science',  issuances:  96, change:   9, activeIssuers: 5, lifetime: 674 },
    { name: 'Cloud Practitioner',  collection: 'Cloud & Infra', issuances:  72, change:  24, activeIssuers: 4, lifetime: 421 },
    { name: 'Agile Foundations',   collection: 'Project Mgmt',  issuances:  34, change: -14, activeIssuers: 3, lifetime: 285 },
    { name: 'Cybersec Basics',     collection: 'Security',      issuances:  12, change:  33, activeIssuers: 2, lifetime: 134 },
  ],
  '90d': [
    { name: 'Python Fundamentals', collection: 'Software Dev',  issuances: 370, change:  15, activeIssuers: 6, lifetime: 892 },
    { name: 'Data Analysis I',     collection: 'Data Science',  issuances: 280, change:  12, activeIssuers: 5, lifetime: 674 },
    { name: 'Cloud Practitioner',  collection: 'Cloud & Infra', issuances: 210, change:  18, activeIssuers: 4, lifetime: 421 },
    { name: 'Agile Foundations',   collection: 'Project Mgmt',  issuances:  86, change:  -8, activeIssuers: 3, lifetime: 285 },
    { name: 'Cybersec Basics',     collection: 'Security',      issuances:  31, change:   5, activeIssuers: 2, lifetime: 134 },
  ],
  '12m': [
    { name: 'Python Fundamentals', collection: 'Software Dev',  issuances: 892, change:  28, activeIssuers: 6, lifetime: 892 },
    { name: 'Data Analysis I',     collection: 'Data Science',  issuances: 674, change:  22, activeIssuers: 5, lifetime: 674 },
    { name: 'Cloud Practitioner',  collection: 'Cloud & Infra', issuances: 421, change:  35, activeIssuers: 4, lifetime: 421 },
    { name: 'Agile Foundations',   collection: 'Project Mgmt',  issuances: 285, change:  -5, activeIssuers: 3, lifetime: 285 },
    { name: 'Cybersec Basics',     collection: 'Security',      issuances: 134, change:  12, activeIssuers: 2, lifetime: 134 },
  ],
};

const TOP_ISSUERS: Record<DateRange, IssuerRow[]> = {
  '30d': [
    { org: 'TechCorp Training',   issuances: 134, distinctBadges: 5, change:   18, firstIssued: 'Mar 2024' },
    { org: 'Apex Learning Co.',   issuances: 106, distinctBadges: 4, change:   32, firstIssued: 'May 2024' },
    { org: 'Meridian Institute',  issuances:  72, distinctBadges: 3, change:   -5, firstIssued: 'Jun 2024' },
    { org: 'Horizon Academy',     issuances:  22, distinctBadges: 4, change:   12, firstIssued: 'Jul 2024' },
    { org: 'Stellar Education',   issuances:   8, distinctBadges: 2, change:   41, firstIssued: 'Sep 2024' },
    { org: 'Zenith Skills Lab',   issuances:   0, distinctBadges: 0, change: -100, firstIssued: 'Aug 2024' },
    { org: 'Peak Performance',    issuances:   0, distinctBadges: 0, change: -100, firstIssued: 'Oct 2024' },
    { org: 'Nexus Ed Group',      issuances:   0, distinctBadges: 0, change: -100, firstIssued: 'Nov 2024' },
  ],
  '90d': [
    { org: 'TechCorp Training',   issuances: 387, distinctBadges: 5, change:  15, firstIssued: 'Mar 2024' },
    { org: 'Apex Learning Co.',   issuances: 312, distinctBadges: 4, change:  22, firstIssued: 'May 2024' },
    { org: 'Meridian Institute',  issuances: 144, distinctBadges: 3, change:  -8, firstIssued: 'Jun 2024' },
    { org: 'Horizon Academy',     issuances:  56, distinctBadges: 4, change:  10, firstIssued: 'Jul 2024' },
    { org: 'Stellar Education',   issuances:  24, distinctBadges: 2, change:  60, firstIssued: 'Sep 2024' },
    { org: 'Zenith Skills Lab',   issuances:  14, distinctBadges: 2, change:   8, firstIssued: 'Aug 2024' },
    { org: 'Peak Performance',    issuances:   0, distinctBadges: 0, change: -100, firstIssued: 'Oct 2024' },
    { org: 'Nexus Ed Group',      issuances:   0, distinctBadges: 0, change: -100, firstIssued: 'Nov 2024' },
  ],
  '12m': [
    { org: 'TechCorp Training',   issuances: 856, distinctBadges: 5, change:  28, firstIssued: 'Mar 2024' },
    { org: 'Apex Learning Co.',   issuances: 612, distinctBadges: 4, change:  32, firstIssued: 'May 2024' },
    { org: 'Meridian Institute',  issuances: 447, distinctBadges: 3, change:  -5, firstIssued: 'Jun 2024' },
    { org: 'Horizon Academy',     issuances: 180, distinctBadges: 4, change:  12, firstIssued: 'Jul 2024' },
    { org: 'Stellar Education',   issuances: 142, distinctBadges: 2, change:  41, firstIssued: 'Sep 2024' },
    { org: 'Zenith Skills Lab',   issuances:  87, distinctBadges: 3, change:   8, firstIssued: 'Aug 2024' },
    { org: 'Peak Performance',    issuances:  64, distinctBadges: 2, change: -12, firstIssued: 'Oct 2024' },
    { org: 'Nexus Ed Group',      issuances:  45, distinctBadges: 1, change:  22, firstIssued: 'Nov 2024' },
  ],
};

const ISSUER_BAR_LABELS = ['TechCorp', 'Apex Learning', 'Meridian', 'Horizon', 'Stellar', 'Zenith', 'Peak Perf', 'Nexus Ed'];
const ISSUER_BAR_DATA: Record<DateRange, number[]> = {
  '30d': [134, 106,  72, 22,   8,  0,  0,  0],
  '90d': [387, 312, 144, 56,  24, 14,  0,  0],
  '12m': [856, 612, 447, 180, 142, 87, 64, 45],
};

const CONCENTRATION: Record<DateRange, string> = {
  '30d': 'Top 2 issuers = 70% of volume · 5 issuers active',
  '90d': 'Top 2 issuers = 74% of volume · 6 issuers active',
  '12m': 'Top 3 issuers = 80% of volume · 8 issuers active',
};

const ENGAGEMENT: Record<DateRange, {
  verificationViews: number;
  shares: number;
  viewToIssuanceRatio: number;
  topBadge: string;
}> = {
  '30d': { verificationViews: 1247, shares:  312, viewToIssuanceRatio: 3.6, topBadge: 'Python Fundamentals' },
  '90d': { verificationViews: 3842, shares:  987, viewToIssuanceRatio: 4.1, topBadge: 'Python Fundamentals' },
  '12m': { verificationViews: 9210, shares: 2345, viewToIssuanceRatio: 3.8, topBadge: 'Python Fundamentals' },
};

const FUNNEL_STEPS = [
  { label: 'Auth Requests Received',   value: 24 },
  { label: 'Approved',                 value: 18 },
  { label: 'Activated by Issuer',      value: 15 },
  { label: 'First Issuance Completed', value: 12 },
  { label: 'Ongoing (≥ 5 / mo)',       value:  8 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sortRows<T>(rows: T[], col: keyof T, dir: SortDir): T[] {
  return [...rows].sort((a, b) => {
    const av = a[col] as string | number;
    const bv = b[col] as string | number;
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av;
    }
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}

function fmt(n: number): string {
  return n.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: '1 1 130px', minWidth: 120 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {typeof value === 'number' ? fmt(value) : value}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.disabled" display="block">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

function ChangeChip({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <Chip
      size="small"
      icon={up ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
      label={`${up ? '+' : ''}${value}%`}
      color={up ? 'success' : 'error'}
      variant="outlined"
      sx={{ fontSize: '0.68rem', height: 20 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CreatorAnalytics() {
  const [dateRange, setDateRange] = React.useState<DateRange>('30d');
  const [chartSplit, setChartSplit] = React.useState<ChartSplit>('aggregate');

  const [badgeSortCol, setBadgeSortCol] = React.useState<keyof BadgeRow>('issuances');
  const [badgeSortDir, setBadgeSortDir] = React.useState<SortDir>('desc');

  const [issuerSortCol, setIssuerSortCol] = React.useState<keyof IssuerRow>('issuances');
  const [issuerSortDir, setIssuerSortDir] = React.useState<SortDir>('desc');

  const kpi = KPI_DATA[dateRange];
  const xLabels = X_LABELS[dateRange];
  const engagement = ENGAGEMENT[dateRange];

  const chartSeries = React.useMemo(() => {
    if (chartSplit === 'aggregate') {
      return [{
        data: AGG_DATA[dateRange],
        label: 'Total Issuances',
        area: true,
        showMark: false,
        color: '#1565c0',
      }];
    }
    const source = chartSplit === 'badge' ? BADGE_SERIES : ISSUER_SERIES;
    return source.map((s) => ({
      data: s.data[dateRange],
      label: s.label,
      color: s.color,
      showMark: false,
    }));
  }, [dateRange, chartSplit]);

  const sortedBadges = React.useMemo(
    () => sortRows(TOP_BADGES[dateRange], badgeSortCol, badgeSortDir),
    [dateRange, badgeSortCol, badgeSortDir],
  );
  const sortedIssuers = React.useMemo(
    () => sortRows(TOP_ISSUERS[dateRange], issuerSortCol, issuerSortDir),
    [dateRange, issuerSortCol, issuerSortDir],
  );

  function handleBadgeSort(col: keyof BadgeRow) {
    if (col === badgeSortCol) setBadgeSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setBadgeSortCol(col); setBadgeSortDir('desc'); }
  }
  function handleIssuerSort(col: keyof IssuerRow) {
    if (col === issuerSortCol) setIssuerSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setIssuerSortCol(col); setIssuerSortDir('desc'); }
  }

  const funnelMax = FUNNEL_STEPS[0].value;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>

      {/* ── A. Global Controls ─────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography component="h2" variant="h6">
          Badge Creator Analytics
        </Typography>
        <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={dateRange}
            exclusive
            onChange={(_, v) => v && setDateRange(v)}
          >
            <ToggleButton value="30d" sx={{ textTransform: 'none', px: 1.5 }}>Last 30d</ToggleButton>
            <ToggleButton value="90d" sx={{ textTransform: 'none', px: 1.5 }}>Last 90d</ToggleButton>
            <ToggleButton value="12m" sx={{ textTransform: 'none', px: 1.5 }}>Last 12m</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Export CSV (demo — no file generated)">
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              sx={{ textTransform: 'none' }}
            >
              Export
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── B. KPI Strip ───────────────────────────────────────────────────── */}
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mb: 4 }}>
        <KpiCard label="Total Issuances"    value={kpi.totalIssuances}           sub="this period" />
        <KpiCard label="Active Issuers"     value={kpi.activeIssuers} />
        <KpiCard label="New Issuers"        value={kpi.newIssuers}               sub="joined this period" />
        <KpiCard label="Lifetime Issuances" value={kpi.lifetimeIssuances} />
        <KpiCard label="Avg / Issuer"       value={kpi.avgPerIssuer.toFixed(1)}  sub="this period" />
        <KpiCard label="Revocations"        value={kpi.revocations} />
      </Stack>

      {/* ── C. Issuer Breakdown Explorer ───────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'flex-start' }}
          justifyContent="space-between"
          gap={2}
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Issuer Breakdown
          </Typography>
          <Box sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Concentration ratio
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {CONCENTRATION[dateRange]}
            </Typography>
          </Box>
        </Stack>
        <BarChart
          layout="horizontal"
          yAxis={[{ data: ISSUER_BAR_LABELS, scaleType: 'band' }]}
          series={[{ data: ISSUER_BAR_DATA[dateRange], label: 'Issuances', color: '#1565c0' }]}
          height={320}
          margin={{ left: 110, right: 30, top: 10, bottom: 30 }}
        />
      </Paper>

      {/* ── D. Top Performers ─────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Most Issued Badges */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Most Issued Badges
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={badgeSortCol === 'name'}
                        direction={badgeSortCol === 'name' ? badgeSortDir : 'asc'}
                        onClick={() => handleBadgeSort('name')}
                      >Badge</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={badgeSortCol === 'issuances'}
                        direction={badgeSortCol === 'issuances' ? badgeSortDir : 'desc'}
                        onClick={() => handleBadgeSort('issuances')}
                      >Issuances</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">vs Prior</TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={badgeSortCol === 'activeIssuers'}
                        direction={badgeSortCol === 'activeIssuers' ? badgeSortDir : 'desc'}
                        onClick={() => handleBadgeSort('activeIssuers')}
                      >Issuers</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={badgeSortCol === 'lifetime'}
                        direction={badgeSortCol === 'lifetime' ? badgeSortDir : 'desc'}
                        onClick={() => handleBadgeSort('lifetime')}
                      >Lifetime</TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedBadges.map((row) => (
                    <TableRow key={row.name} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.collection}</Typography>
                      </TableCell>
                      <TableCell align="right">{fmt(row.issuances)}</TableCell>
                      <TableCell align="right"><ChangeChip value={row.change} /></TableCell>
                      <TableCell align="right">{row.activeIssuers}</TableCell>
                      <TableCell align="right">{fmt(row.lifetime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        {/* Most Active Issuers */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Most Active Issuers
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={issuerSortCol === 'org'}
                        direction={issuerSortCol === 'org' ? issuerSortDir : 'asc'}
                        onClick={() => handleIssuerSort('org')}
                      >Issuer Org</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={issuerSortCol === 'issuances'}
                        direction={issuerSortCol === 'issuances' ? issuerSortDir : 'desc'}
                        onClick={() => handleIssuerSort('issuances')}
                      >Issuances</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={issuerSortCol === 'distinctBadges'}
                        direction={issuerSortCol === 'distinctBadges' ? issuerSortDir : 'desc'}
                        onClick={() => handleIssuerSort('distinctBadges')}
                      >Badges</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">vs Prior</TableCell>
                    <TableCell align="right">Since</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedIssuers.map((row) => (
                    <TableRow key={row.org} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.org}</Typography>
                      </TableCell>
                      <TableCell align="right">{fmt(row.issuances)}</TableCell>
                      <TableCell align="right">{row.distinctBadges}</TableCell>
                      <TableCell align="right">
                        {row.change === -100
                          ? <Chip size="small" label="Inactive" sx={{ fontSize: '0.65rem', height: 20 }} />
                          : <ChangeChip value={row.change} />
                        }
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="text.secondary">{row.firstIssued}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── E. Issuance Over Time ──────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Issuance Over Time
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={chartSplit}
            exclusive
            onChange={(_, v) => v && setChartSplit(v)}
          >
            <ToggleButton value="aggregate" sx={{ textTransform: 'none', px: 1.5 }}>Aggregate</ToggleButton>
            <ToggleButton value="badge"     sx={{ textTransform: 'none', px: 1.5 }}>By Badge</ToggleButton>
            <ToggleButton value="issuer"    sx={{ textTransform: 'none', px: 1.5 }}>By Issuer</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <LineChart
          xAxis={[{ data: xLabels, scaleType: 'point' }]}
          series={chartSeries}
          height={300}
          margin={{ left: 55, right: 20, top: 20, bottom: 30 }}
        />
      </Paper>

      {/* ── F. Engagement Metrics ──────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Engagement Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {fmt(engagement.verificationViews)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Verification link views</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {fmt(engagement.shares)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Social shares</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {engagement.viewToIssuanceRatio}×
            </Typography>
            <Typography variant="body2" color="text.secondary">View-to-issuance ratio</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {engagement.topBadge}
            </Typography>
            <Typography variant="body2" color="text.secondary">Most verified badge</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ── G. Adoption Funnel ─────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Adoption Funnel
        </Typography>
        <Stack gap={1.5}>
          {FUNNEL_STEPS.map((step, i) => {
            const pct = Math.round((step.value / funnelMax) * 100);
            const prev = FUNNEL_STEPS[i - 1];
            const dropoff = prev
              ? Math.round(((prev.value - step.value) / prev.value) * 100)
              : null;

            return (
              <Box key={step.label}>
                {dropoff !== null && (
                  <Typography variant="caption" color="text.disabled" sx={{ ml: '204px' }}>
                    ↓ {dropoff}% drop-off
                  </Typography>
                )}
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1.5}
                  sx={{ mt: dropoff !== null ? 0.5 : 0 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 196, fontWeight: i === 0 ? 600 : 400 }}
                  >
                    {step.label}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 28,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: i === 0
                            ? 'primary.main'
                            : i === FUNNEL_STEPS.length - 1
                              ? 'success.main'
                              : 'primary.light',
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'right', fontWeight: 600 }}>
                    {step.value}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Paper>

    </Box>
  );
}

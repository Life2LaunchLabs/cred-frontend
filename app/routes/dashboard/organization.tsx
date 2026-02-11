import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import { useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { getOrg, getOrgStats, listOrgMembers } from '~/api/generated';
import type { Org, OrgStats, OrgMemberDetail } from '~/api/generated';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  issuer: 'Issuer',
  viewer: 'Viewer',
};

const ROLE_ORDER: Record<string, number> = {
  owner: 0,
  admin: 1,
  issuer: 2,
  viewer: 3,
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

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function Organization() {
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [org, setOrg] = React.useState<Org | null>(null);
  const [stats, setStats] = React.useState<OrgStats | null>(null);
  const [members, setMembers] = React.useState<OrgMemberDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchOrg() {
      setIsLoading(true);
      const res = await getOrg(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setOrg(res.data);
      }
      if (!cancelled) setIsLoading(false);
    }

    fetchOrg();
    return () => { cancelled = true; };
  }, [activeOrg]);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchStats() {
      const res = await getOrgStats(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setStats(res.data);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [activeOrg]);

  React.useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;

    async function fetchMembers() {
      const res = await listOrgMembers(activeOrg!.org.id);
      if (!cancelled && res.status === 200) {
        setMembers(res.data.data);
      }
    }

    fetchMembers();
    return () => { cancelled = true; };
  }, [activeOrg]);

  if (!activeOrg) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900, p: 3 }}>
        <Typography color="text.secondary">
          No organization selected. Please select an organization from the sidebar.
        </Typography>
      </Box>
    );
  }

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

  if (!org) return null;

  const hasSocials =
    org.socialLinks &&
    (org.socialLinks.linkedin || org.socialLinks.website || org.socialLinks.x);

  const sortedMembers = [...members]
    .sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9));

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
        {org.coverImageUrl ? (
          <Box
            component="img"
            src={org.coverImageUrl}
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

      {/* Logo + name row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'center', sm: 'flex-end' }}
        sx={{ px: 3, mt: { xs: -5, sm: -4 }, gap: { xs: 1, sm: 2.5 } }}
      >
        <Avatar
          variant="rounded"
          src={org.imageUrl}
          alt={org.name}
          sx={{
            width: { xs: 88, sm: 96 },
            height: { xs: 88, sm: 96 },
            fontSize: 28,
            fontWeight: 700,
            borderRadius: 2,
            border: '4px solid',
            borderColor: 'background.paper',
            boxShadow: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {getInitials(org.name)}
        </Avatar>

        <Stack
          sx={{
            flex: 1,
            pb: { sm: 0.5 },
            textAlign: { xs: 'center', sm: 'left' },
            minWidth: 0,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {org.name}
          </Typography>
          {org.about && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {org.about.length > 120 ? org.about.slice(0, 120) + '\u2026' : org.about}
            </Typography>
          )}
        </Stack>

        {isAdmin && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(orgPath('/organization/settings'))}
            sx={{
              alignSelf: { xs: 'center', sm: 'flex-end' },
              mb: { sm: 0.5 },
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Edit organization
          </Button>
        )}
      </Stack>

      {/* Meta row */}
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        sx={{
          px: 3,
          mt: 1.5,
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        {org.location && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {org.location}
            </Typography>
          </Stack>
        )}
        {org.createdAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Founded {formatDate(org.createdAt)}
            </Typography>
          </Stack>
        )}
        {org.contactEmail && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {org.contactEmail}
            </Typography>
          </Stack>
        )}
        {org.phone && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <PhoneOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {org.phone}
            </Typography>
          </Stack>
        )}
        {org.website && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <LanguageRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              component="a"
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {safeHostname(org.website)}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Full about text */}
      {org.about && org.about.length > 120 && (
        <Typography
          variant="body1"
          sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}
        >
          {org.about}
        </Typography>
      )}

      {/* Social links */}
      {hasSocials && (
        <Stack direction="row" gap={1} sx={{ px: 3, mt: 2, flexWrap: 'wrap' }}>
          {org.socialLinks!.linkedin && (
            <Chip
              component="a"
              href={org.socialLinks!.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              label="LinkedIn"
              icon={<LaunchRoundedIcon sx={{ fontSize: '14px !important' }} />}
              variant="outlined"
              size="small"
            />
          )}
          {org.socialLinks!.website && (
            <Chip
              component="a"
              href={org.socialLinks!.website}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              label={safeHostname(org.socialLinks!.website)}
              icon={<LaunchRoundedIcon sx={{ fontSize: '14px !important' }} />}
              variant="outlined"
              size="small"
            />
          )}
          {org.socialLinks!.x && (
            <Chip
              component="a"
              href={org.socialLinks!.x}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              label="X"
              icon={<LaunchRoundedIcon sx={{ fontSize: '14px !important' }} />}
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      )}

      {/* Stats cards */}
      {stats && (
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
            Overview
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap">
            {([
              { label: 'Badges', value: stats.totalBadges, icon: <VerifiedOutlinedIcon /> },
              { label: 'Learners', value: stats.totalLearners, icon: <SchoolOutlinedIcon /> },
              { label: 'Staff', value: stats.totalMembers, icon: <PeopleOutlinedIcon /> },
              { label: 'Issuances', value: stats.totalIssuances, icon: <AssignmentTurnedInOutlinedIcon /> },
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
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Staff members */}
      {sortedMembers.length > 0 && (
        <Box sx={{ px: 3, mt: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.75rem',
              }}
            >
              Staff
            </Typography>
            {sortedMembers.length > 6 && (
              <Button
                size="small"
                onClick={() => navigate(orgPath('/organization/staff'))}
                sx={{ textTransform: 'none' }}
              >
                View all ({sortedMembers.length})
              </Button>
            )}
          </Stack>
          <Stack direction="row" gap={2} flexWrap="wrap">
            {sortedMembers.slice(0, 6).map((member) => (
              <Paper
                key={member.id}
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
                  src={member.user?.profileImageUrl}
                  sx={{ width: 40, height: 40 }}
                >
                  {member.user?.name ? getInitials(member.user.name) : '?'}
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
                    {member.user?.name ?? member.user?.email ?? 'Unknown'}
                  </Typography>
                  <Chip
                    label={ROLE_LABELS[member.role] ?? member.role}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.25, height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

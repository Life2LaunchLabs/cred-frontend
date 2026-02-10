import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { useOrg } from '~/context/OrgContext';
import { getUser } from '~/api/generated';
import type { User } from '~/api/generated';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  issuer: 'Issuer',
  viewer: 'Viewer',
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

function formatJoinDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function UserProfile() {
  const { user: authUser } = useAuth();
  const { orgs } = useOrg();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!authUser) return;
    let cancelled = false;

    async function fetchProfile() {
      setIsLoading(true);
      const res = await getUser(authUser!.id);
      if (!cancelled && res.status === 200) {
        setProfile(res.data);
      }
      setIsLoading(false);
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [authUser]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        <Stack sx={{ px: 3, mt: -4 }} direction="row" alignItems="flex-end" gap={2}>
          <Skeleton variant="circular" width={96} height={96} />
          <Stack gap={1} sx={{ flex: 1, pb: 1 }}>
            <Skeleton width={180} height={28} />
            <Skeleton width={240} height={18} />
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (!profile) return null;

  const hasSocials = profile.socialLinks && (
    profile.socialLinks.linkedin || profile.socialLinks.website || profile.socialLinks.x
  );

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
        {profile.coverImageUrl ? (
          <Box
            component="img"
            src={profile.coverImageUrl}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #4876EE 0%, #00D3AB 100%)',
            }}
          />
        )}
      </Box>

      {/* Avatar + name row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'center', sm: 'flex-end' }}
        sx={{ px: 3, mt: { xs: -5, sm: -4 }, gap: { xs: 1, sm: 2.5 } }}
      >
        <Avatar
          src={profile.profileImageUrl}
          alt={profile.name ?? profile.email}
          sx={{
            width: { xs: 88, sm: 96 },
            height: { xs: 88, sm: 96 },
            fontSize: 32,
            fontWeight: 700,
            border: '4px solid',
            borderColor: 'background.paper',
            boxShadow: 1,
          }}
        >
          {profile.name ? getInitials(profile.name) : null}
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
            {profile.name ?? profile.email}
          </Typography>
          {profile.title && (
            <Typography variant="body2" color="text.secondary">
              {profile.title}
            </Typography>
          )}
        </Stack>

        <Button
          variant="outlined"
          size="small"
          startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/home/user/settings')}
          sx={{
            alignSelf: { xs: 'center', sm: 'flex-end' },
            mb: { sm: 0.5 },
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Edit profile
        </Button>
      </Stack>

      {/* Meta row: location, joined date */}
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
        {profile.location && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {profile.location}
            </Typography>
          </Stack>
        )}
        {profile.createdAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Joined {formatJoinDate(profile.createdAt)}
            </Typography>
          </Stack>
        )}
        {profile.email && (
          <Typography variant="body2" color="text.secondary">
            {profile.email}
          </Typography>
        )}
      </Stack>

      {/* Bio */}
      {profile.bio && (
        <Typography
          variant="body1"
          sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}
        >
          {profile.bio}
        </Typography>
      )}

      {/* Social links */}
      {hasSocials && (
        <Stack direction="row" gap={1} sx={{ px: 3, mt: 2, flexWrap: 'wrap' }}>
          {profile.socialLinks!.linkedin && (
            <Chip
              component="a"
              href={profile.socialLinks!.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              label="LinkedIn"
              icon={<LaunchRoundedIcon sx={{ fontSize: '14px !important' }} />}
              variant="outlined"
              size="small"
            />
          )}
          {profile.socialLinks!.website && (
            <Chip
              component="a"
              href={profile.socialLinks!.website}
              target="_blank"
              rel="noopener noreferrer"
              clickable
              label={new URL(profile.socialLinks!.website).hostname}
              icon={<LaunchRoundedIcon sx={{ fontSize: '14px !important' }} />}
              variant="outlined"
              size="small"
            />
          )}
          {profile.socialLinks!.x && (
            <Chip
              component="a"
              href={profile.socialLinks!.x}
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

      {/* Organizations */}
      {orgs.length > 0 && (
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
            Organizations
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap">
            {orgs.map(({ org, membership }) => (
              <Paper
                key={org.id}
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
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                  }}
                >
                  <BusinessRoundedIcon sx={{ fontSize: 20 }} />
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
                    {org.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ROLE_LABELS[membership.role] ?? membership.role}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

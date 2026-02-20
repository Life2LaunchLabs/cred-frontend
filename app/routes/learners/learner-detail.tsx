import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiLink from '@mui/material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useParams, useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import { getOrgLearner, listLearnerProgramAssignments } from '~/api/generated';
import type { OrgLearnerDetail, LearnerProgramAssignmentDetail } from '~/api/generated';

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

export default function LearnerDetailPage() {
  const { learnerId } = useParams();
  const { activeOrg } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [learnerDetail, setLearnerDetail] = React.useState<OrgLearnerDetail | null>(null);
  const [assignments, setAssignments] = React.useState<LearnerProgramAssignmentDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const completedBadgeIds = React.useMemo(() => {
    const ids = new Set<string>();
    learnerDetail?.badgeProgress?.forEach((bp) => {
      if (bp.status === 'complete') ids.add(bp.badgeId);
    });
    return ids;
  }, [learnerDetail]);

  React.useEffect(() => {
    if (!activeOrg || !learnerId) return;
    let cancelled = false;

    async function fetchAll() {
      try {
        setIsLoading(true);

        // Fetch learner (supports lookup by ID or slug)
        const detailRes = await getOrgLearner(activeOrg!.org.id, learnerId!);
        if (cancelled || detailRes.status !== 200) return;
        const detail = detailRes.data as OrgLearnerDetail;
        if (!cancelled) setLearnerDetail(detail);

        // Fetch program assignments using real learner ID
        const assignmentsRes = await listLearnerProgramAssignments(activeOrg!.org.id, detail.learnerId);
        if (cancelled || assignmentsRes.status !== 200) return;
        const data = (assignmentsRes.data as { data: LearnerProgramAssignmentDetail[] }).data;
        if (!cancelled) setAssignments(data);
      } catch (error) {
        console.error('Error fetching learner data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [activeOrg, learnerId]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (!learnerDetail) {
    return (
      <Box sx={{ width: '100%', maxWidth: 900 }}>
        <Typography variant="body2" color="text.secondary">Learner not found</Typography>
      </Box>
    );
  }

  const learner = learnerDetail.learner;
  const name = learner?.name ?? 'Unknown';

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
        {learner?.coverImageUrl ? (
          <Box
            component="img"
            src={learner.coverImageUrl}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
          src={learner?.profileImageUrl}
          alt={name}
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
          {getInitials(name)}
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
            {name}
          </Typography>
          {learner?.title && (
            <Typography variant="body2" color="text.secondary">
              {learner.title}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Meta row */}
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        sx={{ px: 3, mt: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}
      >
        {learner?.email && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <EmailOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{learner.email}</Typography>
          </Stack>
        )}
        {learner?.location && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">{learner.location}</Typography>
          </Stack>
        )}
        {learner?.createdAt && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Joined {formatJoinDate(learner.createdAt)}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Bio */}
      {learner?.bio && (
        <Typography variant="body1" sx={{ px: 3, mt: 2, lineHeight: 1.6, maxWidth: 640 }}>
          {learner.bio}
        </Typography>
      )}

      {/* Programs */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Programs
        </Typography>

        {assignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No programs assigned yet
          </Typography>
        ) : (
          <Stack spacing={1}>
            {assignments.map((asn) => {
              const progress = asn.progress;
              const completions = new Set(
                progress?.checkpointCompletions?.map((c) => c.checkpointId) ?? []
              );
              const phases = asn.program?.phases ?? [];

              return (
                <Accordion
                  key={asn.id}
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { borderColor: 'primary.main' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1.5}
                      sx={{ flex: 1, minWidth: 0, mr: 1 }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asn.program?.name ?? 'Unknown Program'}
                      </Typography>
                      {asn.completedAt && (
                        <Chip label="Completed" color="success" size="small" />
                      )}
                      {progress && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          {progress.checkpointsSigned}/{progress.checkpointsTotal} ckpts
                          {' · '}
                          {progress.badgesEarned}/{progress.badgesTotal} badges
                        </Typography>
                      )}
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      {phases.map((phase) => (
                        <Box key={phase.id}>
                          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <Chip
                              label={`Phase ${phase.order + 1}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {phase.name}
                            </Typography>
                          </Stack>

                          {/* Badges */}
                          {phase.badges.length > 0 && (
                            <List dense disablePadding sx={{ mb: 1 }}>
                              {phase.badges.map((badge) => {
                                const earned = completedBadgeIds.has(badge.id);
                                return (
                                  <ListItem key={badge.id} disableGutters sx={{ py: 0.25 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      {earned ? (
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                      ) : (
                                        <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                      )}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <MuiLink
                                          component="button"
                                          variant="body2"
                                          onClick={() => navigate(orgPath(`/credentials/collections/${badge.collectionId}/${badge.id}`))}
                                          sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                        >
                                          {badge.name}
                                        </MuiLink>
                                      }
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          )}

                          {/* Checkpoints */}
                          {phase.checkpoints.length > 0 && (
                            <List dense disablePadding>
                              {phase.checkpoints.map((chk) => {
                                const signed = completions.has(chk.id);
                                return (
                                  <ListItem key={chk.id} disableGutters sx={{ py: 0.25 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      {signed ? (
                                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                      ) : (
                                        <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                      )}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={chk.label}
                                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

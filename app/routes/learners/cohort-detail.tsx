import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { useParams, useNavigate } from 'react-router';
import { useOrg } from '~/context/OrgContext';
import { useOrgPath } from '~/hooks/useOrgPath';
import {
  getCohort,
  listCohortProgramAssignments,
  listLearnerProgramAssignments,
  getOrgLearner,
  listOrgMembers,
} from '~/api/generated';
import type {
  CohortDetail,
  CohortProgramAssignmentDetail,
  OrgMemberDetail,
  OrgLearnerDetail,
  Learner,
  BadgeProgress,
} from '~/api/generated';

// ─── Matrix types ─────────────────────────────────────────────────────────────

type MatrixCol =
  | { type: 'badge'; id: string; name: string }
  | { type: 'checkpoint'; id: string; label: string }

interface MatrixPhase {
  key: string;
  label: string;
  programName: string;
  programSlug: string;
  cols: MatrixCol[];
}

// ─── Cell content ─────────────────────────────────────────────────────────────

function CellContent({ complete, hovered }: { complete: boolean; hovered: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0.75 }}>
      {complete
        ? <CheckRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} />
        : <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hovered ? 'grey.400' : 'grey.300' }} />
      }
    </Box>
  );
}

// ─── Sticky name cell sx ──────────────────────────────────────────────────────

const stickyNameSx = {
  position: 'sticky',
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
  minWidth: 150,
  maxWidth: 200,
  borderRight: '1px solid',
  borderRightColor: 'divider',
} as const;

const stickyNameHeaderSx = {
  ...stickyNameSx,
  zIndex: 3,
  fontWeight: 600,
} as const;

// ─── Phase divider sx on first col of each phase ──────────────────────────────

const phaseStartSx = {
  borderLeft: '3px solid',
  borderLeftColor: 'divider',
} as const;

// ─── Main component ───────────────────────────────────────────────────────────

export default function CohortDetailPage() {
  const { cohortSlug } = useParams();
  const { activeOrg, isAdmin } = useOrg();
  const navigate = useNavigate();
  const orgPath = useOrgPath();

  const [cohortDetail, setCohortDetail] = React.useState<CohortDetail | null>(null);
  const [matrixPhases, setMatrixPhases] = React.useState<MatrixPhase[]>([]);
  const [programCards, setProgramCards] = React.useState<CohortProgramAssignmentDetail[]>([]);
  const [orgMembers, setOrgMembers] = React.useState<OrgMemberDetail[]>([]);
  const [learnerBadges, setLearnerBadges] = React.useState<Map<string, Set<string>>>(new Map());
  const [learnerCheckpoints, setLearnerCheckpoints] = React.useState<Map<string, Set<string>>>(new Map());
  const [isLoading, setIsLoading] = React.useState(true);
  const [hoveredCol, setHoveredCol] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeOrg || !cohortSlug) return;
    let cancelled = false;

    async function fetchAll() {
      try {
        setIsLoading(true);

        // 1. Cohort + members (parallel)
        const [cohortRes, membersRes] = await Promise.all([
          getCohort(activeOrg!.org.id, cohortSlug!),
          listOrgMembers(activeOrg!.org.id),
        ]);
        if (cancelled || cohortRes.status !== 200) return;
        const cohort = cohortRes.data as CohortDetail;
        if (!cancelled) setCohortDetail(cohort);
        if (!cancelled && membersRes.status === 200) {
          setOrgMembers((membersRes.data as { data: OrgMemberDetail[] }).data);
        }

        // 2. Cohort program assignments
        const assignmentsRes = await listCohortProgramAssignments(activeOrg!.org.id, cohort.id);
        if (cancelled || assignmentsRes.status !== 200) return;
        const assignments = (assignmentsRes.data as { data: CohortProgramAssignmentDetail[] }).data;
        if (!cancelled) setProgramCards(assignments);

        // Build matrix phases from program phases
        const phases: MatrixPhase[] = assignments.flatMap((asn) => {
          const program = asn.program;
          if (!program) return [];
          return (program.phases ?? []).map((phase) => ({
            key: phase.id,
            label: phase.name,
            programName: program.name,
            programSlug: program.slug,
            cols: [
              ...phase.badges.map((b) => ({ type: 'badge' as const, id: b.id, name: b.name })),
              ...phase.checkpoints.map((c) => ({ type: 'checkpoint' as const, id: c.id, label: c.label })),
            ],
          }));
        });
        if (!cancelled) setMatrixPhases(phases);

        // 3. Per-learner progress (parallel)
        const learners = cohort.learners ?? [];
        if (learners.length > 0) {
          const results = await Promise.all(
            learners.map((l) =>
              Promise.all([
                listLearnerProgramAssignments(activeOrg!.org.id, l.id),
                getOrgLearner(activeOrg!.org.id, l.id),
              ])
            )
          );
          if (!cancelled) {
            const badgesMap = new Map<string, Set<string>>();
            const checkpointsMap = new Map<string, Set<string>>();
            learners.forEach((l, i) => {
              const [assignmentsResult, learnerResult] = results[i];

              // Completed badge IDs
              const completedBadges = new Set<string>();
              if (learnerResult.status === 200) {
                const detail = learnerResult.data as OrgLearnerDetail;
                (detail.badgeProgress ?? []).forEach((bp: BadgeProgress) => {
                  if (bp.status === 'complete') completedBadges.add(bp.badgeId);
                });
              }
              badgesMap.set(l.id, completedBadges);

              // Completed checkpoint IDs
              const completedCheckpoints = new Set<string>();
              if (assignmentsResult.status === 200) {
                const asnData = (assignmentsResult.data as { data: { progress?: { checkpointCompletions?: { checkpointId: string }[] } }[] }).data;
                asnData.forEach((a) => {
                  a.progress?.checkpointCompletions?.forEach((cc) => {
                    completedCheckpoints.add(cc.checkpointId);
                  });
                });
              }
              checkpointsMap.set(l.id, completedCheckpoints);
            });
            setLearnerBadges(badgesMap);
            setLearnerCheckpoints(checkpointsMap);
          }
        }
      } catch (err) {
        console.error('Error fetching cohort detail:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [activeOrg, cohortSlug]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Skeleton width={200} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton width={300} height={24} />
      </Box>
    );
  }

  if (!cohortDetail) {
    return (
      <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
        <Typography variant="body2" color="text.secondary">Cohort not found</Typography>
      </Box>
    );
  }

  // Assigned staff members
  const assignedStaff = orgMembers.filter((m) =>
    cohortDetail.assignedStaffIds?.includes(m.id)
  );

  const allCols = matrixPhases.flatMap((p) => p.cols);
  const hasMatrix = matrixPhases.length > 0 && allCols.length > 0;
  const learners: Learner[] = cohortDetail.learners ?? [];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>

      {/* Back */}
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate(orgPath('/learners?tab=cohorts'))}
        sx={{ mb: 2, textTransform: 'none' }}
        size="small"
      >
        All Cohorts
      </Button>

      {/* ── Header ── */}
      {cohortDetail.coverImageUrl ? (
        <Box
          component="img"
          src={cohortDetail.coverImageUrl}
          alt={cohortDetail.name}
          sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2, display: 'block', mb: 2 }}
        />
      ) : (
        <Box
          sx={{
            height: 160,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <GroupsRoundedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.5)' }} />
        </Box>
      )}

      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.5 }}>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
              {cohortDetail.name}
            </Typography>
            <Chip
              label={cohortDetail.status.charAt(0).toUpperCase() + cohortDetail.status.slice(1)}
              size="small"
              color={cohortDetail.status === 'active' ? 'success' : 'default'}
              variant="outlined"
            />
          </Stack>
          {cohortDetail.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {cohortDetail.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {learners.length} {learners.length === 1 ? 'learner' : 'learners'}
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="outlined" size="small" sx={{ textTransform: 'none', flexShrink: 0 }}>
            Edit
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* ── Assigned Staff ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          <PersonOutlineRoundedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Assigned Staff
        </Typography>
        {assignedStaff.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No staff assigned to this cohort.
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {assignedStaff.map((m) => {
              const name = m.user?.name ?? m.userId;
              return (
                <Chip
                  key={m.id}
                  avatar={
                    <Avatar src={m.user?.profileImageUrl} sx={{ width: 24, height: 24 }}>
                      {name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                    </Avatar>
                  }
                  label={name}
                  variant="outlined"
                  size="small"
                />
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Assigned Programs ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          <SchoolRoundedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Programs
        </Typography>
        {programCards.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No programs assigned to this cohort.
            {isAdmin && (
              <MuiLink
                component="button"
                variant="body2"
                onClick={() => navigate(orgPath('/credentials/programs'))}
                sx={{ ml: 1, cursor: 'pointer' }}
              >
                Go to Programs
              </MuiLink>
            )}
          </Typography>
        ) : (
          <Stack direction="row" gap={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
            {programCards.map((asn) => {
              const p = asn.program;
              if (!p) return null;
              return (
                <Paper
                  key={asn.id}
                  variant="outlined"
                  onClick={() => navigate(orgPath(`/credentials/programs/${p.slug}`))}
                  sx={{
                    px: 2,
                    py: 1.25,
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    '&:hover': { borderColor: 'primary.main' },
                    minWidth: 160,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>{p.name}</Typography>
                  <Stack direction="row" gap={1.5}>
                    {(p.phaseCount ?? 0) > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {p.phaseCount} {p.phaseCount === 1 ? 'phase' : 'phases'}
                      </Typography>
                    )}
                    {(p.totalBadgeCount ?? 0) > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {p.totalBadgeCount} badges
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Learner Progress Matrix ── */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          <GroupsRoundedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Learner Progress
        </Typography>

        {learners.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No learners in this cohort yet.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ overflow: 'auto', maxHeight: 520 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                {/* Row 1: Phase group headers */}
                <TableRow>
                  <TableCell
                    rowSpan={2}
                    sx={{ ...stickyNameHeaderSx, verticalAlign: 'bottom', zIndex: 4 }}
                  >
                    Learner
                  </TableCell>
                  {hasMatrix ? (
                    matrixPhases.map((phase) => (
                      phase.cols.length > 0 && (
                        <TableCell
                          key={`phase-${phase.key}`}
                          colSpan={phase.cols.length}
                          align="center"
                          sx={{
                            ...phaseStartSx,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            py: 0.5,
                            px: 1,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                            {phase.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                            {phase.programName}
                          </Typography>
                        </TableCell>
                      )
                    ))
                  ) : (
                    <>
                      <TableCell sx={{ bgcolor: 'background.paper' }}>Email</TableCell>
                      <TableCell sx={{ bgcolor: 'background.paper' }}>Status</TableCell>
                    </>
                  )}
                </TableRow>

                {/* Row 2: Individual column icons */}
                {hasMatrix && (
                  <TableRow>
                    {matrixPhases.flatMap((phase) =>
                      phase.cols.map((col, ci) => {
                        const colKey = col.type === 'badge' ? `b-${col.id}` : `c-${col.id}`;
                        const title = col.type === 'badge' ? col.name : col.label;
                        const isHovered = hoveredCol === colKey;
                        return (
                          <TableCell
                            key={`h-${colKey}`}
                            align="center"
                            sx={{
                              py: 0.5,
                              px: 0.25,
                              ...(ci === 0 ? phaseStartSx : {}),
                              bgcolor: isHovered ? 'action.hover' : 'background.paper',
                              transition: 'background-color 0.1s',
                              cursor: 'default',
                            }}
                            onMouseEnter={() => setHoveredCol(colKey)}
                            onMouseLeave={() => setHoveredCol(null)}
                          >
                            <Tooltip title={title} placement="top" arrow>
                              <Box sx={{ display: 'inline-flex' }}>
                                {col.type === 'badge' ? (
                                  <VerifiedOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                                ) : (
                                  <CheckBoxOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                                )}
                              </Box>
                            </Tooltip>
                          </TableCell>
                        );
                      })
                    )}
                  </TableRow>
                )}
              </TableHead>

              <TableBody>
                {learners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell sx={stickyNameSx}>
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() => navigate(orgPath(`/learners/${learner.slug ?? learner.id}`))}
                        sx={{ textDecoration: 'none', cursor: 'pointer', textAlign: 'left', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {learner.name ?? '—'}
                      </MuiLink>
                    </TableCell>

                    {hasMatrix ? (
                      matrixPhases.flatMap((phase) =>
                        phase.cols.map((col, ci) => {
                          const colKey = col.type === 'badge' ? `b-${col.id}` : `c-${col.id}`;
                          const complete = col.type === 'badge'
                            ? learnerBadges.get(learner.id)?.has(col.id) ?? false
                            : learnerCheckpoints.get(learner.id)?.has(col.id) ?? false;
                          const isHovered = hoveredCol === colKey;
                          const title = col.type === 'badge' ? col.name : col.label;
                          return (
                            <TableCell
                              key={`${colKey}-${learner.id}`}
                              align="center"
                              sx={{
                                p: 0,
                                ...(ci === 0 ? phaseStartSx : {}),
                                bgcolor: complete
                                  ? (isHovered
                                    ? (t) => alpha(t.palette.success.main, 0.28)
                                    : (t) => alpha(t.palette.success.main, 0.13))
                                  : (isHovered ? 'action.hover' : undefined),
                                transition: 'background-color 0.1s',
                                cursor: 'default',
                              }}
                              onMouseEnter={() => setHoveredCol(colKey)}
                              onMouseLeave={() => setHoveredCol(null)}
                            >
                              <Tooltip title={title} placement="top" arrow>
                                <span>
                                  <CellContent complete={complete} hovered={isHovered} />
                                </span>
                              </Tooltip>
                            </TableCell>
                          );
                        })
                      )
                    ) : (
                      <>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{learner.email ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label="Active" size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}

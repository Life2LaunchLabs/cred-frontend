import { http, HttpResponse, passthrough } from "msw";
import type {
  AuthResponse,
  CohortDetail,
  CollectionDetail,
  LoginRequest,
  OrgLearnerDetail,
  ProgramDetail,
  CohortProgramAssignmentDetail,
  LearnerProgramAssignmentDetail,
  ProgramProgress,
  PhaseProgress,
} from "~/api/generated";
import {
  FAKE_USER,
  FAKE_USER_PROFILE,
  FAKE_AUTH_RESPONSE,
  FAKE_ORG_DETAILS,
  FAKE_USER_ORGS,
  FAKE_ORG_STATS,
  FAKE_ORG_MEMBERS,
  FAKE_LEARNERS,
  FAKE_COHORTS,
  FAKE_COHORT_LEARNERS,
  FAKE_COLLECTIONS,
  FAKE_BADGE_SUMMARIES,
  FAKE_COLLECTION_STATS,
  FAKE_BADGES,
  FAKE_PROGRAMS,
  FAKE_PROGRAM_PHASES,
  FAKE_COHORT_PROGRAM_ASSIGNMENTS,
  FAKE_LEARNER_PROGRAM_ASSIGNMENTS,
  FAKE_CHECKPOINT_COMPLETIONS,
  FAKE_LEARNER_BADGE_PROGRESS,
} from "./data";

// ---------- Handlers ----------

export const handlers = [
  // CRITICAL: Bypass all /app/ requests (module imports, assets, etc.)
  // This must be FIRST since MSW uses first-match
  http.get('/app/*', () => passthrough()),
  http.post('/app/*', () => passthrough()),
  http.put('/app/*', () => passthrough()),
  http.delete('/app/*', () => passthrough()),
  http.patch('/app/*', () => passthrough()),

  // Bypass Vite HMR and other dev server requests
  http.get('/@*', () => passthrough()),
  http.get('/node_modules/*', () => passthrough()),
  http.get('/*.js', () => passthrough()),
  http.get('/*.ts', () => passthrough()),
  http.get('/*.tsx', () => passthrough()),
  http.get('/*.css', () => passthrough()),

  // API handlers below
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    if (body.email === FAKE_USER.email && body.password === FAKE_USER.password) {
      return HttpResponse.json(FAKE_AUTH_RESPONSE, { status: 200 });
    }

    return HttpResponse.json(
      { message: "Invalid email or password" },
      { status: 401 },
    );
  }),

  http.post("*/auth/register", async ({ request }) => {
    const body = (await request.json()) as { email?: string; name?: string };

    return HttpResponse.json(
      {
        accessToken: "fake-jwt-access-token",
        refreshToken: "fake-jwt-refresh-token",
        user: {
          id: "usr_" + Math.random().toString(36).slice(2, 8),
          email: body.email ?? "",
          name: body.name ?? body.email?.split("@")[0],
        },
      } satisfies AuthResponse,
      { status: 201 },
    );
  }),

  http.get("*/users/:userId/orgs", () => {
    return HttpResponse.json(FAKE_USER_ORGS, { status: 200 });
  }),

  // Org-specific routes (more specific first)
  http.get("*/orgs/:orgId/stats", ({ params }) => {
    const stats = FAKE_ORG_STATS[params.orgId as string];
    if (!stats) {
      return HttpResponse.json({ message: "Org not found" }, { status: 404 });
    }
    return HttpResponse.json(stats, { status: 200 });
  }),

  http.get("*/orgs/:orgId/members", ({ params }) => {
    const members = FAKE_ORG_MEMBERS[params.orgId as string] ?? [];
    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: members.length, totalPages: 1 },
        data: members,
      },
      { status: 200 },
    );
  }),

  http.get("*/orgs/:orgId", ({ params }) => {
    const org = FAKE_ORG_DETAILS[params.orgId as string];
    if (!org) {
      return HttpResponse.json({ message: "Org not found" }, { status: 404 });
    }
    return HttpResponse.json(org, { status: 200 });
  }),

  // Badges
  http.get("*/badges/:badgeId", ({ params }) => {
    const badge = FAKE_BADGES.find((b) => b.id === params.badgeId);
    if (!badge) {
      return HttpResponse.json({ message: "Badge not found" }, { status: 404 });
    }
    return HttpResponse.json(badge, { status: 200 });
  }),

  // Collections
  http.get("*/collections/:collectionId", ({ params }) => {
    const collectionId = params.collectionId as string;
    const collection = FAKE_COLLECTIONS.find((c) => c.id === collectionId);
    if (!collection) {
      return HttpResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    const detail: CollectionDetail = {
      ...collection,
      badgeSummaries: FAKE_BADGE_SUMMARIES[collectionId] ?? [],
      stats: FAKE_COLLECTION_STATS[collectionId] ?? {
        totalIssuances: 0,
        uniqueLearners: 0,
        badgeCount: collection.badgeCount ?? 0,
        averageCompletionRate: 0,
      },
    };

    return HttpResponse.json(detail, { status: 200 });
  }),

  http.get("*/registry/collections", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    let results = FAKE_COLLECTIONS.filter((c) => c.published);
    if (q) {
      results = results.filter((c) => c.name.toLowerCase().includes(q));
    }
    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: results.length, totalPages: 1 },
        data: results,
      },
      { status: 200 },
    );
  }),

  http.get("*/collections", ({ request }) => {
    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId");
    const q = url.searchParams.get("q")?.toLowerCase();
    let results = FAKE_COLLECTIONS;
    if (orgId) {
      results = results.filter((c) => c.createdByOrgId === orgId);
    }
    if (q) {
      results = results.filter((c) => c.name.toLowerCase().includes(q));
    }
    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: results.length, totalPages: 1 },
        data: results,
      },
      { status: 200 },
    );
  }),

  http.get("*/users/:userId", () => {
    return HttpResponse.json(FAKE_USER_PROFILE, { status: 200 });
  }),

  // Cohorts (more specific routes first)
  http.get("*/orgs/:orgId/cohorts/:cohortId", ({ params }) => {
    const cohortId = params.cohortId as string;
    // Support lookup by ID or slug
    const cohort = FAKE_COHORTS.find(
      (c) => c.id === cohortId || c.slug === cohortId
    );
    if (!cohort) {
      return HttpResponse.json({ message: "Cohort not found" }, { status: 404 });
    }

    const detail: CohortDetail = {
      ...cohort,
      learners: FAKE_COHORT_LEARNERS[cohort.id] ?? [],
    };

    return HttpResponse.json(detail, { status: 200 });
  }),

  http.get("*/orgs/:orgId/cohorts", ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const staffId = url.searchParams.get("staffId");

    let results = FAKE_COHORTS.filter((c) => c.orgId === orgId);

    if (status) {
      results = results.filter((c) => c.status === status);
    }

    if (staffId) {
      results = results.filter((c) =>
        c.assignedStaffIds?.includes(staffId)
      );
    }

    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: results.length, totalPages: 1 },
        data: results,
      },
      { status: 200 },
    );
  }),

  // Programs
  http.get("*/orgs/:orgId/programs", ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    let results = Object.values(FAKE_PROGRAMS).filter((p) => p.orgId === orgId);

    if (status) {
      results = results.filter((p) => p.status === status);
    }

    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: results.length, totalPages: 1 },
        data: results,
      },
      { status: 200 },
    );
  }),

  http.get("*/orgs/:orgId/programs/:programSlug", ({ params }) => {
    const programSlug = params.programSlug as string;
    const program = Object.values(FAKE_PROGRAMS).find(
      (p) => p.slug === programSlug || p.id === programSlug
    );
    if (!program) {
      return HttpResponse.json({ message: "Program not found" }, { status: 404 });
    }

    const detail: ProgramDetail = {
      ...program,
      phases: FAKE_PROGRAM_PHASES[program.id] ?? [],
    };

    return HttpResponse.json(detail, { status: 200 });
  }),

  http.get("*/orgs/:orgId/cohorts/:cohortId/program-assignments", ({ params }) => {
    const cohortId = params.cohortId as string;
    const assignments = FAKE_COHORT_PROGRAM_ASSIGNMENTS[cohortId] ?? [];

    const details: CohortProgramAssignmentDetail[] = assignments.map((asn) => {
      const program = FAKE_PROGRAMS[asn.programId];
      const cohort = FAKE_COHORTS.find((c) => c.id === asn.cohortId);
      return {
        ...asn,
        program: {
          ...program,
          phases: FAKE_PROGRAM_PHASES[program.id] ?? [],
        },
        cohort: cohort ? {
          id: cohort.id,
          name: cohort.name,
          slug: cohort.slug,
        } : { id: asn.cohortId, name: "Unknown Cohort", slug: "unknown" },
        learnerAssignmentCount: FAKE_COHORT_LEARNERS[cohortId]?.length ?? 0,
      };
    });

    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: details.length, totalPages: 1 },
        data: details,
      },
      { status: 200 },
    );
  }),

  http.get("*/orgs/:orgId/learners/:learnerId", ({ params }) => {
    const { orgId, learnerId } = params as { orgId: string; learnerId: string };

    // Support lookup by ID or slug
    const learner = FAKE_LEARNERS.find((l) => l.id === learnerId || l.slug === learnerId);
    if (!learner) {
      return HttpResponse.json({ message: "Learner not found" }, { status: 404 });
    }

    const badgeProgress = FAKE_LEARNER_BADGE_PROGRESS[learner.id] ?? [];
    const detail: OrgLearnerDetail = {
      id: `ol_${learner.id}`,
      orgId,
      learnerId: learner.id,
      status: "active",
      createdAt: learner.createdAt,
      learner,
      badgeProgress,
    };

    return HttpResponse.json(detail, { status: 200 });
  }),

  http.get("*/orgs/:orgId/learners/:learnerId/program-assignments", ({ params }) => {
    const learnerId = params.learnerId as string;
    const assignments = FAKE_LEARNER_PROGRAM_ASSIGNMENTS[learnerId] ?? [];

    const learner = FAKE_LEARNERS.find((l) => l.id === learnerId);
    const badgeProgress = FAKE_LEARNER_BADGE_PROGRESS[learnerId] ?? [];
    const details: LearnerProgramAssignmentDetail[] = assignments.map((asn) => {
      const program = FAKE_PROGRAMS[asn.programId];
      const completions = FAKE_CHECKPOINT_COMPLETIONS[asn.id] ?? [];

      // Calculate progress
      const phases = FAKE_PROGRAM_PHASES[program.id] ?? [];
      const totalCheckpoints = phases.reduce((sum, phase) => sum + phase.checkpoints.length, 0);
      const totalBadges = phases.reduce((sum, phase) => sum + phase.badges.length, 0);

      // Count badges earned for this specific program
      const programBadgeIds = new Set(phases.flatMap((p) => p.badges.map((b) => b.id)));
      const programBadgesEarned = badgeProgress.filter(
        (bp) => programBadgeIds.has(bp.badgeId) && bp.status === "complete"
      ).length;

      const progress: ProgramProgress = {
        badgesEarned: programBadgesEarned,
        badgesTotal: totalBadges,
        checkpointsSigned: completions.length,
        checkpointsTotal: totalCheckpoints,
        phaseProgress: phases.map((phase) => {
          const phaseCheckpoints = completions.filter((c) =>
            phase.checkpoints.some((chk) => chk.id === c.checkpointId)
          );
          const phaseBadgeIds = new Set(phase.badges.map((b) => b.id));
          const phaseBadgesEarned = badgeProgress.filter(
            (bp) => phaseBadgeIds.has(bp.badgeId) && bp.status === "complete"
          ).length;
          return {
            phaseId: phase.id,
            badgesEarned: phaseBadgesEarned,
            badgesTotal: phase.badges.length,
            checkpointsSigned: phaseCheckpoints.length,
            checkpointsTotal: phase.checkpoints.length,
            isComplete: false,
          } satisfies PhaseProgress;
        }),
        checkpointCompletions: completions,
      };

      return {
        ...asn,
        program: {
          ...program,
          phases,
        },
        learner: {
          id: learner?.id ?? learnerId,
          name: learner?.name ?? "Unknown Learner",
          email: learner?.email,
        },
        progress,
      };
    });

    return HttpResponse.json(
      {
        meta: { page: 1, pageSize: 25, totalCount: details.length, totalPages: 1 },
        data: details,
      },
      { status: 200 },
    );
  }),
];

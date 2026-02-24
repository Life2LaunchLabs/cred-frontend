import { http, HttpResponse, passthrough } from "msw";
import type {
  AuthResponse,
  CohortDetail,
  CollectionDetail,
  LoginRequest,
  OrgLearnerDetail,
  OrgCollectionRelDetail,
  OrgBadgeRelDetail,
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
import {
  DEMO_ORGS,
  DEMO_ORG_STATS,
  DEMO_USER_ORGS,
  DEMO_USER_PROFILES,
} from "./demo-personas";
import {
  CREATOR_BADGES,
  CREATOR_COLLECTIONS,
  CREATOR_BADGE_SUMMARIES,
  CREATOR_COLLECTION_STATS,
  CREATOR_AUTH_REQUESTS,
} from "./creator-data";
import {
  FAKE_ORG_COLLECTION_RELS,
  FAKE_COLLECTION_REL_BY_ID,
  FAKE_ORG_BADGE_RELS,
  FAKE_BADGE_REL_BY_ID,
  FAKE_LIBRARY_ANALYTICS,
  FAKE_COLLECTION_REL_ANALYTICS,
  FAKE_BADGE_REL_ANALYTICS,
} from "./library-data";

// Merged org lookups include both spec orgs and demo orgs
const ALL_ORG_DETAILS = { ...FAKE_ORG_DETAILS, ...DEMO_ORGS };
const ALL_ORG_STATS = { ...FAKE_ORG_STATS, ...DEMO_ORG_STATS };

// Merged collection + badge lookups include creator data
const ALL_COLLECTIONS = [...FAKE_COLLECTIONS, ...CREATOR_COLLECTIONS];
const ALL_BADGES = [...FAKE_BADGES, ...CREATOR_BADGES];
const ALL_BADGE_SUMMARIES = { ...FAKE_BADGE_SUMMARIES, ...CREATOR_BADGE_SUMMARIES };
const ALL_COLLECTION_STATS = { ...FAKE_COLLECTION_STATS, ...CREATOR_COLLECTION_STATS };

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

  http.get("*/users/:userId/orgs", ({ params }) => {
    const userId = params.userId as string;
    const demoOrgs = DEMO_USER_ORGS[userId];
    if (demoOrgs) {
      return HttpResponse.json(demoOrgs, { status: 200 });
    }
    return HttpResponse.json(FAKE_USER_ORGS, { status: 200 });
  }),

  // Org-specific routes (more specific first)
  http.get("*/orgs/:orgId/stats", ({ params }) => {
    const stats = ALL_ORG_STATS[params.orgId as string];
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

  // Credential Library (specific routes before generic orgs/:orgId)
  http.get("*/orgs/:orgId/library/analytics/collections/:collectionRelId", ({ params }) => {
    const analytics = FAKE_COLLECTION_REL_ANALYTICS[params.collectionRelId as string];
    if (!analytics) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    return HttpResponse.json(analytics, { status: 200 });
  }),

  http.get("*/orgs/:orgId/library/analytics/badges/:badgeRelId", ({ params }) => {
    const badgeRelId = params.badgeRelId as string;
    const analytics = FAKE_BADGE_REL_ANALYTICS[badgeRelId];
    if (analytics) {
      return HttpResponse.json(analytics, { status: 200 });
    }
    // Fallback: generate from badge rel + ALL_BADGES
    const badgeRel = FAKE_BADGE_REL_BY_ID[badgeRelId];
    if (!badgeRel) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const fullBadge = ALL_BADGES.find((b) => b.id === badgeRel.badgeId);
    if (!fullBadge) {
      return HttpResponse.json({ message: "Badge not found" }, { status: 404 });
    }
    return HttpResponse.json(
      { badgeRelId, badge: fullBadge, programCount: badgeRel.programCount, programs: [] },
      { status: 200 }
    );
  }),

  http.get("*/orgs/:orgId/library/analytics", ({ params }) => {
    const analytics = FAKE_LIBRARY_ANALYTICS[params.orgId as string];
    if (!analytics) {
      // Return empty analytics rather than 404
      return HttpResponse.json(
        {
          adoptionFunnel: { viewedInCatalog: 0, requested: 0, approved: 0, activeInLibrary: 0, referencedInPrograms: 0 },
          unusedActiveCount: 0,
          avgTimeToApprovalDays: 0,
          topCollections: [],
        },
        { status: 200 }
      );
    }
    return HttpResponse.json(analytics, { status: 200 });
  }),

  http.get("*/orgs/:orgId/library/collections/:collectionRelId", ({ params }) => {
    const rel = FAKE_COLLECTION_REL_BY_ID[params.collectionRelId as string];
    if (!rel) {
      return HttpResponse.json({ message: "Collection relationship not found" }, { status: 404 });
    }
    const badgeRels = FAKE_ORG_BADGE_RELS[rel.id] ?? [];
    const detail: OrgCollectionRelDetail = { ...rel, badgeRels };
    return HttpResponse.json(detail, { status: 200 });
  }),

  http.patch("*/orgs/:orgId/library/collections/:collectionRelId", async ({ params, request }) => {
    const rel = FAKE_COLLECTION_REL_BY_ID[params.collectionRelId as string];
    if (!rel) {
      return HttpResponse.json({ message: "Collection relationship not found" }, { status: 404 });
    }
    const body = (await request.json()) as { status?: string; notes?: string };
    const updated = {
      ...rel,
      ...(body.status ? { status: body.status as typeof rel.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      statusChangedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.get("*/orgs/:orgId/library/collections", ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.toLowerCase();

    let results = FAKE_ORG_COLLECTION_RELS[orgId] ?? [];
    if (status) results = results.filter((r) => r.status === status);
    if (q) results = results.filter((r) => r.collection.name.toLowerCase().includes(q));

    return HttpResponse.json(
      { meta: { page: 1, pageSize: 25, total: results.length }, data: results },
      { status: 200 }
    );
  }),

  http.get("*/orgs/:orgId/library/badges/:badgeRelId", ({ params }) => {
    const badgeRel = FAKE_BADGE_REL_BY_ID[params.badgeRelId as string];
    if (!badgeRel) {
      return HttpResponse.json({ message: "Badge relationship not found" }, { status: 404 });
    }
    const fullBadge = ALL_BADGES.find((b) => b.id === badgeRel.badgeId);
    if (!fullBadge) {
      return HttpResponse.json({ message: "Badge not found" }, { status: 404 });
    }
    const collectionRel = FAKE_COLLECTION_REL_BY_ID[badgeRel.collectionRelId];
    if (!collectionRel) {
      return HttpResponse.json({ message: "Collection relationship not found" }, { status: 404 });
    }
    const detail: OrgBadgeRelDetail = {
      id: badgeRel.id,
      orgId: badgeRel.orgId,
      badgeId: badgeRel.badgeId,
      collectionRelId: badgeRel.collectionRelId,
      status: badgeRel.status as OrgBadgeRelDetail['status'],
      programCount: badgeRel.programCount,
      badge: fullBadge,
      collectionRel,
    };
    return HttpResponse.json(detail, { status: 200 });
  }),

  http.get("*/orgs/:orgId/library/badges", ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const collectionRelId = url.searchParams.get("collectionRelId");
    const q = url.searchParams.get("q")?.toLowerCase();

    const orgRels = FAKE_ORG_COLLECTION_RELS[orgId] ?? [];
    let results = orgRels.flatMap((rel) => FAKE_ORG_BADGE_RELS[rel.id] ?? []);

    if (status) results = results.filter((r) => r.status === status);
    if (collectionRelId) results = results.filter((r) => r.collectionRelId === collectionRelId);
    if (q) results = results.filter((r) => r.badge.name.toLowerCase().includes(q));

    return HttpResponse.json(
      { meta: { page: 1, pageSize: 50, total: results.length }, data: results },
      { status: 200 }
    );
  }),

  // Demo: add col_rci_1 (Welding Fundamentals) to the org's library
  http.post("*/orgs/:orgId/library/demo", ({ params }) => {
    const orgId = params.orgId as string;
    const colId = 'col_rci_1';

    if (!FAKE_ORG_COLLECTION_RELS[orgId]) {
      FAKE_ORG_COLLECTION_RELS[orgId] = [];
    }
    const existing = FAKE_ORG_COLLECTION_RELS[orgId].find((r) => r.collectionId === colId);
    if (existing) {
      return HttpResponse.json(existing, { status: 200 });
    }

    const collection = ALL_COLLECTIONS.find((c) => c.id === colId)!;
    const now = new Date().toISOString();
    const newRel = {
      id: 'ccr_demo_1',
      orgId,
      collectionId: colId,
      status: 'active' as const,
      source: 'authorized' as const,
      programCount: 0,
      authRequestId: 'iar_demo_1',
      collection,
      requestedAt: now,
      approvedAt: now,
      statusChangedAt: now,
    };

    FAKE_ORG_COLLECTION_RELS[orgId].push(newRel);
    FAKE_COLLECTION_REL_BY_ID[newRel.id] = newRel;

    const summaries = ALL_BADGE_SUMMARIES[colId] ?? [];
    const badgeRels = summaries.map((summary, i) => ({
      id: `cbr_${newRel.id}_${i + 1}`,
      orgId,
      badgeId: summary.id,
      collectionRelId: newRel.id,
      status: 'active' as const,
      programCount: 0,
      badge: {
        id: summary.id,
        name: summary.name,
        description: summary.description,
        imageUrl: summary.imageUrl,
        issuanceCount: summary.issuanceCount,
      },
    }));
    FAKE_ORG_BADGE_RELS[newRel.id] = badgeRels;
    for (const br of badgeRels) {
      FAKE_BADGE_REL_BY_ID[br.id] = br;
    }

    return HttpResponse.json(newRel, { status: 201 });
  }),

  http.get("*/orgs/:orgId", ({ params }) => {
    const org = ALL_ORG_DETAILS[params.orgId as string];
    if (!org) {
      return HttpResponse.json({ message: "Org not found" }, { status: 404 });
    }
    return HttpResponse.json(org, { status: 200 });
  }),

  // Badges
  http.get("*/badges/:badgeId", ({ params }) => {
    const badge = ALL_BADGES.find((b) => b.id === params.badgeId);
    if (!badge) {
      return HttpResponse.json({ message: "Badge not found" }, { status: 404 });
    }
    return HttpResponse.json(badge, { status: 200 });
  }),

  // Collections
  http.get("*/collections/:collectionId", ({ params }) => {
    const collectionId = params.collectionId as string;
    const collection = ALL_COLLECTIONS.find((c) => c.id === collectionId);
    if (!collection) {
      return HttpResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    const detail: CollectionDetail = {
      ...collection,
      badgeSummaries: ALL_BADGE_SUMMARIES[collectionId] ?? [],
      stats: ALL_COLLECTION_STATS[collectionId] ?? {
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
    let results = ALL_COLLECTIONS.filter((c) => c.published);
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

  // Creator Studio endpoints
  http.get("*/orgs/:orgId/creator/authorizations", ({ params, request }) => {
    const orgId = params.orgId as string;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    let results = CREATOR_AUTH_REQUESTS.filter(
      (r) => CREATOR_COLLECTIONS.some((c) => c.id === r.collectionId && c.createdByOrgId === orgId)
    );
    if (status) {
      results = results.filter((r) => r.status === status);
    }
    return HttpResponse.json(
      { meta: { page: 1, pageSize: 25, totalCount: results.length, totalPages: 1 }, data: results },
      { status: 200 },
    );
  }),

  http.get("*/issue-authorizations/:authRequestId", ({ params }) => {
    const authRequestId = params.authRequestId as string;
    const req = CREATOR_AUTH_REQUESTS.find((r) => r.id === authRequestId);
    if (!req) {
      return HttpResponse.json({ message: "Authorization request not found" }, { status: 404 });
    }
    return HttpResponse.json(req, { status: 200 });
  }),

  http.get("*/collections", ({ request }) => {
    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId");
    const q = url.searchParams.get("q")?.toLowerCase();
    let results = ALL_COLLECTIONS;
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

  http.get("*/users/:userId", ({ params }) => {
    const userId = params.userId as string;
    const demoUser = DEMO_USER_PROFILES[userId];
    if (demoUser) {
      return HttpResponse.json(demoUser, { status: 200 });
    }
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

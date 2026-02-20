/**
 * Mock data loader for MSW handlers.
 *
 * Imports example data from the cloned API spec (spec/api/resources/).
 * Run `npm run spec:pull` from cred-frontend/ to populate that directory.
 */

import type {
  AuthResponse,
  Badge,
  BadgeProgress,
  Collection,
  CollectionDetail,
  CollectionStats,
  Cohort,
  CohortProgramAssignment,
  CheckpointCompletion,
  Learner,
  LearnerProgramAssignment,
  ListUserOrgs200,
  Org,
  OrgMemberDetail,
  OrgStats,
  Phase,
  Program,
  User,
} from "~/api/generated";

import usersData from "../../spec/api/resources/users/examples.json";
import orgsData from "../../spec/api/resources/orgs/examples.json";
import orgMembersData from "../../spec/api/resources/org-members/examples.json";
import learnersData from "../../spec/api/resources/learners/examples.json";
import cohortsData from "../../spec/api/resources/cohorts/examples.json";
import collectionsData from "../../spec/api/resources/collections/examples.json";
import badgesData from "../../spec/api/resources/badges/examples.json";
import programsData from "../../spec/api/resources/programs/examples.json";
import programAssignmentsData from "../../spec/api/resources/program-assignments/examples.json";

// ---------- Users / Auth ----------

export const FAKE_USER = usersData.credentials;

export const FAKE_USER_PROFILE = usersData.primaryUser as unknown as User;

export const FAKE_AUTH_RESPONSE: AuthResponse = {
  accessToken: usersData.auth.accessToken,
  refreshToken: usersData.auth.refreshToken,
  user: FAKE_USER_PROFILE,
};

// ---------- Orgs ----------

export const FAKE_ORG_DETAILS =
  orgsData.orgs as unknown as Record<string, Org>;

export const FAKE_USER_ORGS: ListUserOrgs200 = {
  data: orgsData.userMemberships.map((m) => ({
    org: FAKE_ORG_DETAILS[m.orgId],
    membership: m.membership as ListUserOrgs200["data"][number]["membership"],
  })),
};

export const FAKE_ORG_STATS =
  orgsData.orgStats as unknown as Record<string, OrgStats>;

// ---------- Org members ----------

export const FAKE_ORG_MEMBERS =
  orgMembersData.membersByOrg as unknown as Record<string, OrgMemberDetail[]>;

// ---------- Learners ----------

export const FAKE_LEARNERS =
  learnersData.learners as unknown as Learner[];

// ---------- Cohorts ----------

export const FAKE_COHORTS =
  cohortsData.cohorts as unknown as Cohort[];

export const FAKE_COHORT_LEARNERS: Record<string, Learner[]> =
  Object.fromEntries(
    Object.entries(
      cohortsData.cohortLearnerIds as Record<string, string[]>
    ).map(([cohId, ids]) => [
      cohId,
      ids.map((id) => FAKE_LEARNERS.find((l) => l.id === id)!),
    ])
  );

// ---------- Collections ----------

export const FAKE_COLLECTIONS =
  collectionsData.collections as unknown as Collection[];

export const FAKE_BADGE_SUMMARIES =
  collectionsData.badgeSummaries as unknown as Record<
    string,
    CollectionDetail["badgeSummaries"]
  >;

export const FAKE_COLLECTION_STATS =
  collectionsData.collectionStats as unknown as Record<string, CollectionStats>;

// ---------- Badges ----------

export const FAKE_BADGES =
  badgesData.badges as unknown as Badge[];

// ---------- Programs ----------

export const FAKE_PROGRAMS =
  programsData.programs as unknown as Record<string, Program>;

export const FAKE_PROGRAM_PHASES =
  programsData.programPhases as unknown as Record<string, Phase[]>;

// ---------- Program assignments ----------

export const FAKE_COHORT_PROGRAM_ASSIGNMENTS =
  programAssignmentsData.cohortAssignments as unknown as Record<
    string,
    CohortProgramAssignment[]
  >;

export const FAKE_LEARNER_PROGRAM_ASSIGNMENTS =
  programAssignmentsData.learnerAssignments as unknown as Record<
    string,
    LearnerProgramAssignment[]
  >;

export const FAKE_CHECKPOINT_COMPLETIONS =
  programAssignmentsData.checkpointCompletions as unknown as Record<
    string,
    CheckpointCompletion[]
  >;

export const FAKE_LEARNER_BADGE_PROGRESS =
  programAssignmentsData.learnerBadgeProgress as unknown as Record<
    string,
    BadgeProgress[]
  >;

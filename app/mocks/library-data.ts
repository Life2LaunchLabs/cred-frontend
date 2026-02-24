/**
 * Mock data for the Credential Library feature.
 * Represents org_1's library of credential relationships (owned + authorized collections/badges).
 *
 * NOT generated — do not delete.
 */

import type {
  OrgCollectionRel,
  OrgBadgeRel,
  CredLibraryAnalytics,
  CredCollectionAnalytics,
  CredBadgeAnalytics,
} from '~/api/generated';
import { FAKE_COLLECTIONS, FAKE_BADGE_SUMMARIES } from './data';
import { CREATOR_COLLECTIONS, CREATOR_BADGE_SUMMARIES, CREATOR_BADGES } from './creator-data';

const ALL_COLLECTIONS_FOR_LIB = [...FAKE_COLLECTIONS, ...CREATOR_COLLECTIONS];
const ALL_BADGE_SUMMARIES_FOR_LIB = { ...FAKE_BADGE_SUMMARIES, ...CREATOR_BADGE_SUMMARIES };

// ─── Collection relationships for org_1 ──────────────────────────────────────
// org_1 owns col_1, col_2, col_3 (auto-active).
// col_rci_1 (Welding Fundamentals, published) is actively authorized.
// col_rci_2 (AWS D1.1, in review) has a pending auth request.
// col_7 (Compliance Essentials, external) is authorized.
// col_8 (Equipment Operations, external) is archived.

export const FAKE_ORG_COLLECTION_RELS: Record<string, OrgCollectionRel[]> = {
  org_1: [
    {
      id: 'ccr_1',
      orgId: 'org_1',
      collectionId: 'col_1',
      status: 'active',
      source: 'owned',
      programCount: 2,
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_1')!,
      statusChangedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 'ccr_2',
      orgId: 'org_1',
      collectionId: 'col_2',
      status: 'active',
      source: 'owned',
      programCount: 1,
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_2')!,
      statusChangedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 'ccr_3',
      orgId: 'org_1',
      collectionId: 'col_3',
      status: 'active',
      source: 'owned',
      programCount: 0,
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_3')!,
      statusChangedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 'ccr_4',
      orgId: 'org_1',
      collectionId: 'col_7',
      status: 'active',
      source: 'authorized',
      programCount: 1,
      authRequestId: 'iar_org1_ext1_1',
      notes: 'Approved for compliance training track',
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_7')!,
      requestedAt: '2025-09-01T00:00:00Z',
      approvedAt: '2025-09-12T00:00:00Z',
      statusChangedAt: '2025-09-12T00:00:00Z',
    },
    // Published creator collection (col_rci_1) — the anchor of the creator-side demo
    {
      id: 'ccr_5',
      orgId: 'org_1',
      collectionId: 'col_rci_1',
      status: 'active',
      source: 'authorized',
      programCount: 2,
      authRequestId: 'iar_org1_rci_1',
      notes: 'Primary welding certification pathway — approved via Real Credentials Inc portal',
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_rci_1')!,
      requestedAt: '2025-10-01T00:00:00Z',
      approvedAt: '2025-10-14T00:00:00Z',
      statusChangedAt: '2025-10-14T00:00:00Z',
    },
    // Pending auth request for AWS D1.1 (not yet published, but request is in flight)
    {
      id: 'ccr_6',
      orgId: 'org_1',
      collectionId: 'col_rci_2',
      status: 'pending',
      source: 'authorized',
      programCount: 0,
      authRequestId: 'iar_org1_rci_2',
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_rci_2')!,
      requestedAt: '2025-11-15T00:00:00Z',
      statusChangedAt: '2025-11-15T00:00:00Z',
    },
    // Archived authorized collection
    {
      id: 'ccr_7',
      orgId: 'org_1',
      collectionId: 'col_8',
      status: 'archived',
      source: 'authorized',
      programCount: 0,
      authRequestId: 'iar_org1_ext2_1',
      notes: 'Superseded by Equipment Operations v2 — archived Nov 2025',
      collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_8')!,
      requestedAt: '2025-06-01T00:00:00Z',
      approvedAt: '2025-06-10T00:00:00Z',
      statusChangedAt: '2025-11-01T00:00:00Z',
    },
  ],
};

// ─── Lookup by rel ID ─────────────────────────────────────────────────────────

export const FAKE_COLLECTION_REL_BY_ID: Record<string, OrgCollectionRel> = Object.fromEntries(
  Object.values(FAKE_ORG_COLLECTION_RELS)
    .flat()
    .map((rel) => [rel.id, rel])
);

// ─── Badge relationships (derived from badge summaries) ──────────────────────

// Deterministic per-badge program counts for key badges
const BADGE_PROGRAM_COUNTS: Record<string, number> = {
  // col_1 – Safety Certifications
  'cbr_ccr_1_1': 2, 'cbr_ccr_1_2': 2, 'cbr_ccr_1_3': 1, 'cbr_ccr_1_4': 1,
  // col_2 – Technical Skills
  'cbr_ccr_2_1': 1, 'cbr_ccr_2_2': 1,
  // col_4 – Compliance Essentials
  'cbr_ccr_4_1': 1, 'cbr_ccr_4_2': 1,
  // col_rci_1 – Welding Fundamentals (all 4 badges used in programs)
  'cbr_ccr_5_1': 2, 'cbr_ccr_5_2': 2, 'cbr_ccr_5_3': 1, 'cbr_ccr_5_4': 1,
};

function buildBadgeRelsForCollectionRel(colRel: OrgCollectionRel): OrgBadgeRel[] {
  const summaries = ALL_BADGE_SUMMARIES_FOR_LIB[colRel.collectionId] ?? [];
  const badgeStatus: OrgBadgeRel['status'] =
    colRel.status === 'archived' ? 'archived' :
    colRel.status === 'pending' ? 'pending' : 'active';

  return (summaries ?? []).map((summary, i) => {
    const relId = `cbr_${colRel.id}_${i + 1}`;
    return {
      id: relId,
      orgId: colRel.orgId,
      badgeId: summary!.id,
      collectionRelId: colRel.id,
      status: badgeStatus,
      programCount: BADGE_PROGRAM_COUNTS[relId] ?? 0,
      badge: {
        id: summary!.id,
        name: summary!.name,
        description: summary?.description,
        imageUrl: summary?.imageUrl,
        issuanceCount: summary?.issuanceCount,
      },
    };
  });
}

export const FAKE_ORG_BADGE_RELS: Record<string, OrgBadgeRel[]> = {};
export const FAKE_BADGE_REL_BY_ID: Record<string, OrgBadgeRel> = {};

for (const rel of FAKE_ORG_COLLECTION_RELS.org_1 ?? []) {
  const badgeRels = buildBadgeRelsForCollectionRel(rel);
  FAKE_ORG_BADGE_RELS[rel.id] = badgeRels;
  for (const br of badgeRels) {
    FAKE_BADGE_REL_BY_ID[br.id] = br;
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export const FAKE_LIBRARY_ANALYTICS: Record<string, CredLibraryAnalytics> = {
  org_1: {
    adoptionFunnel: {
      viewedInCatalog: 24,
      requested: 7,
      approved: 5,
      activeInLibrary: 5,
      referencedInPrograms: 4,
    },
    unusedActiveCount: 1,
    avgTimeToApprovalDays: 6.2,
    topCollections: [
      { collectionRelId: 'ccr_5', collectionName: 'Welding Fundamentals', programCount: 2 },
      { collectionRelId: 'ccr_1', collectionName: 'Safety Certifications', programCount: 2 },
      { collectionRelId: 'ccr_2', collectionName: 'Technical Skills', programCount: 1 },
      { collectionRelId: 'ccr_4', collectionName: 'Compliance Essentials', programCount: 1 },
    ],
  },
};

export const FAKE_COLLECTION_REL_ANALYTICS: Record<string, CredCollectionAnalytics> = {
  ccr_1: {
    collectionRelId: 'ccr_1',
    collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_1')!,
    programCount: 2,
    programs: [
      { id: 'prg_1', name: 'Safety Essentials Track', slug: 'safety-essentials-track' },
      { id: 'prg_2', name: 'New Employee Onboarding', slug: 'new-employee-onboarding' },
    ],
    badgeAdoption: [
      { badgeRelId: 'cbr_ccr_1_1', badgeName: 'OSHA 10-Hour General Industry', programCount: 2 },
      { badgeRelId: 'cbr_ccr_1_2', badgeName: 'Fire Safety Awareness', programCount: 2 },
      { badgeRelId: 'cbr_ccr_1_3', badgeName: 'Hazard Communication', programCount: 1 },
      { badgeRelId: 'cbr_ccr_1_4', badgeName: 'PPE Compliance', programCount: 1 },
    ],
  },
  ccr_5: {
    collectionRelId: 'ccr_5',
    collection: ALL_COLLECTIONS_FOR_LIB.find((c) => c.id === 'col_rci_1')!,
    programCount: 2,
    programs: [
      { id: 'prg_3', name: 'Welding Certification Pathway', slug: 'welding-certification-pathway' },
      { id: 'prg_4', name: 'Trade Skills Fundamentals', slug: 'trade-skills-fundamentals' },
    ],
    badgeAdoption: [
      { badgeRelId: 'cbr_ccr_5_1', badgeName: 'Weld Safety & PPE', programCount: 2 },
      { badgeRelId: 'cbr_ccr_5_2', badgeName: 'Oxy-Fuel Cutting Basics', programCount: 2 },
      { badgeRelId: 'cbr_ccr_5_3', badgeName: 'Shielded Metal Arc Welding (SMAW) Intro', programCount: 1 },
      { badgeRelId: 'cbr_ccr_5_4', badgeName: 'Weld Inspection Fundamentals', programCount: 1 },
    ],
  },
};

// Full-badge analytics for key badge rels (uses creator badges which have full criteria)
export const FAKE_BADGE_REL_ANALYTICS: Record<string, CredBadgeAnalytics> = {
  'cbr_ccr_5_1': {
    badgeRelId: 'cbr_ccr_5_1',
    badge: CREATOR_BADGES[0],
    programCount: 2,
    programs: [
      { id: 'prg_3', name: 'Welding Certification Pathway', slug: 'welding-certification-pathway' },
      { id: 'prg_4', name: 'Trade Skills Fundamentals', slug: 'trade-skills-fundamentals' },
    ],
  },
  'cbr_ccr_5_2': {
    badgeRelId: 'cbr_ccr_5_2',
    badge: CREATOR_BADGES[1],
    programCount: 2,
    programs: [
      { id: 'prg_3', name: 'Welding Certification Pathway', slug: 'welding-certification-pathway' },
      { id: 'prg_4', name: 'Trade Skills Fundamentals', slug: 'trade-skills-fundamentals' },
    ],
  },
};

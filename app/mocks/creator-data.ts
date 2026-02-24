/**
 * Mock data for the Creator Studio feature.
 * Represents Real Credentials Inc (org_rci) as the badge creator org.
 * Weldz-R-Us (org_wru) plays the role of issuer requesting authorization.
 *
 * NOT generated — do not delete.
 */

import type {
  Badge,
  Collection,
  CollectionDetail,
  CollectionStats,
  IssueAuthorizationRequestDetail,
} from '~/api/generated';
import { DEMO_ORGS } from './demo-personas';

// ── Badges owned by Real Credentials Inc ─────────────────────────────────────

export const CREATOR_BADGES: Badge[] = [
  // Welding Fundamentals badges
  {
    id: 'bdg_rci_1',
    name: 'Weld Safety & PPE',
    description: 'Demonstrates knowledge of essential welding safety procedures and proper use of personal protective equipment.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_1', label: 'Pass the welding safety knowledge assessment', isRequired: true },
      { id: 'cr_rci_2', label: 'Demonstrate correct PPE selection for each process', isRequired: true },
      { id: 'cr_rci_3', label: 'Complete fire watch and hot-work permit procedures', isRequired: false },
    ],
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-07-10T11:00:00Z',
  },
  {
    id: 'bdg_rci_2',
    name: 'Oxy-Fuel Cutting Basics',
    description: 'Awarded for demonstrated proficiency in oxy-fuel cutting setup, operation, and shutdown.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_4', label: 'Set up oxy-fuel equipment correctly', isRequired: true },
      { id: 'cr_rci_5', label: 'Perform a straight-line cut to tolerance', isRequired: true },
      { id: 'cr_rci_6', label: 'Execute safe shutdown and storage procedure', isRequired: true },
    ],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-07-12T09:00:00Z',
  },
  {
    id: 'bdg_rci_3',
    name: 'Shielded Metal Arc Welding (SMAW) Intro',
    description: 'Introductory SMAW badge covering electrode selection, machine setup, and basic flat-position welds.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_7', label: 'Select correct electrode for given base metal', isRequired: true },
      { id: 'cr_rci_8', label: 'Set machine parameters (amperage, polarity)', isRequired: true },
      { id: 'cr_rci_9', label: 'Complete a 1G flat-position bead weld', isRequired: true },
    ],
    createdAt: '2024-04-01T08:30:00Z',
    updatedAt: '2024-08-05T14:00:00Z',
  },
  {
    id: 'bdg_rci_4',
    name: 'Weld Inspection Fundamentals',
    description: 'Covers visual weld inspection methods, defect identification, and acceptance criteria.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_10', label: 'Identify the 7 primary visual weld defects', isRequired: true },
      { id: 'cr_rci_11', label: 'Apply AWS D1.1 acceptance criteria to sample welds', isRequired: true },
    ],
    createdAt: '2024-04-15T09:00:00Z',
    updatedAt: '2024-09-01T10:00:00Z',
  },

  // AWS D1.1 Prep badges
  {
    id: 'bdg_rci_5',
    name: 'AWS D1.1 Code Interpretation',
    description: 'Demonstrates ability to navigate and apply the AWS D1.1 Structural Welding Code for steel.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_12', label: 'Locate and interpret prequalified WPS requirements', isRequired: true },
      { id: 'cr_rci_13', label: 'Apply essential variable rules to a given scenario', isRequired: true },
      { id: 'cr_rci_14', label: 'Pass code interpretation written exam (≥80%)', isRequired: true },
    ],
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-09-10T11:00:00Z',
  },
  {
    id: 'bdg_rci_6',
    name: 'Welder Qualification Test – 3G',
    description: 'Awarded upon passing a SMAW 3G (vertical) plate qualification test per AWS D1.1.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_15', label: 'Complete 3G vertical groove weld test coupon', isRequired: true },
      { id: 'cr_rci_16', label: 'Pass visual inspection per AWS D1.1 Table 6.1', isRequired: true },
      { id: 'cr_rci_17', label: 'Pass mechanical testing (bend test or radiograph)', isRequired: true },
    ],
    createdAt: '2024-05-15T08:00:00Z',
    updatedAt: '2024-10-01T09:00:00Z',
  },
  {
    id: 'bdg_rci_7',
    name: 'Welder Qualification Test – 4G',
    description: 'Awarded upon passing a SMAW 4G (overhead) plate qualification test per AWS D1.1.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-45ab4c5f7a75?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_18', label: 'Complete 4G overhead groove weld test coupon', isRequired: true },
      { id: 'cr_rci_19', label: 'Pass visual inspection per AWS D1.1 Table 6.1', isRequired: true },
      { id: 'cr_rci_20', label: 'Pass mechanical testing', isRequired: true },
    ],
    createdAt: '2024-06-01T08:00:00Z',
    updatedAt: '2024-10-05T10:00:00Z',
  },

  // Weld Quality Inspector badges
  {
    id: 'bdg_rci_8',
    name: 'Non-Destructive Testing Overview',
    description: 'Surveys the five primary NDT methods: VT, MT, PT, UT, and RT — applications and limitations.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_21', label: 'Describe each NDT method and primary use case', isRequired: true },
      { id: 'cr_rci_22', label: 'Match NDT method to defect type scenario', isRequired: true },
    ],
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-10-10T11:00:00Z',
  },
  {
    id: 'bdg_rci_9',
    name: 'Ultrasonic Testing Level I',
    description: 'Demonstrates entry-level UT competency per ASNT SNT-TC-1A guidelines.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_23', label: 'Calibrate UT instrument to reference standard', isRequired: true },
      { id: 'cr_rci_24', label: 'Perform scan on test block and record indications', isRequired: true },
      { id: 'cr_rci_25', label: 'Pass written exam (≥70%)', isRequired: true },
    ],
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-10-15T09:00:00Z',
  },

  // Advanced Pipe Welding badges (draft collection)
  {
    id: 'bdg_rci_10',
    name: 'Pipe Fit-Up & Alignment',
    description: 'Covers pipe preparation, fit-up tolerances, and tack welding procedures for butt joints.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_26', label: 'Prepare pipe end to beveling specification', isRequired: true },
      { id: 'cr_rci_27', label: 'Achieve fit-up alignment within 1/16" tolerance', isRequired: true },
    ],
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
  {
    id: 'bdg_rci_11',
    name: 'GTAW Root Pass – 6G',
    description: 'Demonstrates GTAW root pass competency in the 6G fixed-pipe position.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_28', label: 'Complete full root pass on 2" schedule 80 pipe', isRequired: true },
      { id: 'cr_rci_29', label: 'Pass visual inspection (no cracks, incomplete fusion)', isRequired: true },
    ],
    createdAt: '2024-08-15T08:00:00Z',
    updatedAt: '2024-11-05T11:00:00Z',
  },
  {
    id: 'bdg_rci_12',
    name: '6G Pipe Qualification',
    description: 'Full 6G position pipe weld qualification per ASME Section IX.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=256&h=256&fit=crop',
    criteria: [
      { id: 'cr_rci_30', label: 'Complete multi-pass 6G pipe weld', isRequired: true },
      { id: 'cr_rci_31', label: 'Pass radiographic examination', isRequired: true },
      { id: 'cr_rci_32', label: 'Pass bend test', isRequired: true },
    ],
    createdAt: '2024-09-01T09:00:00Z',
    updatedAt: '2024-11-10T10:00:00Z',
  },
];

// ── Collections owned by Real Credentials Inc ────────────────────────────────

export const CREATOR_COLLECTIONS: Collection[] = [
  {
    id: 'col_rci_1',
    name: 'Welding Fundamentals',
    description:
      'A comprehensive entry-level collection covering safety, cutting, and SMAW basics for anyone new to the welding trade.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=400&fit=crop',
    badgeCount: 4,
    status: 'published',
    published: true,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-08-20T10:00:00Z',
  },
  {
    id: 'col_rci_2',
    name: 'AWS D1.1 Certification Prep',
    description:
      'Structured credential pathway for welders preparing for AWS D1.1 structural steel qualification tests.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop',
    badgeCount: 3,
    status: 'in_review',
    published: false,
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-10-12T14:00:00Z',
  },
  {
    id: 'col_rci_3',
    name: 'Weld Quality Inspector',
    description:
      'For CWI candidates and QA staff — covers visual inspection, NDT methods, and code application.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=1200&h=400&fit=crop',
    badgeCount: 2,
    status: 'changes_requested',
    published: false,
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'col_rci_4',
    name: 'Advanced Pipe Welding',
    description:
      'Expert-level collection for welders pursuing pipe certifications in the 6G fixed position.',
    createdByOrgId: 'org_rci',
    imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1200&h=400&fit=crop',
    badgeCount: 3,
    status: 'draft',
    published: false,
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
];

// ── Badge summaries per collection (for CollectionDetail) ────────────────────

export const CREATOR_BADGE_SUMMARIES: Record<
  string,
  CollectionDetail['badgeSummaries']
> = {
  col_rci_1: [
    { id: 'bdg_rci_1', name: 'Weld Safety & PPE', description: CREATOR_BADGES[0].description, imageUrl: CREATOR_BADGES[0].imageUrl, issuanceCount: 312 },
    { id: 'bdg_rci_2', name: 'Oxy-Fuel Cutting Basics', description: CREATOR_BADGES[1].description, imageUrl: CREATOR_BADGES[1].imageUrl, issuanceCount: 287 },
    { id: 'bdg_rci_3', name: 'Shielded Metal Arc Welding (SMAW) Intro', description: CREATOR_BADGES[2].description, imageUrl: CREATOR_BADGES[2].imageUrl, issuanceCount: 241 },
    { id: 'bdg_rci_4', name: 'Weld Inspection Fundamentals', description: CREATOR_BADGES[3].description, imageUrl: CREATOR_BADGES[3].imageUrl, issuanceCount: 198 },
  ],
  col_rci_2: [
    { id: 'bdg_rci_5', name: 'AWS D1.1 Code Interpretation', description: CREATOR_BADGES[4].description, imageUrl: CREATOR_BADGES[4].imageUrl, issuanceCount: 47 },
    { id: 'bdg_rci_6', name: 'Welder Qualification Test – 3G', description: CREATOR_BADGES[5].description, imageUrl: CREATOR_BADGES[5].imageUrl, issuanceCount: 38 },
    { id: 'bdg_rci_7', name: 'Welder Qualification Test – 4G', description: CREATOR_BADGES[6].description, imageUrl: CREATOR_BADGES[6].imageUrl, issuanceCount: 21 },
  ],
  col_rci_3: [
    { id: 'bdg_rci_8', name: 'Non-Destructive Testing Overview', description: CREATOR_BADGES[7].description, imageUrl: CREATOR_BADGES[7].imageUrl, issuanceCount: 14 },
    { id: 'bdg_rci_9', name: 'Ultrasonic Testing Level I', description: CREATOR_BADGES[8].description, imageUrl: CREATOR_BADGES[8].imageUrl, issuanceCount: 6 },
  ],
  col_rci_4: [
    { id: 'bdg_rci_10', name: 'Pipe Fit-Up & Alignment', description: CREATOR_BADGES[9].description, imageUrl: CREATOR_BADGES[9].imageUrl, issuanceCount: 0 },
    { id: 'bdg_rci_11', name: 'GTAW Root Pass – 6G', description: CREATOR_BADGES[10].description, imageUrl: CREATOR_BADGES[10].imageUrl, issuanceCount: 0 },
    { id: 'bdg_rci_12', name: '6G Pipe Qualification', description: CREATOR_BADGES[11].description, imageUrl: CREATOR_BADGES[11].imageUrl, issuanceCount: 0 },
  ],
};

// ── Collection stats ──────────────────────────────────────────────────────────

export const CREATOR_COLLECTION_STATS: Record<string, CollectionStats> = {
  col_rci_1: { totalIssuances: 1038, uniqueLearners: 214, badgeCount: 4, averageCompletionRate: 68.4 },
  col_rci_2: { totalIssuances: 106, uniqueLearners: 54, badgeCount: 3, averageCompletionRate: 41.2 },
  col_rci_3: { totalIssuances: 20, uniqueLearners: 14, badgeCount: 2, averageCompletionRate: 22.0 },
  col_rci_4: { totalIssuances: 0, uniqueLearners: 0, badgeCount: 3, averageCompletionRate: 0 },
};

// ── Issue authorization requests ──────────────────────────────────────────────
// Weldz-R-Us (org_wru) is requesting to issue Real Credentials Inc's collections

export const CREATOR_AUTH_REQUESTS: IssueAuthorizationRequestDetail[] = [
  {
    id: 'iar_1',
    collectionId: 'col_rci_1',
    requestingOrgId: 'org_wru',
    status: 'pending',
    message:
      "We run apprenticeship programs for 200+ welding students annually and would like to offer the Welding Fundamentals badges as part of our entry-level curriculum.",
    createdAt: '2025-01-08T14:32:00Z',
    requestingOrg: DEMO_ORGS.org_wru,
    collection: { id: 'col_rci_1', name: 'Welding Fundamentals', badgeCount: 4 },
  },
  {
    id: 'iar_2',
    collectionId: 'col_rci_2',
    requestingOrgId: 'org_wru',
    status: 'pending',
    message:
      "Our journeyman welders are preparing for AWS D1.1 structural qualification. This collection aligns perfectly with our training outcomes.",
    createdAt: '2025-01-10T09:15:00Z',
    requestingOrg: DEMO_ORGS.org_wru,
    collection: { id: 'col_rci_2', name: 'AWS D1.1 Certification Prep', badgeCount: 3 },
  },
  {
    id: 'iar_3',
    collectionId: 'col_rci_1',
    requestingOrgId: 'org_1',
    status: 'approved',
    message: "We'd like to use your Welding Fundamentals badges in our workforce development program.",
    createdAt: '2024-11-20T11:00:00Z',
    decisionNote: 'Approved — strong alignment with your program description and track record.',
    decidedAt: '2024-11-22T15:30:00Z',
    // org_1 is Cert-R-Us (from existing mock data)
    requestingOrg: {
      id: 'org_1',
      name: 'Cert-R-Us',
      slug: 'cert-r-us',
      about: 'Leading badge creation and credentialing organization.',
      location: 'Austin, TX',
      createdAt: '2023-09-01T08:00:00Z',
    },
    collection: { id: 'col_rci_1', name: 'Welding Fundamentals', badgeCount: 4 },
  },
];

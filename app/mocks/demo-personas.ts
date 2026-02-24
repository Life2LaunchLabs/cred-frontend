/**
 * Demo personas for the user switcher (dev / demo mode only).
 * This file is NOT generated — do not delete.
 */

import type { ListUserOrgs200, Org, OrgMember, OrgStats, User } from '~/api/generated';

// ── New demo orgs ─────────────────────────────────────────────────────────────

export const DEMO_ORGS: Record<string, Org> = {
  org_rci: {
    id: 'org_rci',
    name: 'Real Credentials Inc',
    slug: 'real-credentials',
    about:
      'Real Credentials Inc is a professional credentialing organization focused on workforce development and skills verification.',
    contactEmail: 'contact@realcredentials.com',
    website: 'https://realcredentials.com',
    location: 'Chicago, IL',
    features: ['creator'],
    createdAt: '2024-01-20T09:00:00Z',
  },
  org_wru: {
    id: 'org_wru',
    name: 'Weldz-R-Us',
    slug: 'weldz-r-us',
    about:
      'Weldz-R-Us provides industry-recognized welding credentials and training programs for skilled tradespeople.',
    contactEmail: 'admin@weldzrus.com',
    website: 'https://weldzrus.com',
    location: 'Detroit, MI',
    features: ['issuer'],
    createdAt: '2023-06-15T08:00:00Z',
  },
};

export const DEMO_ORG_STATS: Record<string, OrgStats> = {
  org_rci: {
    totalMembers: 3,
    totalLearners: 92,
    totalBadges: 11,
    totalIssuances: 438,
    activeLearners: 78,
    badgesIssuedThisMonth: 21,
    badgesIssuedThisYear: 312,
  },
  org_wru: {
    totalMembers: 5,
    totalLearners: 214,
    totalBadges: 17,
    totalIssuances: 1027,
    activeLearners: 196,
    badgesIssuedThisMonth: 38,
    badgesIssuedThisYear: 541,
  },
};

// ── Demo user profiles ────────────────────────────────────────────────────────

const BADGE_CREATOR: User = {
  id: 'usr_demo_creator',
  email: 'creator@real-credentials.com',
  name: 'Morgan Blake',
  title: 'Credential Designer',
  location: 'Chicago, IL',
  bio: 'Designing meaningful credentials that connect skills to opportunities.',
  profileImageUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face',
  createdAt: '2024-02-01T10:00:00Z',
};

const ISSUER_ADMIN: User = {
  id: 'usr_demo_admin',
  email: 'admin@weldzrus.com',
  name: 'Jordan Taylor',
  title: 'Training & Certification Manager',
  location: 'Detroit, MI',
  bio: 'Managing workforce credentialing programs for welding professionals.',
  profileImageUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face',
  createdAt: '2023-07-01T08:00:00Z',
};

const ISSUER_STAFF: User = {
  id: 'usr_demo_staff',
  email: 'staff@weldzrus.com',
  name: 'Sam Rivera',
  title: 'Badge Coordinator',
  location: 'Detroit, MI',
  bio: 'Coordinating badge issuance and learner progress tracking.',
  profileImageUrl:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=face',
  createdAt: '2023-11-10T09:00:00Z',
};

const LEARNER: User = {
  id: 'usr_demo_learner',
  email: 'learner@example.com',
  name: 'Casey Kim',
  title: 'Welding Apprentice',
  location: 'Detroit, MI',
  bio: 'Working toward AWS D1.1 certification.',
  profileImageUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=face',
  createdAt: '2024-09-01T11:00:00Z',
};

export const DEMO_USER_PROFILES: Record<string, User> = {
  usr_demo_creator: BADGE_CREATOR,
  usr_demo_admin: ISSUER_ADMIN,
  usr_demo_staff: ISSUER_STAFF,
  usr_demo_learner: LEARNER,
};

// ── Per-user org memberships ──────────────────────────────────────────────────

function membership(
  id: string,
  orgId: string,
  userId: string,
  role: OrgMember['role'],
): OrgMember {
  return { id, orgId, userId, role, status: 'active' };
}

export const DEMO_USER_ORGS: Record<string, ListUserOrgs200> = {
  usr_demo_creator: {
    data: [
      {
        org: DEMO_ORGS.org_rci,
        membership: membership('mem_demo_1', 'org_rci', 'usr_demo_creator', 'owner'),
      },
    ],
  },
  usr_demo_admin: {
    data: [
      {
        org: DEMO_ORGS.org_wru,
        membership: membership('mem_demo_2', 'org_wru', 'usr_demo_admin', 'admin'),
      },
    ],
  },
  usr_demo_staff: {
    data: [
      {
        org: DEMO_ORGS.org_wru,
        membership: membership('mem_demo_3', 'org_wru', 'usr_demo_staff', 'issuer'),
      },
    ],
  },
  usr_demo_learner: {
    data: [],
  },
};

// ── Persona list (consumed by UserSelectContent) ──────────────────────────────

export interface DemoPersona {
  id: string;
  user: User;
  token: string;
  /** Short label shown in the dropdown (e.g. "Badge Creator") */
  label: string;
  /** Subtitle shown under the label (org name, or "No organization") */
  description: string;
  /** Navigate here after switching; null = navigate to "/" */
  defaultOrgSlug: string | null;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'usr_demo_creator',
    user: BADGE_CREATOR,
    token: 'demo-token-creator',
    label: 'Badge Creator',
    description: 'Real Credentials Inc',
    defaultOrgSlug: 'real-credentials',
  },
  {
    id: 'usr_demo_admin',
    user: ISSUER_ADMIN,
    token: 'demo-token-admin',
    label: 'Issuer Admin',
    description: 'Weldz-R-Us',
    defaultOrgSlug: 'weldz-r-us',
  },
  {
    id: 'usr_demo_staff',
    user: ISSUER_STAFF,
    token: 'demo-token-staff',
    label: 'Issuer Staff',
    description: 'Weldz-R-Us',
    defaultOrgSlug: 'weldz-r-us',
  },
  {
    id: 'usr_demo_learner',
    user: LEARNER,
    token: 'demo-token-learner',
    label: 'Learner',
    description: 'No organization',
    defaultOrgSlug: null,
  },
];

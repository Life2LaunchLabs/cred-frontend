import { http, HttpResponse } from "msw";
import type {
  AuthResponse,
  Collection,
  CollectionDetail,
  CollectionStats,
  LoginRequest,
  ListUserOrgs200,
  Org,
  OrgMemberDetail,
  OrgStats,
  User,
} from "~/api/generated";

const FAKE_USER = {
  email: "user@fake.com",
  password: "12345678",
};

const FAKE_USER_PROFILE: User = {
  id: "usr_1",
  email: FAKE_USER.email,
  name: "Fake User",
  profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face",
  coverImageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
  bio: "Credentialing specialist with 8+ years of experience in open badges, micro-credentials, and workforce development. Passionate about making skills visible and verifiable.",
  title: "Director of Credentialing",
  location: "Austin, TX",
  socialLinks: {
    linkedin: "https://linkedin.com/in/fakeuser",
    website: "https://fakeuser.dev",
    x: "https://x.com/fakeuser",
  },
  createdAt: "2024-03-15T10:30:00Z",
};

const FAKE_AUTH_RESPONSE: AuthResponse = {
  accessToken: "fake-jwt-access-token",
  refreshToken: "fake-jwt-refresh-token",
  user: FAKE_USER_PROFILE,
};

// ---------- Org details ----------

const FAKE_ORG_DETAILS: Record<string, Org> = {
  org_1: {
    id: "org_1",
    name: "Cert-R-Us",
    about:
      "Cert-R-Us is a leading badge creation and credentialing organization specializing in workforce development, micro-credentials, and skills verification for professionals across industries.",
    imageUrl:
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=256&h=256&fit=crop",
    coverImageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
    contactEmail: "contact@certrus.com",
    phone: "+1 (512) 555-0100",
    website: "https://certrus.com",
    location: "Austin, TX",
    socialLinks: {
      linkedin: "https://linkedin.com/company/certrus",
      website: "https://certrus.com",
      x: "https://x.com/certrus",
    },
    createdAt: "2023-09-01T08:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
  },
  org_2: {
    id: "org_2",
    name: "Edu System",
    about:
      "Educational platform connecting learners with industry-recognized credentials and micro-certifications. We partner with universities and employers to bridge the skills gap.",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=256&h=256&fit=crop",
    coverImageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop",
    contactEmail: "contact@edusystem.com",
    phone: "+1 (415) 555-0200",
    website: "https://edusystem.com",
    location: "San Francisco, CA",
    socialLinks: {
      linkedin: "https://linkedin.com/company/edusystem",
      website: "https://edusystem.com",
    },
    createdAt: "2024-01-10T12:00:00Z",
  },
  org_3: {
    id: "org_3",
    name: "Learner Help",
    about: "Learner support org helping individuals navigate credential pathways and connect with opportunities.",
    contactEmail: "contact@learnerhelp.com",
    location: "Denver, CO",
    createdAt: "2024-06-20T09:00:00Z",
  },
};

const FAKE_USER_ORGS: ListUserOrgs200 = {
  data: [
    {
      org: FAKE_ORG_DETAILS.org_1,
      membership: {
        id: "mem_1",
        orgId: "org_1",
        userId: "usr_1",
        role: "owner",
        status: "active",
      },
    },
    {
      org: FAKE_ORG_DETAILS.org_2,
      membership: {
        id: "mem_2",
        orgId: "org_2",
        userId: "usr_1",
        role: "admin",
        status: "active",
      },
    },
    {
      org: FAKE_ORG_DETAILS.org_3,
      membership: {
        id: "mem_3",
        orgId: "org_3",
        userId: "usr_1",
        role: "viewer",
        status: "active",
      },
    },
  ],
};

// ---------- Org members ----------

const FAKE_ORG_MEMBERS: Record<string, OrgMemberDetail[]> = {
  org_1: [
    {
      id: "mem_1",
      orgId: "org_1",
      userId: "usr_1",
      role: "owner",
      status: "active",
      createdAt: "2023-09-01T08:00:00Z",
      user: FAKE_USER_PROFILE,
    },
    {
      id: "mem_4",
      orgId: "org_1",
      userId: "usr_2",
      role: "admin",
      status: "active",
      createdAt: "2023-10-15T10:00:00Z",
      user: {
        id: "usr_2",
        email: "sarah@certrus.com",
        name: "Sarah Chen",
        profileImageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face",
        title: "Program Manager",
      },
    },
    {
      id: "mem_5",
      orgId: "org_1",
      userId: "usr_3",
      role: "issuer",
      status: "active",
      createdAt: "2024-02-01T09:00:00Z",
      user: {
        id: "usr_3",
        email: "mike@certrus.com",
        name: "Mike Rodriguez",
        title: "Badge Issuer",
      },
    },
    {
      id: "mem_6",
      orgId: "org_1",
      userId: "usr_4",
      role: "viewer",
      status: "active",
      createdAt: "2024-06-10T11:00:00Z",
      user: {
        id: "usr_4",
        email: "emma@certrus.com",
        name: "Emma Williams",
        title: "Quality Reviewer",
      },
    },
  ],
  org_2: [
    {
      id: "mem_2",
      orgId: "org_2",
      userId: "usr_1",
      role: "admin",
      status: "active",
      createdAt: "2024-01-10T12:00:00Z",
      user: FAKE_USER_PROFILE,
    },
    {
      id: "mem_7",
      orgId: "org_2",
      userId: "usr_5",
      role: "owner",
      status: "active",
      createdAt: "2024-01-10T12:00:00Z",
      user: {
        id: "usr_5",
        email: "alex@edusystem.com",
        name: "Alex Thompson",
        profileImageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face",
        title: "Founder & CEO",
      },
    },
  ],
  org_3: [
    {
      id: "mem_3",
      orgId: "org_3",
      userId: "usr_1",
      role: "viewer",
      status: "active",
      createdAt: "2024-06-20T09:00:00Z",
      user: FAKE_USER_PROFILE,
    },
  ],
};

// ---------- Collections ----------

const FAKE_COLLECTIONS: Collection[] = [
  // Created by org_1 (Cert-R-Us)
  {
    id: "col_1",
    name: "Safety Certifications",
    description: "Comprehensive safety training badges covering OSHA standards, workplace hazards, and emergency procedures.",
    createdByOrgId: "org_1",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop",
    badgeCount: 12,
    published: true,
    createdAt: "2023-11-01T10:00:00Z",
  },
  {
    id: "col_2",
    name: "Technical Skills",
    description: "Core technical competencies for software development and IT infrastructure.",
    createdByOrgId: "org_1",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
    badgeCount: 8,
    published: false,
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "col_3",
    name: "Onboarding Basics",
    description: "Essential onboarding badges for new hires joining the organization.",
    createdByOrgId: "org_1",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop",
    badgeCount: 4,
    published: false,
    createdAt: "2024-03-20T14:00:00Z",
  },
  // Created by org_2 (Edu System)
  {
    id: "col_4",
    name: "Leadership Training",
    description: "Leadership development program covering management, communication, and strategic thinking.",
    createdByOrgId: "org_2",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop",
    badgeCount: 5,
    published: true,
    createdAt: "2024-02-10T11:00:00Z",
  },
  {
    id: "col_5",
    name: "Professional Development",
    description: "Continuous learning badges for career growth and professional skills.",
    createdByOrgId: "org_2",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop",
    badgeCount: 20,
    published: true,
    createdAt: "2024-04-05T08:00:00Z",
  },
  // Created by org_3 (Learner Help)
  {
    id: "col_6",
    name: "Digital Literacy",
    description: "Foundational digital skills for learners navigating the modern workforce.",
    createdByOrgId: "org_3",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
    badgeCount: 6,
    published: true,
    createdAt: "2024-07-01T10:00:00Z",
  },
  // Created by external orgs (not in user's orgs)
  {
    id: "col_7",
    name: "Compliance Essentials",
    description: "Industry compliance certifications covering regulatory standards and best practices.",
    createdByOrgId: "org_ext_1",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=200&fit=crop",
    badgeCount: 15,
    published: true,
    createdAt: "2024-05-12T09:00:00Z",
  },
  {
    id: "col_8",
    name: "Equipment Operations",
    description: "Certification badges for operating heavy machinery and specialized equipment.",
    createdByOrgId: "org_ext_2",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
    badgeCount: 7,
    published: true,
    createdAt: "2024-06-18T13:00:00Z",
  },
];

// ---------- Collection details ----------

const FAKE_BADGE_SUMMARIES: Record<string, CollectionDetail['badgeSummaries']> = {
  col_1: [
    { id: "bdg_1", name: "OSHA 10-Hour General Industry", description: "Foundational OSHA safety training for general industry workers.", imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&h=128&fit=crop", issuanceCount: 245 },
    { id: "bdg_2", name: "Fire Safety Awareness", description: "Covers fire prevention, evacuation procedures, and extinguisher use.", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=128&h=128&fit=crop", issuanceCount: 189 },
    { id: "bdg_3", name: "Hazard Communication", description: "Understanding chemical hazards and SDS documentation.", imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=128&h=128&fit=crop", issuanceCount: 156 },
    { id: "bdg_4", name: "PPE Compliance", description: "Proper selection and use of personal protective equipment.", imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=128&h=128&fit=crop", issuanceCount: 203 },
    { id: "bdg_5", name: "Emergency Response", description: "Procedures for workplace emergencies including spills and injuries.", imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=128&h=128&fit=crop", issuanceCount: 134 },
    { id: "bdg_6", name: "Ergonomics Fundamentals", description: "Workplace ergonomics to prevent musculoskeletal disorders.", imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&h=128&fit=crop", issuanceCount: 98 },
  ],
  col_2: [
    { id: "bdg_7", name: "Git Version Control", description: "Proficiency in Git workflows including branching and merging.", imageUrl: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=128&h=128&fit=crop", issuanceCount: 312 },
    { id: "bdg_8", name: "REST API Design", description: "Designing clean, documented RESTful APIs.", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=128&h=128&fit=crop", issuanceCount: 178 },
    { id: "bdg_9", name: "Cloud Fundamentals", description: "Core cloud computing concepts across AWS, Azure, and GCP.", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&h=128&fit=crop", issuanceCount: 267 },
    { id: "bdg_10", name: "Docker Containers", description: "Building, running, and orchestrating containerized applications.", imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=128&h=128&fit=crop", issuanceCount: 145 },
  ],
  col_3: [
    { id: "bdg_11", name: "Company Culture", description: "Understanding organizational values and workplace expectations.", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop", issuanceCount: 67 },
    { id: "bdg_12", name: "Systems Access", description: "Setting up accounts and accessing key internal systems.", imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&h=128&fit=crop", issuanceCount: 82 },
    { id: "bdg_13", name: "Security Basics", description: "Information security fundamentals and best practices.", imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=128&h=128&fit=crop", issuanceCount: 91 },
    { id: "bdg_14", name: "Benefits Orientation", description: "Overview of health insurance, 401k, and company benefits.", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&h=128&fit=crop", issuanceCount: 73 },
  ],
  col_4: [
    { id: "bdg_15", name: "Communication Skills", description: "Effective professional communication strategies.", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop", issuanceCount: 89 },
    { id: "bdg_16", name: "Strategic Thinking", description: "Frameworks for strategic planning and decision-making.", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&h=128&fit=crop", issuanceCount: 67 },
    { id: "bdg_17", name: "Team Management", description: "Leading and motivating teams for peak performance.", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&h=128&fit=crop", issuanceCount: 54 },
  ],
  col_5: [
    { id: "bdg_18", name: "Time Management", description: "Prioritization and productivity techniques.", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=128&h=128&fit=crop", issuanceCount: 423 },
    { id: "bdg_19", name: "Public Speaking", description: "Confident presentation and public speaking skills.", imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=128&h=128&fit=crop", issuanceCount: 298 },
    { id: "bdg_20", name: "Conflict Resolution", description: "Navigating workplace conflicts with professionalism.", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop", issuanceCount: 267 },
  ],
  col_6: [
    { id: "bdg_21", name: "Computer Basics", description: "Fundamental computer skills and file management.", imageUrl: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=128&h=128&fit=crop", issuanceCount: 156 },
    { id: "bdg_22", name: "Email Communication", description: "Professional email etiquette and management.", imageUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=128&h=128&fit=crop", issuanceCount: 134 },
    { id: "bdg_23", name: "Online Safety", description: "Protecting personal information and avoiding scams.", imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=128&h=128&fit=crop", issuanceCount: 97 },
  ],
  col_7: [
    { id: "bdg_24", name: "HIPAA Compliance", description: "Healthcare privacy and security regulations.", imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=128&h=128&fit=crop", issuanceCount: 589 },
    { id: "bdg_25", name: "SOX Reporting", description: "Sarbanes-Oxley financial reporting requirements.", imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=128&h=128&fit=crop", issuanceCount: 234 },
    { id: "bdg_26", name: "GDPR Fundamentals", description: "European data protection regulation compliance.", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=128&h=128&fit=crop", issuanceCount: 412 },
  ],
  col_8: [
    { id: "bdg_27", name: "Forklift Operation", description: "Certified forklift operation and safety procedures.", imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&h=128&fit=crop", issuanceCount: 178 },
    { id: "bdg_28", name: "Crane Safety", description: "Overhead crane operation and rigging procedures.", imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&h=128&fit=crop", issuanceCount: 145 },
    { id: "bdg_29", name: "Equipment Inspection", description: "Pre-operation inspection protocols and maintenance checks.", imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=128&h=128&fit=crop", issuanceCount: 122 },
  ],
};

const FAKE_COLLECTION_STATS: Record<string, CollectionStats> = {
  col_1: { totalIssuances: 1025, uniqueLearners: 420, badgeCount: 12, averageCompletionRate: 72.3 },
  col_2: { totalIssuances: 902, uniqueLearners: 315, badgeCount: 8, averageCompletionRate: 58.1 },
  col_3: { totalIssuances: 313, uniqueLearners: 156, badgeCount: 4, averageCompletionRate: 81.5 },
  col_4: { totalIssuances: 210, uniqueLearners: 134, badgeCount: 5, averageCompletionRate: 65.0 },
  col_5: { totalIssuances: 988, uniqueLearners: 623, badgeCount: 20, averageCompletionRate: 44.2 },
  col_6: { totalIssuances: 387, uniqueLearners: 201, badgeCount: 6, averageCompletionRate: 76.8 },
  col_7: { totalIssuances: 1235, uniqueLearners: 890, badgeCount: 15, averageCompletionRate: 52.1 },
  col_8: { totalIssuances: 445, uniqueLearners: 178, badgeCount: 7, averageCompletionRate: 69.4 },
};

// ---------- Org stats ----------

const FAKE_ORG_STATS: Record<string, OrgStats> = {
  org_1: {
    totalMembers: 4,
    totalLearners: 347,
    totalBadges: 24,
    totalIssuances: 1583,
    activeLearners: 310,
    badgesIssuedThisMonth: 47,
    badgesIssuedThisYear: 892,
  },
  org_2: {
    totalMembers: 2,
    totalLearners: 128,
    totalBadges: 8,
    totalIssuances: 456,
    activeLearners: 115,
    badgesIssuedThisMonth: 12,
    badgesIssuedThisYear: 203,
  },
  org_3: {
    totalMembers: 1,
    totalLearners: 45,
    totalBadges: 3,
    totalIssuances: 67,
    activeLearners: 38,
    badgesIssuedThisMonth: 5,
    badgesIssuedThisYear: 41,
  },
};

// ---------- Handlers ----------

export const handlers = [
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
          email: body.email,
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
];

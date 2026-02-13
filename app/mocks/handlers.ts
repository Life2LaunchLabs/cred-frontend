import { http, HttpResponse, passthrough } from "msw";
import type {
  AuthResponse,
  Badge,
  Collection,
  CollectionDetail,
  CollectionStats,
  Cohort,
  CohortDetail,
  Learner,
  LoginRequest,
  ListUserOrgs200,
  Org,
  OrgMemberDetail,
  OrgStats,
  User,
  Program,
  ProgramDetail,
  Phase,
  Checkpoint,
  CohortProgramAssignment,
  CohortProgramAssignmentDetail,
  LearnerProgramAssignment,
  LearnerProgramAssignmentDetail,
  CheckpointCompletion,
  ProgramProgress,
  PhaseProgress,
  PhaseDueDate,
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
    slug: "cert-r-us",
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
    slug: "edu-system",
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
    slug: "learner-help",
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

// ---------- Badges (full detail) ----------

const FAKE_BADGES: Badge[] = [
  // col_1 – Safety Certifications (org_1)
  {
    id: "bdg_1", name: "OSHA 10-Hour General Industry",
    description: "Foundational OSHA safety training for general industry workers. Covers hazard identification, worker rights, and employer responsibilities under OSHA regulations.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2023-11-05T10:00:00Z",
    criteria: [
      { id: "cr_1", label: "Complete all 10 hours of OSHA coursework", isRequired: true },
      { id: "cr_2", label: "Pass the final assessment with 70% or higher", isRequired: true },
      { id: "cr_3", label: "Attend a live Q&A session with an instructor", isRequired: false },
    ],
  },
  {
    id: "bdg_2", name: "Fire Safety Awareness",
    description: "Covers fire prevention, evacuation procedures, and extinguisher use. Participants learn to identify fire hazards and respond effectively to fire emergencies in the workplace.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2023-11-10T10:00:00Z",
    criteria: [
      { id: "cr_4", label: "Complete fire prevention training module", isRequired: true },
      { id: "cr_5", label: "Demonstrate correct fire extinguisher technique", isRequired: true },
      { id: "cr_6", label: "Participate in an evacuation drill", isRequired: true },
    ],
  },
  {
    id: "bdg_3", name: "Hazard Communication",
    description: "Understanding chemical hazards and SDS documentation. Learn to read Safety Data Sheets, properly label containers, and communicate chemical risks to coworkers.",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2023-12-01T10:00:00Z",
    criteria: [
      { id: "cr_7", label: "Identify all GHS pictograms and their meanings", isRequired: true },
      { id: "cr_8", label: "Correctly interpret a Safety Data Sheet", isRequired: true },
      { id: "cr_9", label: "Complete the hazard communication quiz", isRequired: true },
    ],
  },
  {
    id: "bdg_4", name: "PPE Compliance",
    description: "Proper selection and use of personal protective equipment. Covers eye protection, gloves, respiratory protection, and hearing conservation in various work environments.",
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2023-12-15T10:00:00Z",
    criteria: [
      { id: "cr_10", label: "Complete PPE selection training for your role", isRequired: true },
      { id: "cr_11", label: "Pass a fit test for respiratory protection", isRequired: false },
      { id: "cr_12", label: "Demonstrate proper donning and doffing procedures", isRequired: true },
    ],
  },
  {
    id: "bdg_5", name: "Emergency Response",
    description: "Procedures for workplace emergencies including spills and injuries. Learn to activate emergency systems, administer basic first aid, and coordinate with emergency services.",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-01-05T10:00:00Z",
    criteria: [
      { id: "cr_13", label: "Complete emergency action plan training", isRequired: true },
      { id: "cr_14", label: "Obtain basic first aid certification", isRequired: true },
      { id: "cr_15", label: "Participate in a tabletop emergency exercise", isRequired: false },
    ],
  },
  {
    id: "bdg_6", name: "Ergonomics Fundamentals",
    description: "Workplace ergonomics to prevent musculoskeletal disorders. Covers workstation setup, proper lifting technique, and strategies for reducing repetitive strain injuries.",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-01-20T10:00:00Z",
    criteria: [
      { id: "cr_16", label: "Complete the ergonomics awareness module", isRequired: true },
      { id: "cr_17", label: "Submit a workstation self-assessment", isRequired: true },
      { id: "cr_18", label: "Demonstrate safe lifting technique", isRequired: false },
    ],
  },
  // col_2 – Technical Skills (org_1)
  {
    id: "bdg_7", name: "Git Version Control",
    description: "Proficiency in Git workflows including branching and merging. Covers commit hygiene, pull request reviews, rebasing, and collaborative development patterns.",
    imageUrl: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-01-20T09:00:00Z",
    criteria: [
      { id: "cr_19", label: "Create and manage feature branches", isRequired: true },
      { id: "cr_20", label: "Resolve a merge conflict in a pull request", isRequired: true },
      { id: "cr_21", label: "Use interactive rebase to clean up commit history", isRequired: false },
    ],
  },
  {
    id: "bdg_8", name: "REST API Design",
    description: "Designing clean, documented RESTful APIs. Covers resource modeling, HTTP methods, status codes, versioning, and OpenAPI specification authoring.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-02-01T09:00:00Z",
    criteria: [
      { id: "cr_22", label: "Design a resource-oriented API for a sample domain", isRequired: true },
      { id: "cr_23", label: "Write an OpenAPI specification for your API", isRequired: true },
      { id: "cr_24", label: "Implement pagination and filtering", isRequired: false },
    ],
  },
  {
    id: "bdg_9", name: "Cloud Fundamentals",
    description: "Core cloud computing concepts across AWS, Azure, and GCP. Covers compute, storage, networking, and identity services with hands-on labs.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-02-15T09:00:00Z",
    criteria: [
      { id: "cr_25", label: "Deploy a virtual machine to a cloud provider", isRequired: true },
      { id: "cr_26", label: "Configure object storage with access policies", isRequired: true },
      { id: "cr_27", label: "Set up a basic VPC with public and private subnets", isRequired: true },
      { id: "cr_28", label: "Pass the cloud fundamentals assessment", isRequired: true },
    ],
  },
  {
    id: "bdg_10", name: "Docker Containers",
    description: "Building, running, and orchestrating containerized applications. Covers Dockerfiles, multi-stage builds, Docker Compose, and container security best practices.",
    imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-03-01T09:00:00Z",
    criteria: [
      { id: "cr_29", label: "Write a multi-stage Dockerfile for a web app", isRequired: true },
      { id: "cr_30", label: "Create a Docker Compose setup with multiple services", isRequired: true },
      { id: "cr_31", label: "Scan a container image for vulnerabilities", isRequired: false },
    ],
  },
  // col_3 – Onboarding Basics (org_1)
  {
    id: "bdg_11", name: "Company Culture",
    description: "Understanding organizational values and workplace expectations. New hires learn the company mission, core values, and how to contribute to a positive work environment.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-03-25T14:00:00Z",
    criteria: [
      { id: "cr_32", label: "Complete the company history and mission module", isRequired: true },
      { id: "cr_33", label: "Attend a meet-and-greet with your department", isRequired: true },
    ],
  },
  {
    id: "bdg_12", name: "Systems Access",
    description: "Setting up accounts and accessing key internal systems. Covers email, Slack, project management tools, and IT helpdesk procedures.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-03-25T14:00:00Z",
    criteria: [
      { id: "cr_34", label: "Set up multi-factor authentication on all accounts", isRequired: true },
      { id: "cr_35", label: "Verify access to all required internal tools", isRequired: true },
      { id: "cr_36", label: "Complete the IT security acknowledgement form", isRequired: true },
    ],
  },
  {
    id: "bdg_13", name: "Security Basics",
    description: "Information security fundamentals and best practices. Covers password management, phishing awareness, data classification, and incident reporting.",
    imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-04-01T14:00:00Z",
    criteria: [
      { id: "cr_37", label: "Complete the security awareness training", isRequired: true },
      { id: "cr_38", label: "Pass the phishing simulation exercise", isRequired: true },
      { id: "cr_39", label: "Set up a password manager", isRequired: false },
    ],
  },
  {
    id: "bdg_14", name: "Benefits Orientation",
    description: "Overview of health insurance, 401k, and company benefits. Understand enrollment deadlines, plan options, and how to access employee assistance programs.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&h=128&fit=crop",
    createdByOrgId: "org_1", createdAt: "2024-04-05T14:00:00Z",
    criteria: [
      { id: "cr_40", label: "Review all available benefit plans", isRequired: true },
      { id: "cr_41", label: "Complete benefits enrollment by the deadline", isRequired: true },
    ],
  },
  // col_4 – Leadership Training (org_2)
  {
    id: "bdg_15", name: "Communication Skills",
    description: "Effective professional communication strategies. Master active listening, giving constructive feedback, and adapting communication styles for different audiences.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop",
    createdByOrgId: "org_2", createdAt: "2024-02-15T11:00:00Z",
    criteria: [
      { id: "cr_42", label: "Complete the active listening workshop", isRequired: true },
      { id: "cr_43", label: "Deliver a practice feedback session with a peer", isRequired: true },
      { id: "cr_44", label: "Submit a written communication sample for review", isRequired: false },
    ],
  },
  {
    id: "bdg_16", name: "Strategic Thinking",
    description: "Frameworks for strategic planning and decision-making. Learn SWOT analysis, OKR setting, and how to translate organizational vision into actionable goals.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=128&h=128&fit=crop",
    createdByOrgId: "org_2", createdAt: "2024-03-01T11:00:00Z",
    criteria: [
      { id: "cr_45", label: "Complete a SWOT analysis for a real project", isRequired: true },
      { id: "cr_46", label: "Draft OKRs for your team's next quarter", isRequired: true },
      { id: "cr_47", label: "Present your strategic plan to a review panel", isRequired: true },
    ],
  },
  {
    id: "bdg_17", name: "Team Management",
    description: "Leading and motivating teams for peak performance. Covers delegation, conflict resolution within teams, performance reviews, and building psychological safety.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=128&h=128&fit=crop",
    createdByOrgId: "org_2", createdAt: "2024-03-15T11:00:00Z",
    criteria: [
      { id: "cr_48", label: "Complete the delegation and empowerment module", isRequired: true },
      { id: "cr_49", label: "Conduct a mock performance review", isRequired: true },
      { id: "cr_50", label: "Facilitate a retrospective meeting", isRequired: false },
    ],
  },
  // col_5 – Professional Development (org_2)
  {
    id: "bdg_18", name: "Time Management",
    description: "Prioritization and productivity techniques. Learn the Eisenhower matrix, time-blocking, and strategies for managing competing priorities without burnout.",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=128&h=128&fit=crop",
    createdByOrgId: "org_2", createdAt: "2024-04-10T08:00:00Z",
    criteria: [
      { id: "cr_51", label: "Complete the time management self-assessment", isRequired: true },
      { id: "cr_52", label: "Use time-blocking for one full work week", isRequired: true },
      { id: "cr_53", label: "Submit a reflection on productivity improvements", isRequired: false },
    ],
  },
  {
    id: "bdg_19", name: "Public Speaking",
    description: "Confident presentation and public speaking skills. Practice structuring a talk, managing nerves, engaging an audience, and using visual aids effectively.",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=128&h=128&fit=crop",
    createdByOrgId: "org_2", createdAt: "2024-04-20T08:00:00Z",
    criteria: [
      { id: "cr_54", label: "Deliver a 5-minute presentation to a live audience", isRequired: true },
      { id: "cr_55", label: "Receive and incorporate peer feedback", isRequired: true },
      { id: "cr_56", label: "Record and self-review a practice talk", isRequired: false },
    ],
  },
  {
    id: "bdg_20", name: "Conflict Resolution",
    description: "Navigating workplace conflicts with professionalism. Learn de-escalation techniques, mediation basics, and how to find mutually beneficial resolutions.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop",
    createdByOrgId: "org_2", createdAt: "2024-05-01T08:00:00Z",
    criteria: [
      { id: "cr_57", label: "Complete the conflict styles assessment", isRequired: true },
      { id: "cr_58", label: "Role-play a mediation scenario", isRequired: true },
      { id: "cr_59", label: "Write a reflection on a past conflict and lessons learned", isRequired: false },
    ],
  },
  // col_6 – Digital Literacy (org_3)
  {
    id: "bdg_21", name: "Computer Basics",
    description: "Fundamental computer skills and file management. Covers operating system navigation, file organization, keyboard shortcuts, and basic troubleshooting.",
    imageUrl: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=128&h=128&fit=crop",
    createdByOrgId: "org_3", createdAt: "2024-07-05T10:00:00Z",
    criteria: [
      { id: "cr_60", label: "Navigate the file system and organize files into folders", isRequired: true },
      { id: "cr_61", label: "Demonstrate 10 essential keyboard shortcuts", isRequired: true },
      { id: "cr_62", label: "Troubleshoot a common software issue", isRequired: false },
    ],
  },
  {
    id: "bdg_22", name: "Email Communication",
    description: "Professional email etiquette and management. Learn to compose clear messages, manage your inbox efficiently, and use email features like filters and signatures.",
    imageUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=128&h=128&fit=crop",
    createdByOrgId: "org_3", createdAt: "2024-07-15T10:00:00Z",
    criteria: [
      { id: "cr_63", label: "Compose a professional email with proper formatting", isRequired: true },
      { id: "cr_64", label: "Set up inbox filters and an email signature", isRequired: true },
    ],
  },
  {
    id: "bdg_23", name: "Online Safety",
    description: "Protecting personal information and avoiding scams. Covers recognizing phishing attempts, secure browsing habits, privacy settings, and safe online behavior.",
    imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=128&h=128&fit=crop",
    createdByOrgId: "org_3", createdAt: "2024-07-25T10:00:00Z",
    criteria: [
      { id: "cr_65", label: "Identify phishing emails in a simulated inbox", isRequired: true },
      { id: "cr_66", label: "Configure privacy settings on a social media account", isRequired: true },
      { id: "cr_67", label: "Complete the online safety quiz with 80% or higher", isRequired: true },
    ],
  },
  // col_7 – Compliance Essentials (org_ext_1)
  {
    id: "bdg_24", name: "HIPAA Compliance",
    description: "Healthcare privacy and security regulations. Understand protected health information, patient rights, breach notification requirements, and technical safeguards.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=128&h=128&fit=crop",
    createdByOrgId: "org_ext_1", createdAt: "2024-05-15T09:00:00Z",
    criteria: [
      { id: "cr_68", label: "Complete the HIPAA Privacy Rule training", isRequired: true },
      { id: "cr_69", label: "Complete the HIPAA Security Rule training", isRequired: true },
      { id: "cr_70", label: "Pass the compliance assessment with 85% or higher", isRequired: true },
    ],
  },
  {
    id: "bdg_25", name: "SOX Reporting",
    description: "Sarbanes-Oxley financial reporting requirements. Learn internal controls, audit documentation, and how to maintain compliance with SOX provisions.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=128&h=128&fit=crop",
    createdByOrgId: "org_ext_1", createdAt: "2024-06-01T09:00:00Z",
    criteria: [
      { id: "cr_71", label: "Complete the SOX overview module", isRequired: true },
      { id: "cr_72", label: "Document internal controls for a sample process", isRequired: true },
      { id: "cr_73", label: "Participate in a mock audit review", isRequired: false },
    ],
  },
  {
    id: "bdg_26", name: "GDPR Fundamentals",
    description: "European data protection regulation compliance. Covers data subject rights, lawful processing bases, data protection impact assessments, and cross-border transfers.",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=128&h=128&fit=crop",
    createdByOrgId: "org_ext_1", createdAt: "2024-06-15T09:00:00Z",
    criteria: [
      { id: "cr_74", label: "Identify the six lawful bases for processing personal data", isRequired: true },
      { id: "cr_75", label: "Complete a data protection impact assessment template", isRequired: true },
      { id: "cr_76", label: "Pass the GDPR knowledge check", isRequired: true },
    ],
  },
  // col_8 – Equipment Operations (org_ext_2)
  {
    id: "bdg_27", name: "Forklift Operation",
    description: "Certified forklift operation and safety procedures. Covers pre-operation inspections, load handling, pedestrian safety, and OSHA forklift regulations.",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&h=128&fit=crop",
    createdByOrgId: "org_ext_2", createdAt: "2024-06-20T13:00:00Z",
    criteria: [
      { id: "cr_77", label: "Complete the classroom forklift safety course", isRequired: true },
      { id: "cr_78", label: "Pass the hands-on driving evaluation", isRequired: true },
      { id: "cr_79", label: "Perform a pre-operation inspection checklist", isRequired: true },
    ],
  },
  {
    id: "bdg_28", name: "Crane Safety",
    description: "Overhead crane operation and rigging procedures. Learn load calculation, sling selection, hand signals, and safe crane operation practices.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&h=128&fit=crop",
    createdByOrgId: "org_ext_2", createdAt: "2024-07-01T13:00:00Z",
    criteria: [
      { id: "cr_80", label: "Complete the crane operation theory module", isRequired: true },
      { id: "cr_81", label: "Demonstrate proper hand signals for crane operations", isRequired: true },
      { id: "cr_82", label: "Calculate load weights and select appropriate rigging", isRequired: true },
      { id: "cr_83", label: "Pass the practical crane operation test", isRequired: true },
    ],
  },
  {
    id: "bdg_29", name: "Equipment Inspection",
    description: "Pre-operation inspection protocols and maintenance checks. Learn to identify wear, damage, and safety concerns before operating heavy equipment.",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=128&h=128&fit=crop",
    createdByOrgId: "org_ext_2", createdAt: "2024-07-10T13:00:00Z",
    criteria: [
      { id: "cr_84", label: "Complete the equipment inspection training module", isRequired: true },
      { id: "cr_85", label: "Fill out an inspection checklist for three equipment types", isRequired: true },
      { id: "cr_86", label: "Identify and report a simulated deficiency", isRequired: false },
    ],
  },
];

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

// ---------- Learners ----------

const FAKE_LEARNERS: Learner[] = [
  { id: "lrn_1", name: "Alex Rivera", email: "alex.rivera@example.com", createdAt: "2024-01-15T08:00:00Z" },
  { id: "lrn_2", name: "Jordan Smith", email: "jordan.smith@example.com", createdAt: "2024-01-20T09:00:00Z" },
  { id: "lrn_3", name: "Taylor Johnson", email: "taylor.johnson@example.com", createdAt: "2024-02-05T10:00:00Z" },
  { id: "lrn_4", name: "Morgan Lee", email: "morgan.lee@example.com", createdAt: "2024-02-10T11:00:00Z" },
  { id: "lrn_5", name: "Casey Brown", email: "casey.brown@example.com", createdAt: "2024-02-15T12:00:00Z" },
  { id: "lrn_6", name: "Riley Garcia", email: "riley.garcia@example.com", createdAt: "2024-03-01T08:00:00Z" },
  { id: "lrn_7", name: "Jamie Martinez", email: "jamie.martinez@example.com", createdAt: "2024-03-05T09:00:00Z" },
  { id: "lrn_8", name: "Avery Davis", email: "avery.davis@example.com", createdAt: "2024-03-10T10:00:00Z" },
  { id: "lrn_9", name: "Quinn Rodriguez", email: "quinn.rodriguez@example.com", createdAt: "2024-03-15T11:00:00Z" },
  { id: "lrn_10", name: "Drew Wilson", email: "drew.wilson@example.com", createdAt: "2024-04-01T08:00:00Z" },
  { id: "lrn_11", name: "Dakota Anderson", email: "dakota.anderson@example.com", createdAt: "2024-04-05T09:00:00Z" },
  { id: "lrn_12", name: "Cameron Thomas", email: "cameron.thomas@example.com", createdAt: "2024-04-10T10:00:00Z" },
  { id: "lrn_13", name: "Sage Jackson", email: "sage.jackson@example.com", createdAt: "2024-04-15T11:00:00Z" },
  { id: "lrn_14", name: "River White", email: "river.white@example.com", createdAt: "2024-05-01T08:00:00Z" },
  { id: "lrn_15", name: "Skyler Harris", email: "skyler.harris@example.com", createdAt: "2024-05-05T09:00:00Z" },
  { id: "lrn_16", name: "Phoenix Martin", email: "phoenix.martin@example.com", createdAt: "2024-05-10T10:00:00Z" },
  { id: "lrn_17", name: "Rowan Thompson", email: "rowan.thompson@example.com", createdAt: "2024-05-15T11:00:00Z" },
  { id: "lrn_18", name: "Indigo Moore", email: "indigo.moore@example.com", createdAt: "2024-06-01T08:00:00Z" },
];

// ---------- Cohorts ----------

const FAKE_COHORTS: Cohort[] = [
  // Active cohorts
  {
    id: "coh_1",
    orgId: "org_1",
    name: "Fall 2025 Cohort",
    slug: "fall-2025-cohort",
    description: "Full-time learners starting in Fall 2025 semester.",
    status: "active",
    coverImageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_1", "mem_4"],
    learnerCount: 8,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-05T10:00:00Z",
  },
  {
    id: "coh_2",
    orgId: "org_1",
    name: "Safety Training Cohort",
    slug: "safety-training-cohort",
    description: "Focused on OSHA and workplace safety certifications.",
    status: "active",
    coverImageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_5"],
    learnerCount: 6,
    createdAt: "2025-08-15T09:00:00Z",
    updatedAt: "2025-08-20T11:00:00Z",
  },
  {
    id: "coh_3",
    orgId: "org_1",
    name: "Technical Skills Track",
    slug: "technical-skills-track",
    description: "Learners pursuing technical badges (Git, Docker, Cloud, APIs).",
    status: "active",
    coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_1", "mem_4", "mem_5"],
    learnerCount: 5,
    createdAt: "2025-07-10T10:00:00Z",
    updatedAt: "2025-08-01T12:00:00Z",
  },
  {
    id: "coh_4",
    orgId: "org_1",
    name: "Onboarding - Q4 2025",
    slug: "onboarding-q4-2025",
    description: "New hires onboarding in Q4 2025.",
    status: "active",
    coverImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_4"],
    learnerCount: 4,
    createdAt: "2025-10-01T08:00:00Z",
    updatedAt: "2025-10-05T09:00:00Z",
  },
  // Draft cohorts
  {
    id: "coh_5",
    orgId: "org_1",
    name: "Spring 2026 Cohort",
    slug: "spring-2026-cohort",
    description: "Planned cohort for Spring 2026 semester (draft).",
    status: "draft",
    coverImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop",
    assignedStaffIds: [],
    learnerCount: 0,
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2025-11-02T09:00:00Z",
  },
  {
    id: "coh_6",
    orgId: "org_1",
    name: "Leadership Development Track",
    slug: "leadership-development-track",
    description: "Cohort for mid-level managers pursuing leadership badges (under development).",
    status: "draft",
    coverImageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_1"],
    learnerCount: 0,
    createdAt: "2025-10-15T10:00:00Z",
    updatedAt: "2025-10-20T11:00:00Z",
  },
  // Archived cohorts
  {
    id: "coh_7",
    orgId: "org_1",
    name: "Summer 2025 Cohort",
    slug: "summer-2025-cohort",
    description: "Completed summer 2025 program.",
    status: "archived",
    coverImageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_4", "mem_5"],
    learnerCount: 12,
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-08-31T17:00:00Z",
  },
  // org_2 cohorts
  {
    id: "coh_8",
    orgId: "org_2",
    name: "Professional Dev Track",
    slug: "professional-dev-track",
    description: "Continuous learning for career advancement.",
    status: "active",
    coverImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_2", "mem_7"],
    learnerCount: 15,
    createdAt: "2025-08-01T08:00:00Z",
    updatedAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "coh_9",
    orgId: "org_2",
    name: "Leadership Cohort 2025",
    slug: "leadership-cohort-2025",
    description: "Executive leadership development program.",
    status: "active",
    coverImageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
    assignedStaffIds: ["mem_7"],
    learnerCount: 8,
    createdAt: "2025-09-15T08:00:00Z",
    updatedAt: "2025-10-01T09:00:00Z",
  },
];

// Map cohorts to learners
const FAKE_COHORT_LEARNERS: Record<string, Learner[]> = {
  coh_1: [FAKE_LEARNERS[0], FAKE_LEARNERS[1], FAKE_LEARNERS[2], FAKE_LEARNERS[3], FAKE_LEARNERS[4], FAKE_LEARNERS[5], FAKE_LEARNERS[6], FAKE_LEARNERS[7]],
  coh_2: [FAKE_LEARNERS[8], FAKE_LEARNERS[9], FAKE_LEARNERS[10], FAKE_LEARNERS[11], FAKE_LEARNERS[12], FAKE_LEARNERS[13]],
  coh_3: [FAKE_LEARNERS[14], FAKE_LEARNERS[15], FAKE_LEARNERS[16], FAKE_LEARNERS[17], FAKE_LEARNERS[0]],
  coh_4: [FAKE_LEARNERS[1], FAKE_LEARNERS[3], FAKE_LEARNERS[5], FAKE_LEARNERS[7]],
  coh_5: [],
  coh_6: [],
  coh_7: [FAKE_LEARNERS[2], FAKE_LEARNERS[4], FAKE_LEARNERS[6], FAKE_LEARNERS[8], FAKE_LEARNERS[10], FAKE_LEARNERS[12], FAKE_LEARNERS[14], FAKE_LEARNERS[16], FAKE_LEARNERS[9], FAKE_LEARNERS[11], FAKE_LEARNERS[13], FAKE_LEARNERS[15]],
  coh_8: [FAKE_LEARNERS[0], FAKE_LEARNERS[1], FAKE_LEARNERS[2], FAKE_LEARNERS[3], FAKE_LEARNERS[4], FAKE_LEARNERS[5], FAKE_LEARNERS[6], FAKE_LEARNERS[7], FAKE_LEARNERS[8], FAKE_LEARNERS[9], FAKE_LEARNERS[10], FAKE_LEARNERS[11], FAKE_LEARNERS[12], FAKE_LEARNERS[13], FAKE_LEARNERS[14]],
  coh_9: [FAKE_LEARNERS[15], FAKE_LEARNERS[16], FAKE_LEARNERS[17], FAKE_LEARNERS[0], FAKE_LEARNERS[2], FAKE_LEARNERS[4], FAKE_LEARNERS[6], FAKE_LEARNERS[8]],
};

// ---------- Programs ----------

const FAKE_PROGRAMS: Record<string, Program> = {
  prg_1: {
    id: "prg_1",
    orgId: "org_1",
    name: "Leadership Development Track",
    slug: "leadership-development-track",
    description: "Comprehensive leadership training program spanning foundation to advanced competencies. Perfect for emerging and established leaders.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
    status: "active",
    phaseCount: 3,
    totalBadgeCount: 9,
    totalCheckpointCount: 6,
    createdAt: "2024-09-01T10:00:00Z",
    updatedAt: "2025-01-10T14:30:00Z",
  },
  prg_2: {
    id: "prg_2",
    orgId: "org_1",
    name: "Project Management Certification",
    slug: "project-management-certification",
    description: "Industry-standard project management training aligned with PMI standards.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    status: "active",
    phaseCount: 4,
    totalBadgeCount: 12,
    totalCheckpointCount: 8,
    createdAt: "2024-08-15T09:00:00Z",
    updatedAt: "2024-12-20T16:00:00Z",
  },
  prg_3: {
    id: "prg_3",
    orgId: "org_1",
    name: "Data Analysis Fundamentals",
    slug: "data-analysis-fundamentals",
    description: "Introduction to data analysis techniques and tools.",
    status: "draft",
    phaseCount: 2,
    totalBadgeCount: 5,
    totalCheckpointCount: 3,
    createdAt: "2025-01-05T11:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
  },
  prg_4: {
    id: "prg_4",
    orgId: "org_1",
    name: "Summer 2024 Internship Program",
    slug: "summer-2024-internship",
    description: "Legacy internship program from summer 2024.",
    status: "archived",
    phaseCount: 2,
    totalBadgeCount: 4,
    totalCheckpointCount: 4,
    createdAt: "2024-05-01T08:00:00Z",
    updatedAt: "2024-09-30T17:00:00Z",
  },
  prg_5: {
    id: "prg_5",
    orgId: "org_2",
    name: "Teaching Excellence Program",
    slug: "teaching-excellence-program",
    description: "Professional development for educators.",
    status: "active",
    phaseCount: 3,
    totalBadgeCount: 8,
    totalCheckpointCount: 5,
    createdAt: "2024-10-01T09:00:00Z",
    updatedAt: "2025-01-15T12:00:00Z",
  },
};

const FAKE_PROGRAM_PHASES: Record<string, Phase[]> = {
  prg_1: [
    {
      id: "phs_1",
      name: "Foundation Leadership Skills",
      description: "Core competencies every leader needs.",
      order: 0,
      badgeIds: ["bdg_1", "bdg_2", "bdg_3"],
      checkpoints: [
        { id: "chk_1", label: "Complete personal leadership assessment", isRequired: true },
        { id: "chk_2", label: "Submit leadership development plan", isRequired: true },
      ],
    },
    {
      id: "phs_2",
      name: "Team Leadership",
      description: "Leading and developing high-performing teams.",
      order: 1,
      badgeIds: ["bdg_4", "bdg_5", "bdg_6"],
      checkpoints: [
        { id: "chk_3", label: "Complete team project simulation", isRequired: true },
        { id: "chk_4", label: "Conduct peer feedback session", isRequired: true },
      ],
    },
    {
      id: "phs_3",
      name: "Strategic Leadership",
      description: "Advanced strategic thinking and organizational leadership.",
      order: 2,
      badgeIds: ["bdg_7", "bdg_8", "bdg_9"],
      checkpoints: [
        { id: "chk_5", label: "Present strategic vision to panel", isRequired: true },
        { id: "chk_6", label: "Complete capstone project", isRequired: true },
      ],
    },
  ],
  prg_2: [
    {
      id: "phs_4",
      name: "PM Fundamentals",
      description: "Core project management principles.",
      order: 0,
      badgeIds: ["bdg_10", "bdg_11", "bdg_12"],
      checkpoints: [
        { id: "chk_7", label: "Pass PM fundamentals exam", isRequired: true },
      ],
    },
    {
      id: "phs_5",
      name: "Planning & Execution",
      description: "Project planning, scheduling, and execution techniques.",
      order: 1,
      badgeIds: ["bdg_13", "bdg_14", "bdg_15"],
      checkpoints: [
        { id: "chk_8", label: "Create project charter", isRequired: true },
        { id: "chk_9", label: "Develop project schedule", isRequired: true },
      ],
    },
    {
      id: "phs_6",
      name: "Risk & Quality Management",
      description: "Managing project risks and ensuring quality.",
      order: 2,
      badgeIds: ["bdg_16", "bdg_17", "bdg_18"],
      checkpoints: [
        { id: "chk_10", label: "Complete risk assessment", isRequired: true },
        { id: "chk_11", label: "Implement quality control plan", isRequired: true },
      ],
    },
    {
      id: "phs_7",
      name: "Leadership & Communication",
      description: "Stakeholder management and team communication.",
      order: 3,
      badgeIds: ["bdg_19", "bdg_20", "bdg_21"],
      checkpoints: [
        { id: "chk_12", label: "Facilitate stakeholder meeting", isRequired: true },
        { id: "chk_13", label: "Deliver final project presentation", isRequired: true },
      ],
    },
  ],
  prg_3: [
    {
      id: "phs_8",
      name: "Data Basics",
      description: "Introduction to data analysis.",
      order: 0,
      badgeIds: ["bdg_22", "bdg_23"],
      checkpoints: [
        { id: "chk_14", label: "Complete data literacy quiz", isRequired: true },
      ],
    },
    {
      id: "phs_9",
      name: "Analysis Tools",
      description: "Working with data analysis tools.",
      order: 1,
      badgeIds: ["bdg_24", "bdg_25", "bdg_26"],
      checkpoints: [
        { id: "chk_15", label: "Submit data analysis project", isRequired: true },
        { id: "chk_16", label: "Present findings to team", isRequired: false },
      ],
    },
  ],
  prg_4: [
    {
      id: "phs_10",
      name: "Onboarding",
      description: "Intern orientation and setup.",
      order: 0,
      badgeIds: ["bdg_27"],
      checkpoints: [
        { id: "chk_17", label: "Complete orientation", isRequired: true },
        { id: "chk_18", label: "Meet with mentor", isRequired: true },
      ],
    },
    {
      id: "phs_11",
      name: "Project Work",
      description: "Summer internship project completion.",
      order: 1,
      badgeIds: ["bdg_28", "bdg_29"],
      checkpoints: [
        { id: "chk_19", label: "Mid-summer check-in", isRequired: true },
        { id: "chk_20", label: "Final presentation", isRequired: true },
      ],
    },
  ],
  prg_5: [
    {
      id: "phs_12",
      name: "Teaching Foundations",
      description: "Core teaching methodologies.",
      order: 0,
      badgeIds: ["bdg_1", "bdg_2"],
      checkpoints: [
        { id: "chk_21", label: "Observe master teacher session", isRequired: true },
      ],
    },
    {
      id: "phs_13",
      name: "Classroom Management",
      description: "Managing diverse classrooms effectively.",
      order: 1,
      badgeIds: ["bdg_3", "bdg_4", "bdg_5"],
      checkpoints: [
        { id: "chk_22", label: "Implement classroom management plan", isRequired: true },
        { id: "chk_23", label: "Peer observation feedback", isRequired: true },
      ],
    },
    {
      id: "phs_14",
      name: "Assessment & Growth",
      description: "Student assessment and professional development.",
      order: 2,
      badgeIds: ["bdg_6", "bdg_7", "bdg_8"],
      checkpoints: [
        { id: "chk_24", label: "Create assessment rubric", isRequired: true },
        { id: "chk_25", label: "Complete professional development plan", isRequired: true },
      ],
    },
  ],
};

const FAKE_COHORT_PROGRAM_ASSIGNMENTS: Record<string, CohortProgramAssignment[]> = {
  coh_1: [
    {
      id: "asn_coh_1",
      cohortId: "coh_1",
      programId: "prg_1",
      assignedBy: "usr_1",
      assignedAt: "2025-01-15T10:00:00Z",
      phaseDueDates: [
        { phaseId: "phs_1", dueDate: "2025-03-01T23:59:59Z" },
        { phaseId: "phs_2", dueDate: "2025-05-01T23:59:59Z" },
        { phaseId: "phs_3", dueDate: "2025-07-01T23:59:59Z" },
      ],
    },
  ],
  coh_7: [
    {
      id: "asn_coh_2",
      cohortId: "coh_7",
      programId: "prg_2",
      assignedBy: "usr_1",
      assignedAt: "2024-12-01T09:00:00Z",
      phaseDueDates: [
        { phaseId: "phs_4", dueDate: "2025-02-15T23:59:59Z" },
        { phaseId: "phs_5", dueDate: "2025-04-15T23:59:59Z" },
        { phaseId: "phs_6", dueDate: "2025-06-15T23:59:59Z" },
        { phaseId: "phs_7", dueDate: "2025-08-15T23:59:59Z" },
      ],
    },
  ],
};

const FAKE_LEARNER_PROGRAM_ASSIGNMENTS: Record<string, LearnerProgramAssignment[]> = {
  lrn_1: [
    {
      id: "asn_lrn_1",
      learnerId: "lrn_1",
      programId: "prg_1",
      cohortAssignmentId: "asn_coh_1",
      assignedBy: "usr_1",
      assignedAt: "2025-01-15T10:00:00Z",
      phaseDueDates: [
        { phaseId: "phs_1", dueDate: "2025-03-01T23:59:59Z" },
        { phaseId: "phs_2", dueDate: "2025-05-01T23:59:59Z" },
        { phaseId: "phs_3", dueDate: "2025-07-01T23:59:59Z" },
      ],
    },
  ],
  lrn_2: [
    {
      id: "asn_lrn_2",
      learnerId: "lrn_2",
      programId: "prg_1",
      cohortAssignmentId: "asn_coh_1",
      assignedBy: "usr_1",
      assignedAt: "2025-01-15T10:00:00Z",
      phaseDueDates: [
        { phaseId: "phs_1", dueDate: "2025-03-01T23:59:59Z" },
        { phaseId: "phs_2", dueDate: "2025-05-01T23:59:59Z" },
        { phaseId: "phs_3", dueDate: "2025-07-01T23:59:59Z" },
      ],
    },
  ],
  lrn_3: [
    {
      id: "asn_lrn_3",
      learnerId: "lrn_3",
      programId: "prg_2",
      assignedBy: "usr_1",
      assignedAt: "2025-02-01T14:00:00Z",
      phaseDueDates: [
        { phaseId: "phs_4", dueDate: "2025-03-15T23:59:59Z" },
        { phaseId: "phs_5", dueDate: "2025-05-15T23:59:59Z" },
        { phaseId: "phs_6", dueDate: "2025-07-15T23:59:59Z" },
        { phaseId: "phs_7", dueDate: "2025-09-15T23:59:59Z" },
      ],
    },
  ],
};

const FAKE_CHECKPOINT_COMPLETIONS: Record<string, CheckpointCompletion[]> = {
  asn_lrn_1: [
    {
      id: "chk_cmp_1",
      assignmentId: "asn_lrn_1",
      checkpointId: "chk_1",
      signedBy: "usr_1",
      signedAt: "2025-02-10T15:30:00Z",
      notes: "Excellent self-assessment. Shows strong self-awareness.",
    },
    {
      id: "chk_cmp_2",
      assignmentId: "asn_lrn_1",
      checkpointId: "chk_2",
      signedBy: "usr_1",
      signedAt: "2025-02-25T11:00:00Z",
      notes: "Clear and actionable development plan submitted.",
    },
  ],
  asn_lrn_2: [
    {
      id: "chk_cmp_3",
      assignmentId: "asn_lrn_2",
      checkpointId: "chk_1",
      signedBy: "usr_1",
      signedAt: "2025-02-12T09:15:00Z",
    },
  ],
  asn_lrn_3: [
    {
      id: "chk_cmp_4",
      assignmentId: "asn_lrn_3",
      checkpointId: "chk_7",
      signedBy: "usr_1",
      signedAt: "2025-02-08T16:45:00Z",
      notes: "Passed exam with 92%. Strong grasp of fundamentals.",
    },
  ],
};

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

  http.get("*/orgs/:orgId/learners/:learnerId/program-assignments", ({ params }) => {
    const learnerId = params.learnerId as string;
    const assignments = FAKE_LEARNER_PROGRAM_ASSIGNMENTS[learnerId] ?? [];

    const learner = FAKE_LEARNERS.find((l) => l.id === learnerId);
    const details: LearnerProgramAssignmentDetail[] = assignments.map((asn) => {
      const program = FAKE_PROGRAMS[asn.programId];
      const completions = FAKE_CHECKPOINT_COMPLETIONS[asn.id] ?? [];

      // Calculate progress
      const phases = FAKE_PROGRAM_PHASES[program.id] ?? [];
      const totalCheckpoints = phases.reduce((sum, phase) => sum + phase.checkpoints.length, 0);
      const totalBadges = phases.reduce((sum, phase) => sum + phase.badgeIds.length, 0);

      const progress: ProgramProgress = {
        badgesEarned: 0, // Would be calculated from actual badge issuances
        badgesTotal: totalBadges,
        checkpointsSigned: completions.length,
        checkpointsTotal: totalCheckpoints,
        phaseProgress: phases.map((phase) => {
          const phaseCheckpoints = completions.filter((c) =>
            phase.checkpoints.some((chk) => chk.id === c.checkpointId)
          );
          return {
            phaseId: phase.id,
            badgesEarned: 0,
            badgesTotal: phase.badgeIds.length,
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

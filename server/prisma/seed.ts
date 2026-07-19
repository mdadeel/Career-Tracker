import { PrismaClient, ApplicationStatus, ApplicationSource } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Realistic seed data ──────────────────────────────────────────────

const companies = [
  { name: "Stripe", logo: "https://logo.clearbit.com/stripe.com" },
  { name: "Vercel", logo: "https://logo.clearbit.com/vercel.com" },
  { name: "Linear", logo: "https://logo.clearbit.com/linear.app" },
  { name: "Notion", logo: "https://logo.clearbit.com/notion.so" },
  { name: "Figma", logo: "https://logo.clearbit.com/figma.com" },
  { name: "Raycast", logo: "https://logo.clearbit.com/raycast.com" },
  { name: "Supabase", logo: "https://logo.clearbit.com/supabase.com" },
  { name: "Railway", logo: "https://logo.clearbit.com/railway.app" },
  { name: "Cal.com", logo: "https://logo.clearbit.com/cal.com" },
  { name: "Airbnb", logo: "https://logo.clearbit.com/airbnb.com" },
  { name: "Spotify", logo: "https://logo.clearbit.com/spotify.com" },
  { name: "Discord", logo: "https://logo.clearbit.com/discord.com" },
  { name: "GitHub", logo: "https://logo.clearbit.com/github.com" },
  { name: "Datadog", logo: "https://logo.clearbit.com/datadoghq.com" },
  { name: "HashiCorp", logo: "https://logo.clearbit.com/hashicorp.com" },
  { name: "Cloudflare", logo: "https://logo.clearbit.com/cloudflare.com" },
  { name: "Backstage (Spotify)", logo: "https://logo.clearbit.com/spotify.com" },
  { name: "PostHog", logo: "https://logo.clearbit.com/posthog.com" },
  { name: "Fly.io", logo: "https://logo.clearbit.com/fly.io" },
  { name: "Netlify", logo: "https://logo.clearbit.com/netlify.com" },
  { name: "Render", logo: "https://logo.clearbit.com/render.com" },
  { name: "Loom", logo: "https://logo.clearbit.com/loom.com" },
  { name: "WorkOS", logo: "https://logo.clearbit.com/workos.com" },
  { name: "Resend", logo: "https://logo.clearbit.com/resend.com" },
];

const roles: Array<{
  title: string;
  type: string;
  remote: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
}> = [
  { title: "Senior Frontend Engineer", type: "Full-time", remote: "Remote", salaryMin: 150000, salaryMax: 200000, currency: "USD", location: "Remote — Americas" },
  { title: "Staff Software Engineer", type: "Full-time", remote: "Remote", salaryMin: 180000, salaryMax: 250000, currency: "USD", location: "Remote — Global" },
  { title: "Product Engineer", type: "Full-time", remote: "Hybrid", salaryMin: 140000, salaryMax: 190000, currency: "USD", location: "San Francisco, CA" },
  { title: "Frontend Engineer — Design Systems", type: "Full-time", remote: "Remote", salaryMin: 130000, salaryMax: 180000, currency: "USD", location: "Remote — US" },
  { title: "Full-Stack Engineer", type: "Full-time", remote: "Hybrid", salaryMin: 145000, salaryMax: 195000, currency: "USD", location: "New York, NY" },
  { title: "Software Engineer — Platform", type: "Full-time", remote: "Remote", salaryMin: 155000, salaryMax: 210000, currency: "USD", location: "Remote — EMEA" },
  { title: "React Engineer", type: "Contract", remote: "Remote", salaryMin: 120000, salaryMax: 160000, currency: "USD", location: "Remote — Global" },
  { title: "Senior UI Engineer", type: "Full-time", remote: "On-site", salaryMin: 150000, salaryMax: 200000, currency: "USD", location: "Seattle, WA" },
  { title: "Engineering Manager", type: "Full-time", remote: "Hybrid", salaryMin: 200000, salaryMax: 280000, currency: "USD", location: "San Francisco, CA" },
  { title: "Software Engineer — Growth", type: "Full-time", remote: "Remote", salaryMin: 135000, salaryMax: 185000, currency: "USD", location: "Remote — Americas" },
  { title: "Infrastructure Engineer", type: "Full-time", remote: "Remote", salaryMin: 160000, salaryMax: 220000, currency: "USD", location: "Remote — Global" },
  { title: "Developer Advocate", type: "Full-time", remote: "Remote", salaryMin: 120000, salaryMax: 160000, currency: "USD", location: "Remote — Global" },
  { title: "Data Engineer", type: "Full-time", remote: "Hybrid", salaryMin: 140000, salaryMax: 190000, currency: "USD", location: "Austin, TX" },
  { title: "Mobile Engineer — React Native", type: "Full-time", remote: "Remote", salaryMin: 130000, salaryMax: 175000, currency: "USD", location: "Remote — Americas" },
  { title: "Software Engineer Intern", type: "Internship", remote: "Hybrid", salaryMin: 40000, salaryMax: 55000, currency: "USD", location: "New York, NY" },
  { title: "Product Designer (Engineering Focus)", type: "Full-time", remote: "Hybrid", salaryMin: 130000, salaryMax: 170000, currency: "USD", location: "San Francisco, CA" },
  { title: "Principal Engineer", type: "Full-time", remote: "Remote", salaryMin: 220000, salaryMax: 320000, currency: "USD", location: "Remote — Global" },
  { title: "Site Reliability Engineer", type: "Full-time", remote: "Remote", salaryMin: 160000, salaryMax: 210000, currency: "USD", location: "Remote — US" },
  { title: "Backend Engineer — Go", type: "Full-time", remote: "Remote", salaryMin: 150000, salaryMax: 200000, currency: "USD", location: "Remote — EMEA" },
  { title: "Senior DevOps Engineer", type: "Full-time", remote: "Hybrid", salaryMin: 155000, salaryMax: 210000, currency: "USD", location: "London, UK" },
  { title: "Technical Writer", type: "Contract", remote: "Remote", salaryMin: 90000, salaryMax: 130000, currency: "USD", location: "Remote — Global" },
  { title: "Machine Learning Engineer", type: "Full-time", remote: "On-site", salaryMin: 160000, salaryMax: 220000, currency: "USD", location: "Palo Alto, CA" },
  { title: "Solutions Engineer", type: "Full-time", remote: "Hybrid", salaryMin: 125000, salaryMax: 170000, currency: "USD", location: "Chicago, IL" },
  { title: "Security Engineer", type: "Full-time", remote: "Remote", salaryMin: 155000, salaryMax: 210000, currency: "USD", location: "Remote — US" },
];

// 24 applications with realistic timelines, statuses, and outcomes
const applications: Array<{
  companyIdx: number;
  roleIdx: number;
  status: ApplicationStatus;
  source: ApplicationSource;
  daysSinceApply: number;
  daysSinceCreated: number;
  interviewDateDays?: number; // relative to today
  notes?: string;
  jobDescription?: string;
}> = [
  // ── Offer (2) ──
  {
    companyIdx: 1,  // Vercel
    roleIdx: 0,     // Senior Frontend Engineer
    status: "Offer",
    source: "LinkedIn",
    daysSinceApply: 75,
    daysSinceCreated: 80,
    interviewDateDays: 45,
    notes: "Received verbal offer after 4 rounds. Final interview with Guillermo went great. Negotiating equity.",
    jobDescription: "Build and maintain Vercel's frontend platform. Work on Next.js integrations, SDKs, and developer tooling. 6+ years React experience required.",
  },
  {
    companyIdx: 3,  // Notion
    roleIdx: 1,     // Staff Software Engineer
    status: "Offer",
    source: "Referral",
    daysSinceApply: 90,
    daysSinceCreated: 95,
    interviewDateDays: 50,
    notes: "Referred by Alex from previous team. 5 rounds including systems design. Offer received — $240K base + equity.",
    jobDescription: "Design and build the next generation of Notion's block editor. Lead cross-team initiatives for performance and reliability.",
  },

  // ── Interview (4) ──
  {
    companyIdx: 0,  // Stripe
    roleIdx: 2,     // Product Engineer
    status: "Interview",
    source: "LinkedIn",
    daysSinceApply: 30,
    daysSinceCreated: 35,
    interviewDateDays: -5, // 5 days from now
    notes: "Phone screen cleared. On-site scheduled for next week. Preparing systems design.",
    jobDescription: "Build products that make internet commerce accessible. Full-stack role with focus on checkout and payments UX.",
  },
  {
    companyIdx: 4,  // Figma
    roleIdx: 3,     // Frontend Engineer — Design Systems
    status: "Interview",
    source: "LinkedIn",
    daysSinceApply: 20,
    daysSinceCreated: 25,
    interviewDateDays: -10,
    notes: "First round with hiring manager done. Technical screen code pair on Friday.",
    jobDescription: "Own Figma's component library and design infrastructure. Bridge design and engineering to ship consistent UI at scale.",
  },
  {
    companyIdx: 6,  // Supabase
    roleIdx: 5,     // Software Engineer — Platform
    status: "Interview",
    source: "Wellfound",
    daysSinceApply: 14,
    daysSinceCreated: 18,
    interviewDateDays: -3,
    notes: "Take-home project submitted. Awaiting feedback from the platform team.",
    jobDescription: "Build the core database infra layer. Work on replication, branching, and edge functions. Strong Postgres + Go background needed.",
  },
  {
    companyIdx: 8,  // Cal.com
    roleIdx: 12,    // Data Engineer
    status: "Interview",
    source: "LinkedIn",
    daysSinceApply: 10,
    daysSinceCreated: 12,
    interviewDateDays: -7,
    notes: "Phone interview with Head of Data this Wednesday.",
    jobDescription: "Build and maintain data pipelines. Work with dbt, BigQuery, and Airflow to power product analytics and business intelligence.",
  },

  // ── Assessment (3) ──
  {
    companyIdx: 5,  // Raycast
    roleIdx: 6,     // React Engineer
    status: "Assessment",
    source: "Wellfound",
    daysSinceApply: 18,
    daysSinceCreated: 22,
    notes: "Take-home project: build a Raycast extension. Due in 4 days.",
    jobDescription: "Develop and maintain Raycast's extension API. Build React-based UI components for the store. 3+ years TypeScript experience.",
  },
  {
    companyIdx: 9,  // Airbnb
    roleIdx: 7,     // Senior UI Engineer
    status: "Assessment",
    source: "LinkedIn",
    daysSinceApply: 12,
    daysSinceCreated: 15,
    notes: "Codility assessment received. 90-minute algorithmic challenge.",
    jobDescription: "Lead UI architecture for Airbnb's search and listing experience. Performance obsessed — Core Web Vitals, SSR, streaming.",
  },
  {
    companyIdx: 13, // Datadog
    roleIdx: 13,    // Mobile Engineer — React Native
    status: "Assessment",
    source: "LinkedIn",
    daysSinceApply: 8,
    daysSinceCreated: 10,
    notes: "Second take-home: build a small dashboard with React Native and recharts.",
    jobDescription: "Build Datadog's mobile monitoring SDK and companion apps. React Native + native module experience required.",
  },

  // ── Applied (5) ──
  {
    companyIdx: 7,  // Railway
    roleIdx: 8,     // Engineering Manager
    status: "Applied",
    source: "LinkedIn",
    daysSinceApply: 4,
    daysSinceCreated: 5,
    jobDescription: "Lead the platform engineering team at Railway. 8+ years experience with 3+ in management. Define technical roadmap and grow the team.",
  },
  {
    companyIdx: 12, // GitHub
    roleIdx: 9,     // Software Engineer — Growth
    status: "Applied",
    source: "LinkedIn",
    daysSinceApply: 6,
    daysSinceCreated: 7,
    jobDescription: "Drive user growth and activation at GitHub. Experiment-driven role focused on acquisition loops and onboarding optimization.",
  },
  {
    companyIdx: 15, // Cloudflare
    roleIdx: 10,    // Infrastructure Engineer
    status: "Applied",
    source: "LinkedIn",
    daysSinceApply: 2,
    daysSinceCreated: 3,
    jobDescription: "Design and maintain Cloudflare's global edge network. Work on DDoS mitigation, load balancing, and zero-trust infrastructure.",
  },
  {
    companyIdx: 16, // Backstage
    roleIdx: 11,    // Developer Advocate
    status: "Applied",
    source: "Wellfound",
    daysSinceApply: 1,
    daysSinceCreated: 2,
    jobDescription: "Be the voice of Backstage (Spotify). Create content, speak at conferences, build demos, and grow the open-source community.",
  },
  {
    companyIdx: 19, // Netlify
    roleIdx: 4,     // Full-Stack Engineer
    status: "Applied",
    source: "LinkedIn",
    daysSinceApply: 3,
    daysSinceCreated: 4,
    jobDescription: "Build the Netlify platform experience. Work on the dashboard, CLI, and composable architecture. React + Go stack.",
  },

  // ── Saved (3) ──
  {
    companyIdx: 17, // PostHog
    roleIdx: 17,    // Site Reliability Engineer
    status: "Saved",
    source: "LinkedIn",
    daysSinceApply: 0,
    daysSinceCreated: 1,
    jobDescription: "Keep PostHog's cloud infrastructure running smoothly. Work on Kubernetes, ClickHouse, and observability at scale.",
  },
  {
    companyIdx: 18, // Fly.io
    roleIdx: 18,    // Backend Engineer — Go
    status: "Saved",
    source: "LinkedIn",
    daysSinceApply: 0,
    daysSinceCreated: 0,
    jobDescription: "Build the Fly.io platform. Work on Firecracker micro-VMs, distributed networking, and developer experience. Go + Rust experience valued.",
  },
  {
    companyIdx: 22, // Resend
    roleIdx: 21,    // Machine Learning Engineer
    status: "Saved",
    source: "LinkedIn",
    daysSinceApply: 0,
    daysSinceCreated: 0,
    jobDescription: "Build ML-powered email infrastructure at Resend. Work on delivery optimization, spam detection, and intelligent routing.",
  },

  // ── Older applications for historical trends (7) ──
  // These fill in the past 4-6 months so charts have depth
  {
    companyIdx: 10, // Spotify
    roleIdx: 14,    // Software Engineer Intern
    status: "Rejected",
    source: "LinkedIn",
    daysSinceApply: 160,
    daysSinceCreated: 165,
    notes: "Rejected after phone screen. Got to the coding round but bombed the DFS problem. Practice more graphs.",
    jobDescription: "Join Spotify's backend infrastructure team. Work on microservices, data pipelines, and the recommendation platform.",
  },
  {
    companyIdx: 11, // Discord
    roleIdx: 15,    // Product Designer (Engineering Focus)
    status: "Rejected",
    source: "LinkedIn",
    daysSinceApply: 140,
    daysSinceCreated: 143,
    notes: "Rejected after portfolio review. Need better case studies with measurable impact.",
    jobDescription: "Design tools and workflows for Discord's developer platform. Bridge design and engineering to ship polished developer experiences.",
  },
  {
    companyIdx: 14, // HashiCorp
    roleIdx: 16,    // Principal Engineer
    status: "Rejected",
    source: "LinkedIn",
    daysSinceApply: 200,
    daysSinceCreated: 205,
    notes: "Ghosted after final round. Followed up twice with no response. Not a great look.",
    jobDescription: "Define technical strategy for HashiCorp's cloud products. Drive architecture decisions across Terraform, Vault, and Consul.",
  },
  {
    companyIdx: 2,  // Linear
    roleIdx: 19,    // Senior DevOps Engineer
    status: "Rejected",
    source: "LinkedIn",
    daysSinceApply: 120,
    daysSinceCreated: 123,
    notes: "Rejected after technical screen. The infrastructure questions were tougher than expected.",
    jobDescription: "Own Linear's infrastructure and deployment pipeline. Ensure 99.99% uptime and sub-second response times for the issue tracker.",
  },
  {
    companyIdx: 20, // Render
    roleIdx: 20,    // Technical Writer
    status: "Applied",
    source: "LinkedIn",
    daysSinceApply: 90,
    daysSinceCreated: 92,
    notes: "Applied months ago, no response. Should follow up.",
    jobDescription: "Create documentation for Render's cloud platform. Write guides, tutorials, and API references for developers deploying apps.",
  },
  {
    companyIdx: 21, // Loom
    roleIdx: 22,    // Solutions Engineer
    status: "Interview",
    source: "Referral",
    daysSinceApply: 60,
    daysSinceCreated: 63,
    interviewDateDays: 35,
    notes: "2 rounds completed. Panel interview coming up. Referred by a former colleague.",
    jobDescription: "Help enterprise customers succeed with Loom. Technical demos, integrations, and post-sale engineering support.",
  },
  {
    companyIdx: 23, // WorkOS
    roleIdx: 23,    // Security Engineer
    status: "Interview",
    source: "LinkedIn",
    daysSinceApply: 45,
    daysSinceCreated: 48,
    interviewDateDays: 20,
    notes: "First round with CISO went well. Technical deep-dive scheduled.",
    jobDescription: "Build and maintain WorkOS's security infrastructure. SOC 2, penetration testing, and security review processes.",
  },
];

// ── Main seed function ────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Create demo user ─────
  const passwordHash = await bcrypt.hash("demo@123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@careertrack.app" },
    update: {},
    create: {
      name: "Alex Morgan",
      email: "demo@careertrack.app",
      passwordHash,
    },
  });
  console.log(`👤 User: ${user.name} <${user.email}> (id: ${user.id})`);

  // ── Delete existing seed data ─────
  // (Only delete applications belonging to this user, so we don't trample
  //  real data if the seed user already has some manually created entries)
  const deleted = await prisma.application.deleteMany({
    where: { userId: user.id },
  });
  if (deleted.count > 0) {
    console.log(`🗑️  Cleared ${deleted.count} existing applications for demo user`);
  }

  // ── Insert applications ─────
  let inserted = 0;

  for (const app of applications) {
    const company = companies[app.companyIdx];
    const role = roles[app.roleIdx];

    const createdAt = daysAgo(app.daysSinceCreated);
    const appliedDate = daysAgo(app.daysSinceApply);
    const interviewDate =
      app.interviewDateDays !== undefined
        ? daysAgo(app.interviewDateDays) // negative = future, positive = past
        : null;

    const notesLines: string[] = [];
    if (app.notes) notesLines.push(app.notes);

    // Simulate realistic interview scheduling notes for interview-stage apps
    if (app.status === "Interview" && interviewDate) {
      if (interviewDate > new Date()) {
        notesLines.push(`📅 Interview scheduled: ${interviewDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`);
      } else {
        notesLines.push(`📅 Interview completed: ${interviewDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`);
      }
    }

    await prisma.application.create({
      data: {
        companyName: company.name,
        jobTitle: role.title,
        companyLogo: company.logo,
        source: app.source as ApplicationSource,
        applicationDate: appliedDate,
        status: app.status as ApplicationStatus,
        notes: notesLines.join("\n\n") || null,
        jobDescription: app.jobDescription || null,
        interviewDate: interviewDate,
        salaryMin: role.salaryMin,
        salaryMax: role.salaryMax,
        salaryCurrency: role.currency,
        location: role.location,
        employmentType: role.type,
        remoteStatus: role.remote,
        createdAt,
        updatedAt: createdAt,
        userId: user.id,
      },
    });

    inserted++;
  }

  console.log(`📝 Inserted ${inserted} applications`);

  // ── Summary ─────
  const counts = await prisma.application.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: true,
  });

  console.log("\n📊 Status breakdown:");
  for (const row of counts) {
    console.log(`   ${row.status.padEnd(12)} ${row._count}`);
  }

  const oldest = await prisma.application.findFirst({
    where: { userId: user.id },
    orderBy: { applicationDate: "asc" },
    select: { applicationDate: true },
  });
  const newest = await prisma.application.findFirst({
    where: { userId: user.id },
    orderBy: { applicationDate: "desc" },
    select: { applicationDate: true },
  });

  if (oldest && newest) {
    console.log(`\n📅 Date range: ${oldest.applicationDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} → ${newest.applicationDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`);
  }

  console.log("\n✅ Seed complete!");
  console.log("   Login with: demo@careertrack.app / demo@123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();
  console.log("  Cleaned existing data");

  // ─── Create demo user ───
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@example.com",
      passwordHash,
    },
  });
  console.log(`  Created user: ${user.email} (password: password123)`);

  // ─── Application statuses with varied dates ───
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };
  const daysLater = (base: Date, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  const applications = [
    {
      companyName: "Stripe",
      jobTitle: "Senior Frontend Engineer",
      jobUrl: "https://stripe.com/jobs/senior-frontend",
      source: "LinkedIn" as const,
      status: "Offer" as const,
      applicationDate: daysAgo(45),
      interviewDate: daysLater(daysAgo(45), 14),
      notes: "Went through 4 rounds. Strong system design round. Received offer for $180k + equity.",
      jobDescription: "Stripe is looking for a Senior Frontend Engineer to join our Connect team. You will build and maintain the user interface for Stripe's platform products, working closely with designers and backend engineers to create seamless payment experiences.",
      resumeLink: "https://drive.google.com/file/d/example1",
    },
    {
      companyName: "Vercel",
      jobTitle: "Software Engineer, Developer Experience",
      jobUrl: "https://vercel.com/careers/software-engineer-dx",
      source: "LinkedIn" as const,
      status: "Interview" as const,
      applicationDate: daysAgo(20),
      interviewDate: daysLater(now, 3),
      notes: "First round screening completed. Next: technical interview with the DX team.",
      jobDescription: "Vercel is seeking a Software Engineer to improve the developer experience of our platform. You'll work on Next.js, the Vercel CLI, and our deployment infrastructure to make shipping fast and delightful.",
      resumeLink: "https://drive.google.com/file/d/example2",
    },
    {
      companyName: "Linear",
      jobTitle: "Full-Stack Engineer",
      jobUrl: "https://linear.app/careers/full-stack-engineer",
      source: "Wellfound" as const,
      status: "Interview" as const,
      applicationDate: daysAgo(30),
      interviewDate: daysLater(now, 7),
      notes: "Take-home project submitted. Building a mini issue tracker. Heard back positively.",
      jobDescription: "Linear is hiring a Full-Stack Engineer to help us build the best issue tracking tool for software teams. You'll work across our React frontend and Rust backend, focusing on performance and reliability.",
      resumeLink: "",
    },
    {
      companyName: "Anthropic",
      jobTitle: "Applied AI Engineer",
      jobUrl: "https://anthropic.com/careers/applied-ai-engineer",
      source: "LinkedIn" as const,
      status: "Assessment" as const,
      applicationDate: daysAgo(10),
      notes: "Received a take-home coding assessment. Focus on RAG systems and prompt engineering.",
      jobDescription: "Anthropic is looking for an Applied AI Engineer to build production systems powered by Claude. You'll design APIs, build evaluation pipelines, and work with researchers to deploy cutting-edge AI capabilities.",
      resumeLink: "https://drive.google.com/file/d/example3",
    },
    {
      companyName: "Railway",
      jobTitle: "Platform Engineer",
      jobUrl: "https://railway.app/careers/platform-engineer",
      source: "Wellfound" as const,
      status: "Applied" as const,
      applicationDate: daysAgo(5),
      notes: "Applied via Wellfound. Company seems to have great engineering culture.",
      jobDescription: "Railway is hiring a Platform Engineer to help us build the next generation of cloud infrastructure. You'll work on our deployment platform, container orchestration, and developer tooling.",
      resumeLink: "",
    },
    {
      companyName: "Notion",
      jobTitle: "Senior Software Engineer, AI Features",
      jobUrl: "https://notion.com/careers/senior-software-engineer-ai",
      source: "LinkedIn" as const,
      status: "Applied" as const,
      applicationDate: daysAgo(2),
      notes: "Excited about this role. Notion's AI features are impressive and I use them daily.",
      jobDescription: "Notion is seeking a Senior Software Engineer to join our AI team. You'll build and ship AI-powered features that help millions of users write, organize, and collaborate more effectively.",
      resumeLink: "https://drive.google.com/file/d/example4",
    },
    {
      companyName: "Supabase",
      jobTitle: "Frontend Engineer, Dashboard",
      jobUrl: "https://supabase.com/careers/frontend-engineer",
      source: "Bdjobs" as const,
      status: "Saved" as const,
      applicationDate: daysAgo(1),
      notes: "Found through a referral. Need to prepare cover letter.",
      jobDescription: "Supabase is looking for a Frontend Engineer to build and maintain our dashboard UI. You'll work with React, TypeScript, and our design system to create intuitive interfaces for database management.",
      resumeLink: "",
    },
    {
      companyName: "Webflow",
      jobTitle: "Software Engineer, CMS Platform",
      jobUrl: "https://webflow.com/jobs/software-engineer-cms",
      source: "LinkedIn" as const,
      status: "Rejected" as const,
      applicationDate: daysAgo(60),
      notes: "Rejected after final round. Feedback: 'Strong technical skills, but we went with a candidate with more CMS domain experience.'",
      jobDescription: "Webflow is hiring a Software Engineer to join our CMS Platform team. You'll work on the content management system that powers millions of websites, focusing on performance, scalability, and developer experience.",
      resumeLink: "",
    },
    {
      companyName: "Figma",
      jobTitle: "Design Engineer",
      jobUrl: "https://figma.com/careers/design-engineer",
      source: "Referral" as const,
      status: "Rejected" as const,
      applicationDate: daysAgo(90),
      interviewDate: daysLater(daysAgo(90), 21),
      notes: "Made it to final round. Design portfolio was well-received but they wanted more production experience with design systems at scale.",
      jobDescription: "Figma is looking for a Design Engineer who bridges the gap between design and engineering. You'll work on our component library, prototyping tools, and developer API to make design accessible to everyone.",
    },
    {
      companyName: "Railway",
      jobTitle: "Software Engineer Intern",
      jobUrl: "https://railway.app/careers/intern",
      source: "Indeed" as const,
      status: "Rejected" as const,
      applicationDate: daysAgo(120),
      notes: "Rejected at resume screening stage. Likely due to not meeting experience requirements.",
      jobDescription: "Railway is offering a 12-week software engineering internship. You'll work alongside our core team on infrastructure, developer tooling, and customer-facing features.",
    },
    {
      companyName: "GitHub",
      jobTitle: "Software Engineer, Copilot",
      jobUrl: "https://github.com/careers/software-engineer-copilot",
      source: "Facebook" as const,
      status: "Saved" as const,
      applicationDate: daysAgo(0),
      notes: "Heard about this role from a GitHub community post. Need to research the team more before applying.",
      jobDescription: "GitHub is hiring a Software Engineer to work on GitHub Copilot. You'll help build the next generation of AI-powered development tools that assist millions of developers worldwide.",
      resumeLink: "",
    },
    {
      companyName: "Datadog",
      jobTitle: "Senior Full Stack Engineer",
      jobUrl: "https://datadog.com/careers/senior-full-stack",
      source: "LinkedIn" as const,
      status: "Applied" as const,
      applicationDate: daysAgo(7),
      notes: "Applied through LinkedIn Easy Apply. Company uses a lot of the tools I'm familiar with.",
      jobDescription: "Datadog is seeking a Senior Full Stack Engineer to build and maintain our cloud monitoring platform. You'll work across our React frontend and Go backend to deliver real-time observability at scale.",
    },
  ];

  for (const app of applications) {
    await prisma.application.create({
      data: {
        ...app,
        userId: user.id,
      },
    });
  }

  console.log(`  Created ${applications.length} applications with varied statuses`);

  // Count and verify
  const count = await prisma.application.count();
  const statusCounts = await prisma.application.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log(`\n✅ Seed complete!`);
  console.log(`  Total applications: ${count}`);
  console.log(`  Status breakdown:`);
  for (const s of statusCounts) {
    console.log(`    ${s.status}: ${s._count}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

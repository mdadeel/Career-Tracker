-- AlterTable: Add missing columns to users
ALTER TABLE "users" ADD COLUMN "resumeText" TEXT;
ALTER TABLE "users" ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;
ALTER TABLE "users" ADD COLUMN "aiProvider" TEXT DEFAULT 'system_default' NOT NULL;
ALTER TABLE "users" ADD COLUMN "aiApiKey" TEXT;
ALTER TABLE "users" ADD COLUMN "aiBaseUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "aiModel" TEXT;

-- CreateTable: resumes
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "textContent" TEXT,
    "s3_key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add missing columns to applications
ALTER TABLE "applications" ADD COLUMN "jobDescription" TEXT;
ALTER TABLE "applications" ADD COLUMN "resumeLink" TEXT;
ALTER TABLE "applications" ADD COLUMN "interviewDate" TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN "salaryMin" INTEGER;
ALTER TABLE "applications" ADD COLUMN "salaryMax" INTEGER;
ALTER TABLE "applications" ADD COLUMN "salaryCurrency" TEXT DEFAULT 'USD' NOT NULL;
ALTER TABLE "applications" ADD COLUMN "location" TEXT;
ALTER TABLE "applications" ADD COLUMN "employmentType" TEXT;
ALTER TABLE "applications" ADD COLUMN "remoteStatus" TEXT;
ALTER TABLE "applications" ADD COLUMN "companyLogo" TEXT;
ALTER TABLE "applications" ADD COLUMN "aiMatchScore" INTEGER;
ALTER TABLE "applications" ADD COLUMN "aiAnalysis" JSONB;
ALTER TABLE "applications" ADD COLUMN "resumeId" TEXT;

-- CreateIndex
CREATE INDEX "applications_userId_source_idx" ON "applications"("userId", "source");
CREATE INDEX "applications_userId_applicationDate_idx" ON "applications"("userId", "applicationDate");
CREATE INDEX "applications_userId_createdAt_idx" ON "applications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

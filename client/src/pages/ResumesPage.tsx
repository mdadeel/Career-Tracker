import { ResumeManager } from "../components/ResumeManager";

export function ResumesPage() {
  return (
    <div className="mx-auto max-w-3xl py-5 lg:py-6 space-y-6">
      <div>
        <h1 className="text-base font-semibold text-ink dark:text-white/90">Resumes</h1>
        <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
          Upload and manage your resumes for AI-powered job matching
        </p>
      </div>
      <section className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
        <div className="p-5">
          <ResumeManager />
        </div>
      </section>
    </div>
  );
}

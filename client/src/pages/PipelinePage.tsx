import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApplications } from "../hooks/useApplications";
import { Skeleton, Button } from "../components/ui";
import { formatDate } from "../utils/format";
import { Plus } from "@phosphor-icons/react";
import type { Application, ApplicationStatus } from "../types";

const PIPELINE_STAGES: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: "Saved", label: "Saved", color: "bg-slate-400" },
  { key: "Applied", label: "Applied", color: "bg-blue-500" },
  { key: "Assessment", label: "Assessment", color: "bg-amber-500" },
  { key: "Interview", label: "Interview", color: "bg-purple-500" },
  { key: "Rejected", label: "Rejected", color: "bg-rose-500" },
  { key: "Offer", label: "Offer", color: "bg-emerald-500" },
];

const statusColors: Record<string, string> = {
  Saved: "bg-slate-400",
  Applied: "bg-blue-500",
  Assessment: "bg-amber-500",
  Interview: "bg-purple-500",
  Rejected: "bg-rose-500",
  Offer: "bg-emerald-500",
};

/* ─── Sortable Card ─── */
function PipelineCard({ app, isDragging }: { app: Application; isDragging?: boolean }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } =
    useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/applications?id=${app.id}`);
      }}
      className={`rounded-xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface p-3.5 cursor-grab active:cursor-grabbing transition-all hover:border-slate-300 dark:hover:border-white/20 hover:shadow-card-hover hover:-translate-y-0.5 ${
        isDragging ? "shadow-elevated ring-2 ring-brand-500/30" : ""
      }`}
    >
      {/* Status color accent bar */}
      <div className={`h-1 w-8 rounded-full mb-2 ${statusColors[app.status] || "bg-slate-400"}`} />
      <p className="text-xs font-semibold text-ink dark:text-white/90 truncate">{app.jobTitle}</p>
      <p className="text-[11px] font-medium text-ink-secondary dark:text-white/50 mt-0.5 truncate">{app.companyName}</p>
      {app.location && (
        <p className="text-xs text-ink-tertiary dark:text-white/40 mt-1 truncate">{app.location}</p>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-ink-tertiary dark:text-white/40">
        <span>{app.source}</span>
        <span className="tabular-nums font-mono">{formatDate(app.applicationDate)}</span>
      </div>
    </div>
  );
}

/* ─── Drag Preview ─── */
function DragPreview({ app }: { app: Application }) {
  return (
    <div className="rounded-xl border border-brand-300 dark:border-brand-500/40 bg-white dark:bg-dark-surface p-3.5 shadow-xl ring-2 ring-brand-500/30 max-w-[250px]">
      <p className="text-xs font-bold text-ink dark:text-white/90">{app.jobTitle}</p>
      <p className="text-[11px] font-medium text-ink-secondary dark:text-white/50 mt-0.5">{app.companyName}</p>
    </div>
  );
}

/* ─── Column ─── */
function PipelineColumn({
  id,
  label,
  color,
  apps,
  onAdd,
  isOver,
}: {
  id: string;
  label: string;
  color: string;
  apps: Application[];
  onAdd: () => void;
  isOver: boolean;
}) {
  const ids = apps.map((a) => a.id);
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-[calc(100vh-230px)] min-h-[460px] max-h-[720px] w-[260px] shrink-0 flex-col rounded-2xl border transition-all duration-150 shadow-sm ${
        isOver
          ? "border-brand-500 dark:border-brand-400 bg-brand-50/60 dark:bg-brand-500/10 shadow-md ring-2 ring-brand-500/20"
          : "border-slate-200/80 dark:border-dark-border bg-slate-50/70 dark:bg-white/[0.02]"
      }`}
    >
      {/* Header - sticky */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-3.5 py-3 border-b border-slate-200/80 dark:border-dark-border/80 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-t-2xl">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xs font-bold text-ink dark:text-white/90 flex-1">{label}</span>
        <span className="text-[11px] font-bold text-slate-500 dark:text-white/40 tabular-nums bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded-full">
          {apps.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5 p-2.5 overflow-y-auto min-h-[120px]">
          {apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[120px] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 p-4 text-center">
              <p className="text-xs font-medium text-slate-400 dark:text-white/30">Drop cards here</p>
            </div>
          ) : (
            apps.map((app) => <PipelineCard key={app.id} app={app} />)
          )}
        </div>
      </SortableContext>

      {/* Add button */}
      <div className="p-2 border-t border-slate-200/80 dark:border-dark-border/80 bg-white/30 dark:bg-white/[0.01] rounded-b-2xl">
        <button
          onClick={onAdd}
          className="w-full rounded-xl py-1.5 text-xs font-semibold text-slate-500 dark:text-white/50 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Job</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function PipelineSkeleton() {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-1">
      <div className="flex gap-3.5 min-w-max pb-2">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.key} className="flex h-[460px] w-[260px] shrink-0 flex-col rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="px-3.5 py-3 border-b border-slate-200 dark:border-dark-border">
              <Skeleton width={80} height={14} />
            </div>
            <div className="p-2.5 space-y-2.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3.5 space-y-2">
                  <Skeleton width="80%" height={12} />
                  <Skeleton width="60%" height={10} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function PipelinePage() {
  const { applications, isLoading, updateApplication, refresh } = useApplications();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const grouped = useMemo(() => {
    const map: Record<string, Application[]> = {};
    for (const stage of PIPELINE_STAGES) {
      map[stage.key] = [];
    }
    for (const app of applications) {
      if (map[app.status]) {
        map[app.status].push(app);
      } else {
        map["Saved"].push(app);
      }
    }
    return map;
  }, [applications]);

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over && PIPELINE_STAGES.some((s) => s.key === over.id)) {
      setOverColumnId(over.id as string);
    } else if (over) {
      const overApp = applications.find((a) => a.id === over.id);
      if (overApp) setOverColumnId(overApp.status);
    } else {
      setOverColumnId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setOverColumnId(null);
    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    const overId = over.id as string;
    let targetStage: ApplicationStatus | null = null;

    if (PIPELINE_STAGES.some((s) => s.key === overId)) {
      targetStage = overId as ApplicationStatus;
    } else {
      const overApp = applications.find((a) => a.id === overId);
      if (overApp) targetStage = overApp.status;
    }

    if (targetStage && targetStage !== app.status) {
      try {
        await updateApplication(appId, { status: targetStage });
      } catch {
        refresh();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-ink dark:text-white/90">Pipeline</h1>
            <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">Drag applications between stages</p>
          </div>
        </div>
        <PipelineSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Board — full width smooth horizontal scroll container */}
      <div className="relative w-full overflow-x-auto pb-4 pt-1 touch-pan-x">
        {/* Scroll indicator gradient */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-50/80 dark:from-dark/80 to-transparent z-10" />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3.5 min-w-max pb-2">
            {PIPELINE_STAGES.map((stage) => (
              <PipelineColumn
                key={stage.key}
                id={stage.key}
                label={stage.label}
                color={stage.color}
                apps={grouped[stage.key] || []}
                onAdd={() => navigate(`/applications/new?status=${stage.key}`)}
                isOver={overColumnId === stage.key}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApp && <DragPreview app={activeApp} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-ink dark:text-white/80">No applications yet</p>
            <p className="mt-1 text-xs text-ink-secondary dark:text-white/50">
              Add your first application to start building your pipeline
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => navigate("/applications/new")}>
                Add Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


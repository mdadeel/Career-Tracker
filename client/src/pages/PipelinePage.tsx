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

/* ─── Sortable Card ─── */
function PipelineCard({ app, isDragging }: { app: Application; isDragging?: boolean }) {
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
      className={`rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm ${
        isDragging ? "shadow-elevated ring-2 ring-brand-500/30" : ""
      }`}
    >
      <p className="text-xs font-medium text-ink dark:text-white/85 truncate">{app.jobTitle}</p>
      <p className="text-[11px] text-ink-secondary dark:text-white/50 mt-0.5 truncate">{app.companyName}</p>
      {app.location && (
        <p className="text-xs text-ink-tertiary dark:text-white/40 mt-1 truncate">{app.location}</p>
      )}
      <p className="text-xs text-ink-tertiary dark:text-white/40 mt-1 tabular-nums">{formatDate(app.applicationDate)}</p>
    </div>
  );
}

/* ─── Drag Preview ─── */
function DragPreview({ app }: { app: Application }) {
  return (
    <div className="rounded-lg border border-brand-300 dark:border-brand-500/40 bg-white dark:bg-dark-surface p-3 shadow-elevated ring-2 ring-brand-500/30 max-w-[240px]">
      <p className="text-xs font-medium text-ink dark:text-white/85">{app.jobTitle}</p>
      <p className="text-[11px] text-ink-secondary dark:text-white/50 mt-0.5">{app.companyName}</p>
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
      className={`flex min-h-[300px] w-[200px] shrink-0 flex-col rounded-xl border bg-slate-50/50 dark:bg-white/[0.02] transition-all duration-150 ${
        isOver
          ? "border-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-brand-500/5 shadow-elevated"
          : "border-slate-200 dark:border-dark-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-200 dark:border-dark-border">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-xs font-semibold text-ink dark:text-white/85 flex-1">{label}</span>
        <span className="text-[11px] font-semibold text-ink-tertiary dark:text-white/40 tabular-nums">{apps.length}</span>
      </div>

      {/* Cards */}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 p-2 overflow-y-auto">
          {apps.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[11px] text-ink-tertiary dark:text-white/30">Drop here</p>
            </div>
          ) : (
            apps.map((app) => <PipelineCard key={app.id} app={app} />)
          )}
        </div>
      </SortableContext>

      {/* Add button */}
      <div className="p-2 border-t border-slate-200 dark:border-dark-border">
        <button
          onClick={onAdd}
          className="w-full rounded-md py-1.5 text-[11px] font-medium text-ink-tertiary dark:text-white/40 hover:text-ink-secondary dark:hover:text-white/60 hover:bg-surface-tertiary dark:hover:bg-white/[0.04] transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function PipelineSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => (
        <div key={stage.key} className="flex min-h-[300px] w-[200px] shrink-0 flex-col rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="px-3 py-2.5 border-b border-slate-200 dark:border-dark-border">
            <Skeleton width={60} height={14} />
          </div>
          <div className="p-2 space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3 space-y-2">
                <Skeleton width="80%" height={10} />
                <Skeleton width="60%" height={8} />
              </div>
            ))}
          </div>
        </div>
      ))}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-ink dark:text-white/90">Pipeline</h1>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-white/50">
            Drag applications between stages to update their status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/applications")}
          >
            List View
          </Button>
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate("/applications/new")}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Pipeline Board — full width breakout */}
      <div className="-mx-3 lg:-mx-4 max-w-none" style={{ width: 'calc(100vw - 12rem)' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4 px-3 lg:px-4">
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

import { useState, useRef } from "react";
import { resumeService } from "../services/resumeService";
import { useToast } from "../context/ToastContext";
import { Spinner, FileText } from "@phosphor-icons/react";

interface ResumeUploaderProps {
  onUploaded: (resume: { id: string; fileName: string }) => void;
}

export function ResumeUploader({ onUploaded }: ResumeUploaderProps) {
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      addToast("Unsupported file type. Accepted: PDF, DOCX, TXT.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("File is too large. Maximum size is 5MB.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const resume = await resumeService.upload(file);
      onUploaded(resume);
      addToast(`"${file.name}" uploaded successfully!`, "success");
    } catch (err: any) {
      addToast(err?.message || "Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
        dragOver
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/5"
          : "border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = ""; }}
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Spinner size={20} className="animate-spin text-brand-600" />
          <p className="text-xs text-ink-secondary dark:text-white/50">Uploading and parsing...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <FileText size={20} className="text-ink-tertiary dark:text-white/40" />
          <p className="text-xs font-medium text-ink dark:text-white/70">
            Drop a resume file here, or click to browse
          </p>
          <p className="text-[10px] text-ink-tertiary dark:text-white/40">
            PDF, DOCX, or TXT &middot; up to 5MB
          </p>
        </div>
      )}
    </div>
  );
}

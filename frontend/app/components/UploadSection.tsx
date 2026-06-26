"use client";

import { UploadCloud, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useUpload } from "../contexts/UploadContext";

export default function UploadSection() {
  const {
    selectedFiles,
    setSelectedFiles,
    loading,
    progress,
    statusText,
    result,
    requestError,
    startUpload,
  } = useUpload();

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <div className="
        border border-slate-800
        rounded-2xl
        p-10
        bg-slate-900/60
        backdrop-blur-md
        text-center
        shadow-xl
      ">

        <UploadCloud
          size={60}
          className="mx-auto text-slate-300"
        />

        <h2 className="text-2xl font-bold mt-4 text-white">
          Upload Resumes
        </h2>

        <p className="text-slate-400 mt-1">
          PDF and DOCX files supported
        </p>

        <input
          type="file"
          multiple
          accept=".pdf,.docx"
          disabled={loading}
          className="
            mt-6
            block
            mx-auto
            text-sm
            text-slate-300
            file:mr-4
            file:py-2
            file:px-4
            file:rounded-lg
            file:border-0
            file:bg-slate-800
            file:text-white
            hover:file:bg-slate-700
            cursor-pointer
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          onChange={(e) => setSelectedFiles(e.target.files)}
        />

        <button
          onClick={startUpload}
          disabled={loading}
          className="
            mt-6
            bg-white
            text-black
            px-6
            py-2
            rounded-lg
            font-medium
            hover:bg-slate-200
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Processing..." : "Upload"}
        </button>

        {loading && (
          <div className="mt-8">
            <div className="bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-white h-3 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-slate-300 text-sm">
              {progress}% — {statusText}
            </p>

            <p className="mt-2 text-slate-500 text-xs">
              You can switch tabs — this keeps running in the background.
            </p>
          </div>
        )}

        {!loading && requestError && (
          <div className="mt-6 flex items-start gap-3 text-left bg-red-950/50 border border-red-800 rounded-xl p-4">
            <AlertTriangle size={20} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Upload failed</p>
              <p className="text-red-400/90 text-sm mt-1">{requestError}</p>
            </div>
          </div>
        )}

        {!loading && result && (
          <div className="mt-6 text-left">
            <p className="text-slate-300 text-sm mb-3">
              {result.success_count}/{result.total_files} succeeded
              {result.failed_count > 0 && `, ${result.failed_count} failed`}
            </p>

            <ul className="space-y-2">
              {result.results.map((r, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                    r.status === "success"
                      ? "bg-emerald-950/40 border border-emerald-900"
                      : "bg-red-950/40 border border-red-900"
                  }`}
                >
                  {r.status === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-slate-200 font-medium break-all">{r.filename}</p>
                    {r.status === "failed" && (
                      <p className="text-red-400/90 mt-0.5">
                        {r.error_type ? `${r.error_type}: ` : ""}
                        {r.error ?? "Unknown error"}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
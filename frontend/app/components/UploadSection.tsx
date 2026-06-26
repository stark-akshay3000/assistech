"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../services/api";

export default function UploadSection() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function pollProgress(jobId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/progress/${jobId}`);
        const data = res.data;

        // Debug: open your browser console to see exactly what
        // the backend returns on every poll tick.
        console.log("[progress poll]", jobId, data);

        if (!data || data.status === "not_found") {
          setStatusText("Waiting for job to start...");
          return;
        }

        setProgress(data.percentage ?? 0);

        if (data.status === "completed") {
          setStatusText("Processing complete");
          stopPolling();
        } else {
          setStatusText(
            `Processed ${data.completed + data.failed}/${data.total} files`
          );
        }
      } catch (error: any) {
        // Tells you immediately if it's a 404 (route prefix
        // mismatch) vs a genuine server error.
        console.error(
          "progress poll failed:",
          error?.response?.status,
          error?.response?.data || error.message
        );
        setStatusText(
          `Progress check failed (${error?.response?.status ?? "network error"})`
        );
      }
    }, 1000);
  }

  async function uploadFiles() {
    if (!files) return;

    const jobId = crypto.randomUUID();

    const formData = new FormData();
    formData.append("job_id", jobId);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);
      setProgress(0);
      setStatusText("Uploading files...");

      // Start polling immediately — we already know the job_id,
      // so we don't have to wait for the upload request to finish.
      pollProgress(jobId);

      await api.post("/upload", formData);

      // Let the bar actually land on 100% and stay visible for a
      // beat before we hide it — otherwise it disappears the
      // instant it reaches completion, which looks just as abrupt.
      setProgress(100);
      setStatusText("✅ All files processed successfully");
      stopPolling();

      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error(error);
      setStatusText("Upload failed");
      stopPolling();
    } finally {
      setLoading(false);
    }
  }

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
          "
          onChange={(e) => setFiles(e.target.files)}
        />

        <button
          onClick={uploadFiles}
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
          </div>
        )}
      </div>
    </div>
  );
}
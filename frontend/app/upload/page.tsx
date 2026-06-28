"use client";

import { useRef, useState } from "react";
import { api } from "../services/api";

interface FileResult {
  filename: string;
  status: "success" | "failed";
  error?: string;
  error_type?: string;
  candidate_id?: string;
  resume_url?: string;
}

interface UploadSummary {
  job_id: string;
  total_files: number;
  success_count: number;
  failed_count: number;
  results: FileResult[];
}

export default function UploadPage() {

  const [files, setFiles] =
    useState<FileList | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [statusText, setStatusText] =
    useState("");

  const [result, setResult] =
    useState<UploadSummary | null>(null);

  const [requestError, setRequestError] =
    useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function describeError(err: any): string {
    if (!err) return "Unknown error occurred.";

    if (err.request && !err.response) {
      return "Could not reach the server. Check your internet connection or try again.";
    }

    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 422 && data?.detail) {
      const messages = Array.isArray(data.detail)
        ? data.detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("; ")
        : JSON.stringify(data.detail);
      return `Invalid request: ${messages}`;
    }

    if (typeof data?.detail === "string") {
      return `Server error (${status}): ${data.detail}`;
    }

    if (status === 413) {
      return "Upload failed: file(s) too large.";
    }

    if (status && status >= 500) {
      return `Server error (${status}). Please try again in a moment.`;
    }

    if (status) {
      return `Request failed (${status}): ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`;
    }

    return err.message || "Something went wrong while uploading.";
  }

  function pollProgress(jobId: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/progress/${jobId}`);
        const data = res.data;

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
      } catch (err: any) {
        console.error(
          "progress poll failed:",
          err?.response?.status,
          err?.response?.data || err.message
        );
        setStatusText(
          `Progress check failed (${err?.response?.status ?? "network error"})`
        );
      }
    }, 1000);
  }

  async function uploadResumes() {

    if (!files || files.length === 0) {
      setRequestError("Please select at least one file before uploading.");
      return;
    }

    const jobId = crypto.randomUUID();

    const formData = new FormData();
    formData.append("job_id", jobId);

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    setRequestError(null);
    setResult(null);

    try {

      setLoading(true);
      setProgress(0);
      setStatusText("Uploading files...");

      pollProgress(jobId);

      const response =
        await api.post(
          "/upload",
          formData
        );

      const data: UploadSummary = response.data;

      setProgress(100);
      stopPolling();
      setResult(data);

      if (data.failed_count > 0 && data.success_count === 0) {
        setStatusText("❌ All files failed to process");
      } else if (data.failed_count > 0) {
        setStatusText(
          `⚠️ Completed with errors: ${data.success_count} succeeded, ${data.failed_count} failed`
        );
      } else {
        setStatusText("✅ All files processed successfully");
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

    } catch (err: any) {

      console.error(err);
      stopPolling();
      setRequestError(describeError(err));
      setStatusText("Upload failed");

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="max-w-4xl mx-auto p-10">

      <h1 className="text-3xl font-bold">
        Upload Resumes
      </h1>

      <input
        type="file"
        multiple
        accept=".pdf,.docx"
        className="mt-6"
        onChange={(e) => {
          setFiles(e.target.files);
          setRequestError(null);
          setResult(null);
        }}
      />

      <button
        onClick={uploadResumes}
        disabled={loading}
        className="mt-4 bg-black text-white px-5 py-2 rounded disabled:opacity-50"
      >
        Upload
      </button>

      {loading && (

        <div className="mt-6">

          <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-black h-3 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {progress}% — {statusText}
          </p>

        </div>

      )}

      {!loading && requestError && (
        <div className="mt-6 border border-red-300 bg-red-50 rounded p-4">
          <p className="text-red-700 font-semibold">Upload failed</p>
          <p className="text-red-600 text-sm mt-1">{requestError}</p>
        </div>
      )}

      {!loading && result && (

        <div className="mt-6">

          <h2 className="font-bold">
            Upload Summary
          </h2>

          <p className="text-sm text-gray-700 mt-1 mb-3">
            {result.success_count}/{result.total_files} succeeded
            {result.failed_count > 0 && `, ${result.failed_count} failed`}
          </p>

          <ul className="space-y-2">
            {result.results.map((r, i) => (
              <li
                key={i}
                className={`border rounded p-3 text-sm ${
                  r.status === "success"
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <p className="font-medium break-all">
                  {r.status === "success" ? "✅" : "❌"} {r.filename}
                </p>
                {r.status === "failed" && (
                  <p className="text-red-600 mt-1">
                    {r.error_type ? `${r.error_type}: ` : ""}
                    {r.error ?? "Unknown error"}
                  </p>
                )}
              </li>
            ))}
          </ul>

        </div>

      )}

    </div>
  );
}
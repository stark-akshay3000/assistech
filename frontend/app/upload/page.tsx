"use client";

import { useRef, useState } from "react";
import { api } from "../services/api";

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
    useState<any>(null);

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

      pollProgress(jobId);

      const response =
        await api.post(
          "/upload",
          formData
        );

      setProgress(100);
      setStatusText("✅ All files processed successfully");
      stopPolling();

      setResult(response.data);

      await new Promise((resolve) => setTimeout(resolve, 800));

    } catch (err) {

      console.error(err);
      setStatusText("Upload failed");
      stopPolling();

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
        onChange={(e) =>
          setFiles(e.target.files)
        }
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

      {result && (

        <div className="mt-6">

          <h2 className="font-bold">
            Upload Summary
          </h2>

          <pre>
            {JSON.stringify(
              result,
              null,
              2
            )}
          </pre>

        </div>

      )}

    </div>
  );
}
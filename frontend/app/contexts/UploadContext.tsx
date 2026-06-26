"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

interface UploadContextValue {
  selectedFiles: FileList | null;
  setSelectedFiles: (files: FileList | null) => void;
  loading: boolean;
  progress: number;
  statusText: string;
  result: UploadSummary | null;
  requestError: string | null;
  startUpload: () => Promise<void>;
  reset: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

const STORAGE_KEY = "active_upload_job_id";
const TOTAL_KEY = "active_upload_total_files";

function describeError(error: any): string {
  if (!error) return "Unknown error occurred.";

  if (error.request && !error.response) {
    return "Could not reach the server. Check your internet connection or try again.";
  }

  const status = error?.response?.status;
  const data = error?.response?.data;

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

  return error.message || "Something went wrong while uploading.";
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<UploadSummary | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const pollProgress = useCallback((jobId: string) => {
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
          setLoading(false);
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(TOTAL_KEY);
        } else {
          setStatusText(
            `Processed ${data.completed + data.failed}/${data.total} files`
          );
        }
      } catch (error: any) {
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
  }, []);

  // On mount (i.e. whenever any page wraps itself in the provider's
  // tree for the first time — which in practice is once, at app
  // load, since the provider sits in layout.tsx), check if there
  // was an upload in flight before a refresh and resume polling it.
  useEffect(() => {
    const existingJobId = sessionStorage.getItem(STORAGE_KEY);
    if (existingJobId) {
      setLoading(true);
      setStatusText("Resuming progress check...");
      pollProgress(existingJobId);
    }

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startUpload = useCallback(async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setRequestError("Please select at least one file before uploading.");
      return;
    }

    const jobId = crypto.randomUUID();

    const formData = new FormData();
    formData.append("job_id", jobId);

    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    setRequestError(null);
    setResult(null);

    try {
      setLoading(true);
      setProgress(0);
      setStatusText("Uploading files...");

      sessionStorage.setItem(STORAGE_KEY, jobId);
      sessionStorage.setItem(TOTAL_KEY, String(selectedFiles.length));

      // Polling starts immediately and keeps running via the
      // context-held interval even if the user navigates away —
      // the provider lives above the router so it never unmounts.
      pollProgress(jobId);

      const response = await api.post("/upload", formData);
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

      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TOTAL_KEY);
    } catch (error: any) {
      console.error(error);
      stopPolling();
      setRequestError(describeError(error));
      setStatusText("Upload failed");
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TOTAL_KEY);
    } finally {
      setLoading(false);
    }
  }, [selectedFiles, pollProgress]);

  const reset = useCallback(() => {
    setSelectedFiles(null);
    setResult(null);
    setRequestError(null);
    setProgress(0);
    setStatusText("");
  }, []);

  return (
    <UploadContext.Provider
      value={{
        selectedFiles,
        setSelectedFiles,
        loading,
        progress,
        statusText,
        result,
        requestError,
        startUpload,
        reset,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return ctx;
}
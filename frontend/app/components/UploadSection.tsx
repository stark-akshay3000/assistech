"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api";

export default function UploadSection() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadFiles() {
    if (!files) return;

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);
      setProgress(0);

      await api.post("/upload", formData, {
        onUploadProgress: (event) => {
          const percent = Math.round(
            (event.loaded * 100) / (event.total || 1)
          );
          setProgress(percent);
        },
      });

      alert("Upload Complete");
    } catch (error) {
      console.error(error);
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
          {loading ? "Uploading..." : "Upload"}
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
              {progress}% uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
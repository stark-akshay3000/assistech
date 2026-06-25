"use client";

import { useState } from "react";
import { api } from "../services/api";

export default function UploadPage() {

  const [files, setFiles] =
    useState<FileList | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<any>(null);

  async function uploadResumes() {

    if (!files) return;

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {

      setLoading(true);

      const response =
        await api.post(
          "/upload",
          formData
        );

      setResult(response.data);

    } catch (err) {

      console.error(err);

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
        className="mt-4 bg-black text-white px-5 py-2 rounded"
      >
        Upload
      </button>

      {loading && (

        <div className="mt-6">

          <p>
            Processing resumes...
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
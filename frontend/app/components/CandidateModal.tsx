import { Candidate } from "../types/candidate";

interface Props {
  candidate: Candidate | null;
  loading?: boolean;
  onClose: () => void;
}

export default function CandidateModal({
  candidate,
  loading,
  onClose,
}: Props) {

  if (!candidate && !loading) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-[750px] max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-300">Loading candidate...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {candidate?.name}
              </h2>

              <button onClick={onClose} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">

              <p><span className="text-slate-400">Email:</span> {candidate?.email}</p>

              <p><span className="text-slate-400">Phone:</span> {candidate?.phone}</p>

              <p>
                <span className="text-slate-400">LinkedIn:</span>{" "}
                <a className="text-blue-400" href={candidate?.linkedin_url} target="_blank">
                  {candidate?.linkedin_url}
                </a>
              </p>

              <p>
                <span className="text-slate-400">GitHub:</span>{" "}
                <a className="text-blue-400" href={candidate?.github_url} target="_blank">
                  {candidate?.github_url}
                </a>
              </p>

              <p><span className="text-slate-400">Location:</span> {candidate?.location}</p>

              <p><span className="text-slate-400">Experience:</span> {candidate?.total_experience} years</p>

              <p><span className="text-slate-400">Recent Job:</span> {candidate?.recent_job_title}</p>

              <div>
                <p className="text-slate-400 mb-2">Skills</p>

                <div className="flex flex-wrap gap-2">
                  {candidate?.skills?.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-slate-800 border border-slate-700 px-2 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={candidate?.resume_file_url}
                target="_blank"
                className="inline-block mt-5 bg-white text-black px-4 py-2 rounded-lg"
              >
                View Resume
              </a>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
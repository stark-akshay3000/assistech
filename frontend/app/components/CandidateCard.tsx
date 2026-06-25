import { Candidate } from "../types/candidate";

interface Props {
  candidate: Candidate;
  onClick: () => void;
}

export default function CandidateCard({
  candidate,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className="
        bg-slate-900/60
        border border-slate-800
        rounded-2xl
        p-5
        cursor-pointer
        transition-all
        hover:shadow-xl
        hover:border-slate-600
        hover:-translate-y-1
        backdrop-blur-md
      "
    >
      <h3 className="font-bold text-lg text-white">
        {candidate.name || "Unknown"}
      </h3>

      <p className="text-slate-400 mt-1">
        {candidate.recent_job_title}
      </p>

      <div className="mt-4 flex justify-between text-sm text-slate-300">
        <span>
          📍 {candidate.location || "N/A"}
        </span>

        <span>
          💼 {candidate.total_experience} yrs
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-4">
        {candidate.skills?.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="
              bg-slate-800
              text-slate-200
              px-2 py-1
              rounded-full
              text-xs
              border border-slate-700
            "
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
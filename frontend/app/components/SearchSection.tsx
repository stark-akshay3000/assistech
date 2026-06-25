"use client";

import { useEffect, useState } from "react";

import CandidateCard from "./CandidateCard";
import CandidateModal from "./CandidateModal";
import { api } from "../services/api";

export default function SearchSection() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);

  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [jobRole, setJobRole] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const response = await api.get("/candidates");
      setCandidates(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function openCandidate(candidateId: string) {
    try {
      setLoadingCandidate(true);
      const res = await api.get(`/candidates/${candidateId}`);
      setSelectedCandidate(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCandidate(false);
    }
  }

  async function searchCandidates() {
    try {
      const response = await api.post("/candidates/search", {
        skills: skills ? skills.split(",").map((s) => s.trim()) : [],
        locations: location ? [location] : [],
        min_experience: experience ? Number(experience) : null,
        job_role: jobRole ? jobRole : null,
      });

      setCandidates(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const JOB_ROLES = [
    { label: "All Roles", value: "" },
    { label: "Software Engineer", value: "SOFTWARE_ENGINEER" },
    { label: "Backend Engineer", value: "BACKEND_ENGINEER" },
    { label: "Frontend Engineer", value: "FRONTEND_ENGINEER" },
    { label: "Full Stack Engineer", value: "FULL_STACK_ENGINEER" },
    { label: "AI Engineer", value: "AI_ENGINEER" },
    { label: "Machine Learning Engineer", value: "ML_ENGINEER" },
    { label: "Data Scientist", value: "DATA_SCIENTIST" },
    { label: "DevOps Engineer", value: "DEVOPS_ENGINEER" },
    { label: "Mobile Engineer", value: "MOBILE_ENGINEER" },
    { label: "Product Manager", value: "PRODUCT_MANAGER" },
    { label: "Other", value: "OTHER" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-white">

      {/* Search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold mb-5">
          Search Candidates
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          {/* Skills */}
          <input
            placeholder="Skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="bg-slate-950 border border-slate-700 p-3 rounded-lg"
          />

          {/* Location */}
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-slate-950 border border-slate-700 p-3 rounded-lg"
          />

          {/* Experience */}
          <input
            type="number"
            placeholder="Experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="bg-slate-950 border border-slate-700 p-3 rounded-lg"
          />

          {/* Job Role Dropdown */}
          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="bg-slate-950 border border-slate-700 p-3 rounded-lg"
          >
            {JOB_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">

          <button
            onClick={searchCandidates}
            className="bg-white text-black px-6 py-2 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSkills("");
              setLocation("");
              setExperience("");
              setJobRole("");
              fetchCandidates();
            }}
            className="border border-slate-700 px-6 py-2 rounded-lg"
          >
            Reset
          </button>

        </div>
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate: any) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onClick={() => openCandidate(candidate.id)}
          />
        ))}
      </div>

      {/* Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        loading={loadingCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
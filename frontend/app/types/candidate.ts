export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;

  location: string;
  total_experience: number;

  recent_job_title: string;

  skills: string[];

  resume_file_url: string;
}
# TechAssist

TechAssist is an AI-powered Resume Screening System built with **FastAPI** (Backend) and **Next.js** (Frontend). The application allows users to upload resumes, extracts and analyzes candidate information using AI, stores candidate details in a Supabase database, and provides advanced search and filtering capabilities.

---

# Tech Stack

## Frontend
- Next.js
- TypeScript
- Axios
- Tailwind CSS

## Backend
- FastAPI
- Supabase PostgreSQL
- Google Gemini API
- AWS S3
- Uvicorn

---

# Prerequisites

Before running the project, ensure you have the following installed:

- Python 3.10+
- Node.js 18+
- npm
- Docker (Optional)

---

# Project Structure

```text
project/
│
├── .env                   # Backend environment variables
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── src/
    ├── package.json
    └── .env          # Frontend environment variables
```

---

# Backend Setup

The backend can be run using either:

- Python Virtual Environment
- Docker

---

# Option 1: Run Using Python

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create a Virtual Environment

#### Windows

```bash
python -m venv .venv
```

#### Linux/macOS

```bash
python3 -m venv .venv
```

### 3. Activate the Virtual Environment

#### Windows

```bash
.venv\Scripts\activate
```

#### Linux/macOS

```bash
source .venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a file named **`.env`** in the **project root directory**.

Example:

```env
SUPABASE_DB_URL=your-supabase-db-url

GEMINI_API_KEY=your-gemini-api-key

AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region

S3_BUCKET_NAME=your-s3-bucket-name
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_DB_URL` | Supabase PostgreSQL connection string. |
| `GEMINI_API_KEY` | Google Gemini API key used for AI-powered resume analysis. |
| `AWS_ACCESS_KEY_ID` | AWS access key used to access the configured S3 bucket. |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key corresponding to the AWS access key. |
| `AWS_REGION` | AWS region where the S3 bucket is hosted (e.g., `ap-south-1`). |
| `S3_BUCKET_NAME` | Amazon S3 bucket used to store uploaded resumes and files. |

### 6. Start the Backend

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

```
http://localhost:8000
```

Swagger Documentation:

```
http://localhost:8000/docs
```

ReDoc Documentation:

```
http://localhost:8000/redoc
```

---

# Option 2: Run Using Docker

Navigate to the backend directory:

```bash
cd backend
```

Build the Docker image:

```bash
docker build -t techassist-backend .
```

Run the Docker container:

```bash
docker run -d -p 8000:8000 --env-file ../.env techassist-backend

```

The backend will be available at:

```
http://localhost:8000
```

---

# Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a file named:

```
.env.local
```

For local development:

```env
NEXT_PUBLIC_API_URL=
```

Leave this variable empty when running the backend locally.

For production:

```env
NEXT_PUBLIC_API_URL=http://YOUR_BACKEND_IP:8000
```

Start the frontend:

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:3000
```

---

# API Documentation

Once the backend is running:

### Swagger UI

```
http://localhost:8000/docs
```

### ReDoc

```
http://localhost:8000/redoc
```

---

# Running the Complete Application

## Terminal 1 - Backend (Python)

```bash
cd backend

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

uvicorn app.main:app --reload
```

### OR

## Terminal 1 - Backend (Docker)

```bash
cd backend

docker build -t techassist-backend .

docker run -p 8000:8000 --env-file ../.env techassist-backend
```

---

## Terminal 2 - Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Default Ports

| Service | Port |
|----------|------|
| Frontend | 3000 |
| Backend | 8000 |

---

# Access the Application

### Frontend

```
http://localhost:3000
```

### Backend

```
http://localhost:8000
```

### Swagger UI

```
http://localhost:8000/docs
```

### ReDoc

```
http://localhost:8000/redoc
```

---

# Troubleshooting

## Backend Does Not Start

- Ensure Python 3.10 or above is installed.
- Ensure all required environment variables are configured in the `.env` file.
- Install dependencies again:

```bash
pip install -r requirements.txt
```

---

## Frontend Cannot Connect to Backend

- Verify the backend is running.
- Check the value of `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.
- Restart the frontend after updating environment variables.

---

## Docker Issues

If dependencies have changed, rebuild the Docker image:

```bash
docker build --no-cache -t techassist-backend .
```

Run the container again:

```bash
docker run -p 8000:8000 --env-file ../.env techassist-backend
```

---

# Security

- Never commit your `.env` or `.env.local` files to version control.
- Keep your API keys, database credentials, and AWS credentials private.
- Add the following to your `.gitignore`:

```gitignore
.env
frontend/.env.local
```

---

# License

This project is intended for educational and assessment purposes. Feel free to modify and extend it according to your project requirements.
from threading import Lock

progress_store = {}
lock = Lock()


def create_progress(job_id: str, total_files: int):
    with lock:
        progress_store[job_id] = {
            "total": total_files,
            "completed": 0,
            "failed": 0,
            "status": "processing",
            "percentage": 0,
        }


def update_progress(job_id: str):
    with lock:
        if job_id not in progress_store:
            return

        progress_store[job_id]["completed"] += 1

        total = progress_store[job_id]["total"]
        done = (
            progress_store[job_id]["completed"]
            + progress_store[job_id]["failed"]
        )

        progress_store[job_id]["percentage"] = int(
            (done / total) * 100
        )


def fail_progress(job_id: str):
    with lock:
        if job_id not in progress_store:
            return

        progress_store[job_id]["failed"] += 1

        total = progress_store[job_id]["total"]
        done = (
            progress_store[job_id]["completed"]
            + progress_store[job_id]["failed"]
        )

        progress_store[job_id]["percentage"] = int(
            (done / total) * 100
        )


def finish_progress(job_id: str):
    with lock:
        if job_id not in progress_store:
            return

        progress_store[job_id]["status"] = "completed"
        progress_store[job_id]["percentage"] = 100


def get_progress(job_id: str):
    return progress_store.get(
        job_id,
        {
            "status": "not_found"
        },
    )
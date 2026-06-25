import os
import uuid

import boto3

from dotenv import load_dotenv

load_dotenv()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=
        os.getenv("AWS_ACCESS_KEY_ID"),

    aws_secret_access_key=
        os.getenv("AWS_SECRET_ACCESS_KEY"),

    region_name=
        os.getenv("AWS_REGION")
)


def upload_resume(
    file_bytes: bytes,
    filename: str
):

    bucket_name = os.getenv(
        "S3_BUCKET_NAME"
    )

    extension = filename.split(".")[-1]

    s3_key = (
        f"resumes/"
        f"{uuid.uuid4()}."
        f"{extension}"
    )

    s3_client.put_object(
        Bucket=bucket_name,
        Key=s3_key,
        Body=file_bytes
    )

    file_url = (
        f"https://{bucket_name}.s3."
        f"{os.getenv('AWS_REGION')}"
        f".amazonaws.com/"
        f"{s3_key}"
    )

    return file_url
"""S3 helpers. Used only when USE_AWS=true. Keys stay on the server."""

from __future__ import annotations

import os


def _client():
    import boto3

    return boto3.client("s3", region_name=os.getenv("AWS_REGION", "us-west-2"))


def _bucket() -> str:
    bucket = os.getenv("S3_BUCKET", "")
    if not bucket:
        raise RuntimeError("S3_BUCKET is not set")
    return bucket


def upload_fileobj(fileobj, key: str) -> None:
    _client().upload_fileobj(fileobj, _bucket(), key)


def list_prefix(prefix: str) -> list[str]:
    response = _client().list_objects_v2(Bucket=_bucket(), Prefix=prefix)
    return [item["Key"] for item in response.get("Contents") or []]


def generate_presigned_url(key: str, expires_seconds: int = 300) -> str:
    return _client().generate_presigned_url(
        "put_object",
        Params={"Bucket": _bucket(), "Key": key},
        ExpiresIn=expires_seconds,
    )

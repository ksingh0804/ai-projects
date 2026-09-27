"""S3 helpers.

Presigned PUT lets the browser upload straight to the bucket. The backend
creates the URL, so the AWS keys never go to the browser. Expiry is capped
at 5 minutes: a leaked URL dies quickly, and a normal PDF upload finishes
well inside that window.

Local mode does not call this. The API still receives the file and writes
disk, which is easier to test and lets us reject a bad PDF before it is stored.
"""

from __future__ import annotations

from app.storage.local import StoredFile, check_identifier

_CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".csv": "text/csv",
    ".txt": "text/plain",
}


def document_key(project_id: str, filename: str) -> str:
    check_identifier(project_id)
    if "/" in filename or "\\" in filename or ".." in filename.split("."):
        raise ValueError("invalid filename")
    if not filename or filename.startswith("."):
        raise ValueError("invalid filename")
    return f"projects/{project_id}/docs/{filename}"


def presigned_put_url(client, *, bucket: str, key: str, expires_seconds: int = 300) -> str:
    if not 1 <= expires_seconds <= 300:
        raise ValueError("presign expiry must be between 1 and 300 seconds")
    parts = key.split("/")
    if parts[:1] != ["projects"] or ".." in parts or len(parts) < 4:
        raise ValueError("refusing to presign a key outside projects/{id}/docs/")
    return client.generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_seconds,
    )


class S3DocumentStore:
    """Same save/list/read methods as the local store, backed by one bucket."""

    def __init__(self, client, bucket: str) -> None:
        if not bucket:
            raise ValueError("S3 bucket is required")
        self._client = client
        self._bucket = bucket

    def save(self, project_id: str, filename: str, data: bytes) -> StoredFile:
        key = document_key(project_id, filename)
        suffix = "." + filename.lower().rsplit(".", 1)[-1]
        content_type = _CONTENT_TYPES.get(suffix, "application/octet-stream")
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
            ServerSideEncryption="AES256",
        )
        return StoredFile(
            project_id=project_id,
            filename=filename,
            size=len(data),
            content_type=content_type,
            modified=0.0,
        )

    def read(self, project_id: str, filename: str) -> bytes:
        key = document_key(project_id, filename)
        response = self._client.get_object(Bucket=self._bucket, Key=key)
        body = response["Body"].read()
        return bytes(body)

    def delete(self, project_id: str, filename: str) -> None:
        key = document_key(project_id, filename)
        self._client.delete_object(Bucket=self._bucket, Key=key)

    def list_files(self, project_id: str) -> list[StoredFile]:
        prefix = f"projects/{project_id}/docs/"
        objects = _list_objects(self._client, self._bucket, prefix)
        files: list[StoredFile] = []
        for obj in objects:
            filename = obj["Key"][len(prefix) :]
            if not filename or "/" in filename:
                continue
            suffix = "." + filename.lower().rsplit(".", 1)[-1]
            files.append(
                StoredFile(
                    project_id=project_id,
                    filename=filename,
                    size=obj["Size"],
                    content_type=_CONTENT_TYPES.get(suffix, "application/octet-stream"),
                    modified=0.0,
                )
            )
        return sorted(files, key=lambda item: item.filename)

    def list_projects(self) -> list[str]:
        objects = _list_objects(self._client, self._bucket, "projects/")
        projects = set()
        for obj in objects:
            parts = obj["Key"].split("/")
            if len(parts) >= 2 and parts[1]:
                projects.add(parts[1])
        return sorted(projects)


def _list_objects(client, bucket: str, prefix: str) -> list[dict]:
    items: list[dict] = []
    token = None
    while True:
        kwargs = {"Bucket": bucket, "Prefix": prefix}
        if token:
            kwargs["ContinuationToken"] = token
        page = client.list_objects_v2(**kwargs)
        for obj in page.get("Contents") or []:
            items.append({"Key": obj["Key"], "Size": int(obj.get("Size", 0))})
        if not page.get("IsTruncated"):
            break
        token = page.get("NextContinuationToken")
        if not token:
            break
    return sorted(items, key=lambda item: item["Key"])

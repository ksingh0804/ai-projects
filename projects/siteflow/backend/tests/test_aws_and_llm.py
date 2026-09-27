import io
import json

import httpx

from app.agents.llm import (
    BedrockChatModel,
    OllamaChatModel,
    TemplateChatModel,
    claude_messages_body,
    parse_claude_response,
)
from app.aws.dynamo import thread_checkpoint_item
from app.aws.s3 import S3DocumentStore, document_key, presigned_put_url
from app.config import SITEFLOW_ROOT
from app.engine import build_engine
from app.config import Settings
import pytest


class FakeS3:
    def __init__(self, pages=1):
        self.objects = {}
        self.pages = pages

    def put_object(self, Bucket, Key, Body, ContentType, ServerSideEncryption):
        self.objects[(Bucket, Key)] = {
            "Body": Body,
            "ContentType": ContentType,
            "SSE": ServerSideEncryption,
            "Size": len(Body),
        }

    def get_object(self, Bucket, Key):
        return {"Body": io.BytesIO(self.objects[(Bucket, Key)]["Body"])}

    def delete_object(self, Bucket, Key):
        self.objects.pop((Bucket, Key), None)

    def list_objects_v2(self, Bucket, Prefix, ContinuationToken=None):
        keys = [key for (bucket, key) in self.objects if bucket == Bucket and key.startswith(Prefix)]
        keys.sort()
        if self.pages == 2 and ContinuationToken is None and len(keys) > 1:
            return {
                "Contents": [{"Key": keys[0], "Size": self.objects[(Bucket, keys[0])]["Size"]}],
                "IsTruncated": True,
                "NextContinuationToken": "page-2",
            }
        if ContinuationToken == "page-2":
            keys = keys[1:]
        return {
            "Contents": [{"Key": key, "Size": self.objects[(Bucket, key)]["Size"]} for key in keys],
            "IsTruncated": False,
        }

    def generate_presigned_url(self, operation, Params, ExpiresIn):
        return f"https://s3.example/{Params['Bucket']}/{Params['Key']}?exp={ExpiresIn}&op={operation}"


def test_s3_store_round_trip_uses_sse_s3_and_paginates():
    fake = FakeS3(pages=2)
    store = S3DocumentStore(fake, "siteflow-docs-test")
    store.save("demo", "notes.txt", b"hello steel")
    store.save("demo", "other.txt", b"more steel")
    assert fake.objects[("siteflow-docs-test", "projects/demo/docs/notes.txt")]["SSE"] == "AES256"
    listed = store.list_files("demo")
    assert [item.filename for item in listed] == ["notes.txt", "other.txt"]
    assert store.read("demo", "notes.txt") == b"hello steel"
    assert store.list_projects() == ["demo"]
    store.delete("demo", "notes.txt")
    assert [item.filename for item in store.list_files("demo")] == ["other.txt"]


def test_presign_is_capped_at_five_minutes_and_stays_under_the_prefix():
    fake = FakeS3()
    url = presigned_put_url(
        fake,
        bucket="siteflow-docs-test",
        key=document_key("demo", "notes.txt"),
        expires_seconds=300,
    )
    assert "exp=300" in url
    with pytest.raises(ValueError):
        presigned_put_url(fake, bucket="b", key="projects/demo/docs/notes.txt", expires_seconds=301)
    with pytest.raises(ValueError):
        presigned_put_url(fake, bucket="b", key="private/notes.txt", expires_seconds=60)


def test_iam_policy_is_limited_to_one_bucket_prefix():
    policy = json.loads((SITEFLOW_ROOT / "infra" / "iam-siteflow.json").read_text())
    actions = []
    for statement in policy["Statement"]:
        assert statement["Effect"] == "Allow"
        assert statement["Action"] != "*"
        assert statement["Resource"] != "*"
        actions.extend(statement["Action"])
        assert "*" not in statement["Action"]
    assert set(actions) == {"s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"}
    assert "bedrock:" not in json.dumps(policy)
    assert "iam:" not in json.dumps(policy)


def test_use_aws_flag_does_not_silently_open_a_real_client(tmp_path):
    settings = Settings(
        data_dir=tmp_path,
        checkpoint_path=tmp_path / "c.sqlite",
        use_aws=True,
        s3_bucket="siteflow-docs-test",
    )
    with pytest.raises(RuntimeError, match="USE_AWS"):
        build_engine(settings)


def test_claude_body_and_parser_match_the_bedrock_messages_contract():
    body = claude_messages_body(
        [
            {"role": "system", "content": "Use only the draft."},
            {"role": "user", "content": "EOQ is 10."},
        ],
        max_tokens=128,
    )
    assert body["anthropic_version"] == "bedrock-2023-05-31"
    assert body["system"] == "Use only the draft."
    assert body["messages"][0]["content"][0] == {"type": "text", "text": "EOQ is 10."}
    assert parse_claude_response({"content": [{"type": "text", "text": "EOQ is 10."}]}) == "EOQ is 10."


class _BedrockClient:
    def __init__(self):
        self.kwargs = None

    def invoke_model(self, **kwargs):
        self.kwargs = kwargs
        payload = {"content": [{"type": "text", "text": "EOQ is 10."}]}
        return {"body": io.BytesIO(json.dumps(payload).encode())}


def test_bedrock_and_ollama_share_invoke():
    client = _BedrockClient()
    model = BedrockChatModel(client, "anthropic.claude-3-haiku-20240307-v1:0")
    assert model.invoke([{"role": "user", "content": "EOQ is 10."}]) == "EOQ is 10."
    sent = json.loads(client.kwargs["body"])
    assert sent["anthropic_version"] == "bedrock-2023-05-31"
    assert client.kwargs["modelId"].startswith("anthropic.claude")

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/chat"
        body = json.loads(request.content)
        assert body["model"] == "llama3.1:8b"
        assert body["stream"] is False
        return httpx.Response(200, json={"message": {"role": "assistant", "content": "hello"}})

    ollama = OllamaChatModel(
        "llama3.1:8b",
        client=httpx.Client(transport=httpx.MockTransport(handler)),
    )
    assert ollama.invoke([{"role": "user", "content": "hi"}]) == "hello"
    assert TemplateChatModel().invoke([{"role": "user", "content": "draft text"}]) == "draft text"


def test_dynamo_item_uses_thread_id_as_the_partition_key():
    item = thread_checkpoint_item("thread-1", {"route": "spec"}, ttl_epoch=1_700_000_000)
    assert item["thread_id"] == "thread-1"
    assert item["payload"]["route"] == "spec"
    assert item["ttl"] == 1_700_000_000
    with pytest.raises(ValueError):
        thread_checkpoint_item("", {"route": "spec"})

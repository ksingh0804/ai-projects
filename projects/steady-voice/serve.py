#!/usr/bin/env python3
"""Local dev server for Steady — binds 127.0.0.1 for reliable Chrome mic access."""

from __future__ import annotations

import json
import socketserver
import subprocess
import sys
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

PORT = 8788
HOST = "127.0.0.1"
ROOT = Path(__file__).resolve().parent
PROGRESS_MD = ROOT / "PERSONAL-PROGRESS.md"
PROGRESS_JSON = ROOT / "data" / "personal-progress.json"


class ReuseAddrTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


class SteadyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> bytes:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return b""
        # ponytail: 256KB cap keeps local progress POSTs small
        if length > 256_000:
            raise ValueError("body too large")
        return self.rfile.read(length)

    def do_GET(self) -> None:
        host = self.headers.get("Host", "")
        if host.startswith("localhost:") or host == "localhost":
            target = f"http://{HOST}:{PORT}{self.path}"
            self.send_response(301)
            self.send_header("Location", target)
            self.end_headers()
            return

        path = urlparse(self.path).path

        if path == "/reticle-token":
            token_path = Path.home() / ".reticle" / "pairing-token"
            try:
                body = token_path.read_text().strip().encode()
            except OSError:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if path == "/health":
            version = "unknown"
            day = 1
            version_path = ROOT / "version.json"
            if version_path.exists():
                try:
                    data = json.loads(version_path.read_text())
                    version = data.get("version", "unknown")
                    day = data.get("day", 1)
                except (json.JSONDecodeError, OSError):
                    pass
            self._json(
                200,
                {
                    "status": "ok",
                    "version": version,
                    "day": day,
                    "port": PORT,
                    "host": HOST,
                    "app": "steady",
                },
            )
            return

        if path == "/api/progress":
            entries = []
            summary = None
            if PROGRESS_JSON.exists():
                try:
                    data = json.loads(PROGRESS_JSON.read_text())
                    entries = data.get("entries", [])
                    summary = data.get("summary")
                except (json.JSONDecodeError, OSError):
                    pass
            self._json(
                200,
                {
                    "ok": True,
                    "entries": entries[:40],
                    "summary": summary,
                    "file": PROGRESS_MD.name,
                },
            )
            return

        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path != "/api/progress":
            self.send_error(404)
            return
        try:
            raw = self._read_body()
            payload = json.loads(raw.decode() or "{}")
        except (ValueError, json.JSONDecodeError) as exc:
            self._json(400, {"ok": False, "error": str(exc)})
            return

        entry = payload.get("entry")
        markdown = payload.get("markdown")
        summary = payload.get("summary")
        if not isinstance(entry, dict):
            self._json(400, {"ok": False, "error": "missing entry"})
            return

        PROGRESS_JSON.parent.mkdir(parents=True, exist_ok=True)
        entries = []
        if PROGRESS_JSON.exists():
            try:
                existing = json.loads(PROGRESS_JSON.read_text())
                entries = existing.get("entries", [])
            except (json.JSONDecodeError, OSError):
                entries = []

        entries.insert(0, entry)
        entries = entries[:100]
        data = {"entries": entries, "summary": summary, "updatedAt": entry.get("at")}
        PROGRESS_JSON.write_text(json.dumps(data, indent=2) + "\n")

        if isinstance(markdown, str) and markdown.strip():
            PROGRESS_MD.write_text(markdown if markdown.endswith("\n") else markdown + "\n")
        elif not PROGRESS_MD.exists():
            PROGRESS_MD.write_text(
                "# Personal Progress — Steady\n\nComplete a practice round to start live tracking.\n"
            )

        self._json(
            200,
            {
                "ok": True,
                "sessions": len(entries),
                "file": PROGRESS_MD.name,
                "json": str(PROGRESS_JSON.relative_to(ROOT)),
            },
        )

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("Permissions-Policy", "microphone=(self)")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        # Local CSP allows esm.sh for Reticle smoke tests; PRODUCTION.md has the stricter ship CSP.
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self' https://esm.sh; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self' https://esm.sh; "
            "media-src 'self'; "
            "worker-src 'none'; object-src 'none'; base-uri 'self'",
        )
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write(f"[steady] {self.address_string()} - {fmt % args}\n")


def open_chrome(url: str) -> None:
    try:
        subprocess.run(["open", "-a", "Google Chrome", url], check=False)
        print("Opened Google Chrome.")
    except OSError:
        print(f"Open Chrome manually: {url}")


def main() -> None:
    url = f"http://{HOST}:{PORT}/"
    try:
        with ReuseAddrTCPServer((HOST, PORT), SteadyHandler) as httpd:
            print("Steady — a free toolkit for people who stutter")
            print(f"  URL:    {url}")
            print("  Tip:    use wired headphones for the Echo (DAF) tool.")
            print("  Progress file: PERSONAL-PROGRESS.md (live)")
            print("  Stop:   Ctrl+C")
            open_chrome(url)
            httpd.serve_forever()
    except OSError as exc:
        if getattr(exc, "errno", None) == 48:
            print(f"Port {PORT} is already in use. Stop the other server or change PORT in serve.py.")
        else:
            print(f"Server failed: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()

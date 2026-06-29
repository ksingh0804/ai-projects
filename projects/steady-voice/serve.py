#!/usr/bin/env python3
"""Local dev server for Steady — binds 127.0.0.1 for reliable Chrome mic access."""

from __future__ import annotations

import http.server
import socketserver
import subprocess
import sys
from pathlib import Path

PORT = 8788
HOST = "127.0.0.1"
ROOT = Path(__file__).resolve().parent


class SteadyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        host = self.headers.get("Host", "")
        if host.startswith("localhost:") or host == "localhost":
            target = f"http://{HOST}:{PORT}{self.path}"
            self.send_response(301)
            self.send_header("Location", target)
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("Permissions-Policy", "microphone=(self)")
        self.send_header("X-Content-Type-Options", "nosniff")
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
        with socketserver.TCPServer((HOST, PORT), SteadyHandler) as httpd:
            print("Steady — a free toolkit for people who stutter")
            print(f"  URL:    {url}")
            print("  Tip:    use wired headphones for the Echo (DAF) tool.")
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

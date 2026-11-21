from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json
import os
import re
import webbrowser

# This script lives in D:\\YouTube_Archive\\Preview. Serve the archive root so
# relative paths such as videos/... and transcripts-readable-v7/... still work.
ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)


class ArchiveHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".vtt": "text/vtt; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mkv": "video/x-matroska",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".m4v": "video/mp4",
    }

    def do_GET(self):
        # Serve Preview/archive.html at the clean root URL while keeping the
        # browser URL at / so the archive's existing relative paths still work.
        if urlsplit(self.path).path == "/__status":
            return self.serve_status()
        if urlsplit(self.path).path in ("", "/"):
            self.path = "/Preview/archive.html"
        super().do_GET()

    def serve_status(self):
        videos_dir = ROOT / "videos"
        if videos_dir.is_dir():
            try:
                count = sum(1 for _ in videos_dir.iterdir())
            except OSError:
                count = -1
            payload = {"videos_exists": True, "videos_count": count}
        else:
            payload = {"videos_exists": False, "videos_count": 0}
        # Lets the page enable the Listen control only when a licensed recording is present.
        payload["recitation"] = (
            ROOT / "Preview" / "assets" / "recitation.mp3"
        ).is_file()
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_HEAD(self):
        if urlsplit(self.path).path in ("", "/"):
            self.path = "/Preview/archive.html"
        super().do_HEAD()

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    # Deliberately use SimpleHTTPRequestHandler's original raw-file serving
    # path, matching the v15 server. Do not decode, repair, or rewrite transcript
    # bytes; the original transcript files remain unchanged.
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        range_header = self.headers.get("Range")
        if range_header:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
            if not match or (not match.group(1) and not match.group(2)):
                f.close()
                self.send_error(416, "Invalid byte range")
                return None

            if not match.group(1):
                length = int(match.group(2))
                start = max(0, size - length)
                end = size - 1
            else:
                start = int(match.group(1))
                end = int(match.group(2)) if match.group(2) else size - 1

            if start >= size or start > end:
                f.close()
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None

            end = min(end, size - 1)
            length = end - start + 1
            f.seek(start)
            self._range_remaining = length
            self.send_response(206)
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.send_header("Content-Length", str(length))
            self.end_headers()
            return f

        self._range_remaining = None
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Length", str(size))
        self.end_headers()
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


try:
    server = ThreadingHTTPServer(("127.0.0.1", 8765), ArchiveHandler)
except OSError:
    # If port 8765 is occupied, let Windows choose an available local port.
    server = ThreadingHTTPServer(("127.0.0.1", 0), ArchiveHandler)

url = f"http://127.0.0.1:{server.server_address[1]}/"
videos_dir = ROOT / "videos"
if videos_dir.is_dir():
    try:
        n = sum(1 for _ in videos_dir.iterdir())
    except OSError:
        n = -1
    print(f"Archive media folder found: {videos_dir} ({n} entries)", flush=True)
else:
    print(
        f"WARNING: videos folder not found at {videos_dir}. Videos will not play until the app runs from the archive root.",
        flush=True,
    )
print(f"Archive is running locally at: {url}", flush=True)
print(
    "Preview page: Preview/archive.html. Transcript files are served unchanged.",
    flush=True,
)
print("This server listens only on this computer. Press Ctrl+C to stop it.", flush=True)
try:
    webbrowser.open(url)
    server.serve_forever()
except KeyboardInterrupt:
    print("\nLocal archive server stopped.", flush=True)
finally:
    server.server_close()

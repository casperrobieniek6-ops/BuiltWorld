"""Embed the existing browser build in the Sites Worker deployment."""
import json
import mimetypes
from pathlib import Path

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
web = dist if (dist / "index.html").is_file() else root
assets = {}
candidates = [*web.glob("*"), *(web / "globe").rglob("*"), *(web / "photos").rglob("*")]
for path in sorted(candidates):
    relative = path.relative_to(web)
    if not path.is_file() or (len(relative.parts) == 1 and path.suffix not in {".html", ".css", ".js", ".mjs"}):
        continue
    mime = mimetypes.guess_type(path.name)[0] or ""
    if mime.startswith("text/") or path.suffix in {".js", ".mjs"}:
        assets["/" + relative.as_posix()] = [mime + "; charset=utf-8", path.read_text(encoding="utf-8")]
    elif mime.startswith("image/"):
        assets["/" + relative.as_posix()] = [mime, list(path.read_bytes())]
target = dist / "server/index.js"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text("const ASSETS = " + json.dumps(assets, ensure_ascii=True, separators=(",", ":")) + ";\n" +
                  (root / "worker/index.mjs").read_text(encoding="utf-8"), encoding="utf-8")

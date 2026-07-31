from __future__ import annotations

import json
import base64
import hashlib
import hmac
import os
import re
import secrets
import shutil
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Annotated
from urllib.parse import urlencode

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from PIL import Image, ImageOps
from pydantic import BaseModel

try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except Exception:
    pass


APP_DIR = Path(__file__).resolve().parents[1]
DEFAULT_REPO_ROOT = APP_DIR.parent

REPO_ROOT = Path(os.getenv("BLOG_REPO_ROOT", str(DEFAULT_REPO_ROOT))).resolve()
DATA_FILE = REPO_ROOT / "docs" / ".vitepress" / "data" / "life-posts.json"
PUBLIC_LIFE_DIR = REPO_ROOT / "docs" / "public" / "life"
PUBLIC_VIDEO_DIR = PUBLIC_LIFE_DIR / "videos"
ADMIN_PASSWORD = os.getenv("BLOG_ADMIN_PASSWORD", os.getenv("LIFE_PUBLISH_SECRET", ""))
GIT_REMOTE = os.getenv("BLOG_GIT_REMOTE", "origin")
GIT_BRANCH = os.getenv("BLOG_GIT_BRANCH", "")
AUTHOR_NAME = os.getenv("BLOG_COMMIT_AUTHOR_NAME", "wie0 bot")
AUTHOR_EMAIL = os.getenv("BLOG_COMMIT_AUTHOR_EMAIL", "wie0-bot@example.local")
AUTO_COMMIT = os.getenv("BLOG_AUTO_COMMIT", "false").lower() == "true"
AUTO_PUSH = os.getenv("BLOG_AUTO_PUSH", "false").lower() == "true"
GITHUB_CLIENT_ID = os.getenv("BLOG_ADMIN_GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("BLOG_ADMIN_GITHUB_CLIENT_SECRET", "")
GITHUB_ALLOWED_USERS = {
    user.strip().lower()
    for user in os.getenv("BLOG_ADMIN_GITHUB_USERS", "").split(",")
    if user.strip()
}
SESSION_SECRET = os.getenv("BLOG_ADMIN_SESSION_SECRET", ADMIN_PASSWORD or GITHUB_CLIENT_SECRET)
PUBLIC_URL = os.getenv("BLOG_ADMIN_PUBLIC_URL", "").rstrip("/")
COOKIE_SECURE = os.getenv(
    "BLOG_ADMIN_COOKIE_SECURE",
    "true" if PUBLIC_URL.startswith("https://") else "false",
).lower() != "false"
SESSION_COOKIE = "wie0_admin_session"
STATE_COOKIE = "wie0_admin_oauth_state"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm"}


app = FastAPI(title="wie0 blog admin api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "BLOG_ADMIN_ORIGINS",
        "http://127.0.0.1:5178,http://127.0.0.1:5180,http://localhost:5178,http://localhost:5180,https://wie0.com,http://wie0.com",
    ).split(","),
    allow_methods=["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)


@dataclass(frozen=True)
class SavedAsset:
    type: str
    src: str
    alt: str | None = None


class LifePostUpdate(BaseModel):
    date: str
    time: str | None = ""
    text: list[str]


def require_password(password: str) -> None:
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=500, detail="Server admin password is not configured")

    if not secrets.compare_digest(password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid password")


def oauth_enabled() -> bool:
    return bool(GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET and GITHUB_ALLOWED_USERS)


def sign_session(method: str, user: str) -> str:
    if not SESSION_SECRET:
        raise HTTPException(status_code=500, detail="Server session secret is not configured")

    payload = json.dumps({"method": method, "user": user}, separators=(",", ":")).encode("utf-8")
    encoded = base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")
    signature = hmac.new(SESSION_SECRET.encode("utf-8"), encoded.encode("ascii"), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"


def read_session(request: Request) -> dict | None:
    token = request.cookies.get(SESSION_COOKIE, "")
    if "." not in token or not SESSION_SECRET:
        return None

    encoded, signature = token.rsplit(".", 1)
    expected = hmac.new(SESSION_SECRET.encode("utf-8"), encoded.encode("ascii"), hashlib.sha256).hexdigest()
    if not secrets.compare_digest(signature, expected):
        return None

    try:
        payload = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
        data = json.loads(payload)
    except Exception:
        return None

    method = str(data.get("method", ""))
    username = str(data.get("user", "")).lower()

    if method == "password":
        return {"method": method, "user": username or "wie0"}

    if method == "github" and username in GITHUB_ALLOWED_USERS:
        return {"method": method, "user": username}

    return None


def require_admin_session(request: Request) -> dict:
    session = read_session(request)
    if not session:
        raise HTTPException(status_code=401, detail="Admin session is required")
    return session


def require_oauth_session(request: Request) -> None:
    if not oauth_enabled():
        return

    session = read_session(request)
    if not session or session.get("method") != "github":
        raise HTTPException(status_code=401, detail="GitHub login is required")


def validate_date(value: str) -> str:
    try:
        return datetime.strptime(value, "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date") from exc


def validate_time(value: str) -> str:
    if not re.fullmatch(r"\d{2}:\d{2}", value):
        raise HTTPException(status_code=400, detail="Invalid time")
    hour, minute = [int(part) for part in value.split(":")]
    if hour > 23 or minute > 59:
        raise HTTPException(status_code=400, detail="Invalid time")
    return value


def normalize_text(value: str) -> list[str]:
    lines = [line.rstrip() for line in value.replace("\r\n", "\n").split("\n")]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    if not lines:
        raise HTTPException(status_code=400, detail="Text is required")
    return lines


def load_posts() -> list[dict]:
    if not DATA_FILE.exists():
        return []

    with DATA_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise HTTPException(status_code=500, detail="life-posts.json must be a list")
    return data


def write_posts(posts: list[dict]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(posts, file, ensure_ascii=False, indent=2)
        file.write("\n")


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr.strip() or result.stdout.strip())
    return result.stdout.strip()


def current_branch() -> str:
    if GIT_BRANCH:
        return GIT_BRANCH
    branch = git("branch", "--show-current")
    return branch or "main"


def commit_and_push(paths: list[Path], post_id: str, action: str = "publish") -> None:
    if not AUTO_COMMIT:
        return

    relative_paths = [str(path.relative_to(REPO_ROOT)) for path in paths]
    git("add", *relative_paths)

    staged = git("diff", "--cached", "--name-only", "--", *relative_paths)
    if not staged:
        return

    env = os.environ.copy()
    env.update({
        "GIT_AUTHOR_NAME": AUTHOR_NAME,
        "GIT_AUTHOR_EMAIL": AUTHOR_EMAIL,
        "GIT_COMMITTER_NAME": AUTHOR_NAME,
        "GIT_COMMITTER_EMAIL": AUTHOR_EMAIL,
    })
    result = subprocess.run(
        ["git", "commit", "--only", "-m", f"docs: {action} life post {post_id}", "--", *relative_paths],
        cwd=REPO_ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
    )
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr.strip() or result.stdout.strip())

    if AUTO_PUSH:
        git("push", GIT_REMOTE, current_branch())


def normalize_text_lines(lines: list[str]) -> list[str]:
    normalized = [str(line).rstrip() for line in lines]
    while normalized and not normalized[0]:
        normalized.pop(0)
    while normalized and not normalized[-1]:
        normalized.pop()
    if not normalized:
        raise HTTPException(status_code=400, detail="Text is required")
    return normalized


def find_post_index(posts: list[dict], post_id: str) -> int:
    for index, post in enumerate(posts):
        if post.get("id") == post_id:
            return index
    raise HTTPException(status_code=404, detail="Post not found")


def clean_stem(filename: str) -> str:
    stem = Path(filename).stem.lower()
    stem = re.sub(r"[^a-z0-9\u4e00-\u9fff-]+", "-", stem).strip("-")
    return stem[:48] or "asset"


def unique_path(directory: Path, base_name: str, extension: str) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    candidate = directory / f"{base_name}{extension}"
    index = 2
    while candidate.exists():
        candidate = directory / f"{base_name}-{index}{extension}"
        index += 1
    return candidate


def convert_image_with_sips(source: Path, target: Path) -> bool:
    sips = shutil.which("sips")
    if not sips:
        return False

    result = subprocess.run(
        [sips, "-s", "format", "jpeg", "-Z", "1800", str(source), "--out", str(target)],
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.returncode == 0 and target.exists()


async def save_image(upload: UploadFile, post_id: str, order: int) -> SavedAsset:
    filename = upload.filename or f"image-{order}"
    ext = Path(filename).suffix.lower()
    if ext not in IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {filename}")

    target = unique_path(PUBLIC_LIFE_DIR, f"{post_id}-{order}-{clean_stem(filename)}", ".jpg")
    temp = target.with_suffix(f".upload{ext or '.bin'}")
    with temp.open("wb") as file:
        shutil.copyfileobj(upload.file, file)

    try:
        with Image.open(temp) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
            image.save(target, format="JPEG", quality=86, optimize=True)
    except Exception as exc:
        if not convert_image_with_sips(temp, target):
            raise HTTPException(status_code=400, detail=f"Cannot process image: {filename}") from exc
    finally:
        temp.unlink(missing_ok=True)

    return SavedAsset(type="image", src=f"/life/{target.name}", alt=Path(filename).stem)


async def save_video(upload: UploadFile, post_id: str, order: int) -> SavedAsset:
    filename = upload.filename or f"video-{order}"
    ext = Path(filename).suffix.lower()
    if ext not in VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported video type: {filename}")

    target = unique_path(PUBLIC_VIDEO_DIR, f"{post_id}-{order}-{clean_stem(filename)}", ext)
    with target.open("wb") as file:
        shutil.copyfileobj(upload.file, file)

    return SavedAsset(type="video", src=f"/life/videos/{target.name}", alt=Path(filename).stem)


async def save_assets(files: list[UploadFile], post_id: str) -> tuple[list[dict], list[dict], list[Path]]:
    images: list[dict] = []
    videos: list[dict] = []
    paths: list[Path] = []

    for index, upload in enumerate(files, start=1):
        filename = upload.filename or ""
        content_type = upload.content_type or ""
        ext = Path(filename).suffix.lower()

        if content_type.startswith("video/") or ext in VIDEO_EXTENSIONS:
            saved = await save_video(upload, post_id, index)
            videos.append({"src": saved.src, "title": saved.alt})
            paths.append(REPO_ROOT / "docs" / "public" / saved.src.lstrip("/"))
        else:
            saved = await save_image(upload, post_id, index)
            images.append({"src": saved.src, "alt": saved.alt})
            paths.append(REPO_ROOT / "docs" / "public" / saved.src.lstrip("/"))

    return images, videos, paths


@app.get("/api/admin/health")
def health() -> dict[str, str]:
    return {"status": "ok", "autoCommit": str(AUTO_COMMIT).lower(), "autoPush": str(AUTO_PUSH).lower()}


@app.get("/api/admin/auth/me")
def auth_me(request: Request) -> dict[str, object]:
    session = read_session(request)
    return {
        "oauthEnabled": oauth_enabled(),
        "authenticated": bool(session),
        "user": session.get("user") if session else None,
        "method": session.get("method") if session else None,
    }


@app.post("/api/admin/auth/login")
def login(password: Annotated[str, Form()]) -> JSONResponse:
    require_password(password)
    response = JSONResponse({"message": "已进入控制台", "user": "wie0", "method": "password"})
    response.set_cookie(
        SESSION_COOKIE,
        sign_session("password", "wie0"),
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )
    return response


@app.get("/api/admin/auth/github/login")
def github_login() -> RedirectResponse:
    if not oauth_enabled():
        raise HTTPException(status_code=404, detail="GitHub OAuth is not configured")

    state = secrets.token_urlsafe(24)
    redirect_uri = f"{PUBLIC_URL}/api/admin/auth/github/callback" if PUBLIC_URL else "/api/admin/auth/github/callback"
    url = "https://github.com/login/oauth/authorize?" + urlencode({
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user",
        "state": state,
    })
    redirect = RedirectResponse(url)
    redirect.set_cookie(STATE_COOKIE, state, httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=600)
    return redirect


@app.get("/api/admin/auth/github/callback")
async def github_callback(request: Request, code: str, state: str) -> RedirectResponse:
    if not oauth_enabled():
        raise HTTPException(status_code=404, detail="GitHub OAuth is not configured")

    expected_state = request.cookies.get(STATE_COOKIE, "")
    if not expected_state or not secrets.compare_digest(state, expected_state):
        raise HTTPException(status_code=401, detail="Invalid OAuth state")

    redirect_uri = f"{PUBLIC_URL}/api/admin/auth/github/callback" if PUBLIC_URL else None
    token_payload = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
    }
    if redirect_uri:
        token_payload["redirect_uri"] = redirect_uri

    async with httpx.AsyncClient(timeout=10) as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data=token_payload,
            headers={"Accept": "application/json"},
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="GitHub token exchange failed")

        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
        )
        user_data = user_response.json()

    username = str(user_data.get("login", "")).lower()
    if username not in GITHUB_ALLOWED_USERS:
        raise HTTPException(status_code=403, detail="GitHub user is not allowed")

    redirect = RedirectResponse("/admin/")
    redirect.set_cookie(SESSION_COOKIE, sign_session("github", username), httponly=True, secure=COOKIE_SECURE, samesite="lax", max_age=60 * 60 * 24 * 30)
    redirect.delete_cookie(STATE_COOKIE)
    return redirect


@app.post("/api/admin/auth/logout")
def logout() -> Response:
    response = Response(status_code=204)
    response.delete_cookie(SESSION_COOKIE)
    return response


@app.post("/api/admin/life/posts")
async def publish_life_post(
    request: Request,
    date: Annotated[str, Form()],
    time: Annotated[str, Form()],
    text: Annotated[str, Form()],
    files: Annotated[list[UploadFile] | None, File()] = None,
) -> dict[str, str]:
    require_admin_session(request)
    post_date = validate_date(date)
    post_time = validate_time(time)
    lines = normalize_text(text)
    post_id = f"{post_date.replace('-', '')}-{post_time.replace(':', '')}"

    posts = load_posts()
    if any(post.get("id") == post_id for post in posts):
        post_id = f"{post_id}-{len(posts) + 1}"

    images, videos, changed_paths = await save_assets(files or [], post_id)
    post: dict = {
        "id": post_id,
        "date": post_date,
        "time": post_time,
        "text": lines,
    }
    if images:
        post["images"] = images
    if videos:
        post["videos"] = videos

    posts.insert(0, post)
    write_posts(posts)
    changed_paths.append(DATA_FILE)
    commit_and_push(changed_paths, post_id, "publish")

    return {"message": "已发布，GitHub Actions 会继续部署。", "id": post_id}


@app.get("/api/admin/life/posts")
def list_life_posts(request: Request) -> dict[str, list[dict]]:
    require_admin_session(request)
    return {"posts": load_posts()}


@app.patch("/api/admin/life/posts/{post_id}")
def update_life_post(request: Request, post_id: str, payload: LifePostUpdate) -> dict[str, str]:
    require_admin_session(request)
    posts = load_posts()
    index = find_post_index(posts, post_id)
    post = posts[index]

    post["date"] = validate_date(payload.date)
    post["time"] = validate_time(payload.time or "00:00") if payload.time else ""
    post["text"] = normalize_text_lines(payload.text)
    posts[index] = post

    write_posts(posts)
    commit_and_push([DATA_FILE], post_id, "update")
    return {"message": "已保存", "id": post_id}


@app.delete("/api/admin/life/posts/{post_id}")
def delete_life_post(request: Request, post_id: str) -> dict[str, str]:
    require_admin_session(request)
    posts = load_posts()
    index = find_post_index(posts, post_id)
    posts.pop(index)

    write_posts(posts)
    commit_and_push([DATA_FILE], post_id, "delete")
    return {"message": "已从页面移除", "id": post_id}

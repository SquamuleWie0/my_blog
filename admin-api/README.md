# Blog Admin API

Private admin service for the life feed.

## Run Locally

```bash
cd admin-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
BLOG_ADMIN_PASSWORD='change-me' BLOG_REPO_ROOT='/Users/wie0/my_blog/vitepress' uvicorn app.main:app --reload --port 8787
```

The VitePress admin page uses `/api/admin` by default. In local development, proxy that path to `http://127.0.0.1:8787`, or open `/admin/?debug=1` and set the API field to `http://127.0.0.1:8787/api/admin`.

Normal use:

1. Open `/admin/`.
2. Enter `BLOG_ADMIN_PASSWORD` once to enter the console.
3. Publish, edit, or remove life posts without re-entering the password until the session cookie expires.

The first management version edits `docs/.vitepress/data/life-posts.json`. Deleting a post removes it from the page data but keeps uploaded media files on disk, so accidental deletes do not immediately destroy assets.

Live Photo can be represented as a photo plus its paired short video in the same post. The API stores them as normal image/video assets instead of trying to preserve Apple's private Live Photo container.

## Required Environment

- `BLOG_ADMIN_PASSWORD`: admin login password. Required. `LIFE_PUBLISH_SECRET` is still accepted as a backward-compatible fallback.
- `BLOG_REPO_ROOT`: path to this repository. Defaults to the parent of `admin-api`.

## Optional Environment

- `BLOG_GIT_REMOTE`: remote name for push. Defaults to `origin`.
- `BLOG_GIT_BRANCH`: branch name. Defaults to current branch, then `main`.
- `BLOG_COMMIT_AUTHOR_NAME`: commit author name. Defaults to `wie0 bot`.
- `BLOG_COMMIT_AUTHOR_EMAIL`: commit author email. Defaults to `wie0-bot@example.local`.
- `BLOG_AUTO_COMMIT`: set to `true` to commit admin changes. Defaults to `false` for local safety.
- `BLOG_AUTO_PUSH`: set to `true` to push committed admin changes. Defaults to `false`.

## Optional GitHub OAuth

Password login is the primary flow. GitHub OAuth can be added later as an optional login method with:

- `BLOG_ADMIN_GITHUB_CLIENT_ID`
- `BLOG_ADMIN_GITHUB_CLIENT_SECRET`
- `BLOG_ADMIN_GITHUB_USERS`: comma-separated GitHub usernames allowed to publish.
- `BLOG_ADMIN_SESSION_SECRET`: cookie signing secret. Defaults to `BLOG_ADMIN_PASSWORD`.
- `BLOG_ADMIN_PUBLIC_URL`: public origin for OAuth callback, for example `https://wie0.com`.
- `BLOG_ADMIN_COOKIE_SECURE`: set to `false` only when serving the admin API over plain HTTP.

HEIC/HEIF upload is supported when Pillow can decode it. On macOS, the API also falls back to `sips` for conversion. On Linux servers, install HEIC support separately if direct HEIC uploads are required.

## Nginx Sketch

```nginx
location /api/admin/ {
  proxy_pass http://127.0.0.1:8787/api/admin/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Keep `/admin/` unlisted in the site navigation. Security is enforced by the API password and session cookie, not by hiding the URL.

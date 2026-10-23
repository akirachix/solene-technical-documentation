---
title: Security
description: Canopy's authentication, authorization, data protection, and controls.
status: draft
evidence:
  - core/security.py
  - core/dependencies.py
  - core/client_ip.py
  - services/auth_service.py
  - services/errors.py
  - services/security_headers.py
  - services/observation_image_service.py
  - main.py
---
# Security

CANOPY holds individual gorilla health records, case decisions, staff accounts and field locations. Precise gorilla locations are treated as Highly Restricted because their disclosure could create a poaching risk. This page describes the controls the backend enforces today and how they map to the target security architecture.

Every rule on this page is enforced by the FastAPI backend. The web portal and the mobile app only hide screens; they are never the security boundary.

## Security architecture

The architecture splits the platform into six trust zones: device (untrusted), edge (semi-trusted), application (trusted), data (highly trusted), integration (untrusted) and pipeline (trusted, ephemeral). Data moves only from a less trusted zone to a more trusted one through a checked boundary.

<ImageZoom src="/security-architecture.png" alt="CANOPY platform security architecture" />

Editable diagram: [Solene security SAD in Figma](https://www.figma.com/design/dZb34vBkAi9sDIIHt7wejz/Solene-security-SAD?node-id=39-3472&t=MYZExHqJdXE3jrgI-1)

The diagram shows the target design. Some parts are not built yet (Keycloak, Cloudflare, MinIO, the media pipeline, the SIEM). The status of each control is in the table below.

### Status of controls

| Area                 | Control                                                                             | Status                          |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| Authentication       | Argon2 passwords, emailed 6-digit login code, 30-minute JWT                         | Implemented                     |
| Authentication       | Lockout and per-IP limit stored in Redis, login code caps                           | Implemented (SOL-421)           |
| Authentication       | Keycloak (OIDC), refresh tokens, device binding, PIN unlock                         | Planned                         |
| Authorization        | Role checks on the server, object-level checks for trackers                         | Implemented                     |
| Authorization        | Login required on every endpoint                                                    | In progress (endpoint securing) |
| Authorization        | PostgreSQL row-level security                                                       | Planned / to confirm            |
| Data protection      | TLS with HSTS and HTTPS redirect                                                    | Implemented (SOL-421)           |
| Data protection      | Generic push text, grid cells instead of raw GPS on observations                    | Implemented                     |
| Data protection      | Backup database on Supabase                                                         | Implemented                     |
| Data protection      | EXIF/GPS stripping of photos                                                        | Planned (gap)                   |
| Application security | Strict schemas, request size limits, safe errors, security headers, CORS allow-list | Implemented (SOL-421)           |
| Audit                | Platform-wide audit log with a hash chain                                           | Implemented                     |
| AI                   | Output validation, safety filters, per-user rate limit                              | Implemented                     |
| AI                   | Pseudonymised AI gateway                                                            | Planned                         |
| Monitoring           | SIEM and security alerts                                                            | Planned                         |

## Authentication

There is no self sign-up. A single administrator is created with `POST /auth/invite-admin` and the `ADMIN_INVITE_KEY` header (the endpoint returns 404 when the key is not set). The administrator invites doctors and trackers, who set their own password from an emailed link.

**Passwords.** Passwords are hashed with Argon2. When an email is unknown, a dummy hash is still checked so the response time does not reveal which accounts exist.

**Two-step login.** Every login is a password followed by a 6-digit code sent by email, which acts as the second factor.

1. `POST /auth/login` checks the password and emails a code. The code is stored in Redis as an HMAC, never in plain text, and expires after 5 minutes.
2. `POST /auth/verify-otp` compares the code in constant time and returns an access token.

**Limits against guessing and credential stuffing.**

| Limit           | Rule                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Account lockout | 5 failed logins lock the account for 15 minutes                                                                 |
| Per-IP limit    | 30 failed attempts per 15 minutes per IP address                                                                |
| Login codes     | At most 3 codes per user per 15 minutes; 5 wrong guesses delete the code                                        |
| Guess counting  | A guess is counted before the code is compared, so new codes or parallel requests cannot give unlimited guesses |

Lockouts are kept in Redis, so they survive restarts and deploys and are shared by every worker. The client IP is read from the last entry of Heroku's `X-Forwarded-For` header, so entries added by the client are ignored.

**Tokens.** Access tokens are JWTs signed with HS256, valid for 30 minutes, and carry a `type` claim. Invite and reset links are a separate token type that carries a fingerprint of the current password hash, so a link stops working as soon as it is used. Every token is checked for its signature, expiry, required claims and type:

`core/security.py`

```python
def _decode(
    token: str, expected_type: str, extra_required: list[str] | None = None
) -> dict:
    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        options={"require_sub": True, "require_iat": True, "require_exp": True},
    )
    for claim in ["type", *(extra_required or [])]:
        if claim not in payload:
            raise JWTError(f"Missing claim: {claim}")
    if payload["type"] != expected_type:
        raise JWTError("Wrong token type")
    return payload
```

`SECRET_KEY` must be at least 32 characters, or the app refuses to start.

**Mobile app.** The mobile app sends `app: "mobile"` at login, and only trackers are accepted there.

**Test tracker account.** Emails listed in `OTP_BYPASS_EMAILS` receive a token directly from `/auth/login`, only on mobile and only for the tracker role. The password check, lockout and IP limits still apply. The variable must stay empty in normal use.

**Ending access.** Deactivating a user blocks every request from them at once, because each request reloads the user and rejects inactive accounts. Their push device tokens are deleted.

Planned: Keycloak as the identity provider (OIDC), refresh token rotation, session revocation per device, device binding and a throttled PIN for field phones.

## Authorization

Authorization is checked on the server for every protected request, in three layers.

1. **Signed in.** `get_authenticated_user` rejects a missing, invalid, expired or wrong-type token and inactive users with 401. `get_current_user` blocks accounts that still have to change their password (403).
2. **Role.** `require_roles(...)` returns 403 when the caller's role is not allowed.
3. **Object.** Services check ownership of the record itself.

| Role                | Can do                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin`           | Invite, edit and deactivate doctor and tracker accounts                                                                                     |
| `gorilla_doctor`  | Register gorillas and groups, open and manage health cases, link observations, create and cancel follow-up tasks, review AI recommendations |
| `gorilla_tracker` | Log observations, see and edit their own observations until they are linked to a case, accept and submit their own follow-up tasks          |

Object-level rules:

- Trackers only see their own observations and their own follow-up tasks. Another person's record returns 404 rather than 403, so trackers cannot probe which IDs exist.
- Only the assigned tracker can accept or submit a task.
- An observation is locked once a vet links it to a case.
- Every user only sees their own notifications and device tokens.

**Endpoint securing (in progress).** Every endpoint is being reviewed so that each requires a login and the correct role. Known open items:

- `/disease-predictions/*` and `/api/v1/locations` do not require a login yet (gaps G-01, G-02).
- The `HEALTH_READERS` role set includes `admin`, so admins can currently read health cases and predictions. This breaks the rule that admins see no clinical data.

**Row-level security.** PostgreSQL row-level security is the planned second layer, starting with observations, follow-up tasks, notifications and device tokens, and health cases. It will enforce the same ownership rules inside the database, so a missed check in the API cannot expose another user's rows.

## Data Protection

**In transit.** Heroku terminates TLS. The backend adds `Strict-Transport-Security` and sends a 308 redirect to `https://` when a request arrives over plain HTTP (`X-Forwarded-Proto: http`). Locally, where that header is absent, there is no redirect.

**At rest.** The database runs on Heroku Postgres. Photos are stored in the database with a SHA-256 hash, and are never included in list responses. Responses carry `Cache-Control: no-store`, so browsers and proxies do not keep copies of clinical data.

**Locations.** The mobile app sends the phone's position to `POST /api/v1/locations`, which returns the park grid cell. Observations store the `grid_id`, not raw coordinates.

**Notifications.** Push messages use generic text such as "You have a follow-up due today". Case numbers, gorilla names, diagnoses and locations stay inside the signed-in apps. The push data carries only `notification_id` and `event_type`.

**Least data in responses.** Password hashes and tokens are never returned. Validation errors (422) no longer echo the submitted input.

**Backup.** A backup copy of the database is kept on Supabase, separate from the Heroku database.

> To complete: backup schedule, retention, encryption, who can restore, and the last tested restore.

**Audit log.** Important changes are written to a platform-wide audit log. Each entry is chained to the previous one with a hash, so any edit or deletion of an earlier entry breaks the chain and can be detected.

> To complete from the audit PR: table name and columns, the list of logged actions, how the hash is computed, how and when the chain is verified, and who can read the log.

**Gaps.** Photos are stored as uploaded, so EXIF metadata, including GPS position if the phone recorded it, is kept. Metadata stripping is planned in the media pipeline. The offline queue on the phone is protected by the app sandbox but not encrypted by the app (see the Mobile section).

## Application Security

**Input validation.** Every request body is validated by a Pydantic schema. Create and update schemas reject unknown fields (`extra="forbid"`, 422). A PATCH cannot set a required field to null.

**Request size limits.**

| Body             | Limit                        | Error |
| ---------------- | ---------------------------- | ----- |
| JSON             | 1 MB (`MAX_BODY_BYTES`)    | 413   |
| Multipart upload | 12 MB (`MAX_UPLOAD_BYTES`) | 413   |
| One photo        | 5 MB                         | 413   |

The limit also applies to chunked bodies that send no `Content-Length`.

**Photo uploads.** The file type is decided from the file's first bytes, not from its name or the header the client sends. Only JPEG and PNG are accepted.

`services/observation_image_service.py`

```python
MAX_IMAGE_BYTES = 5 * 1024 * 1024
TOO_LARGE = 413

SIGNATURES = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
}


def read_image(upload: UploadFile | None) -> dict | None:
    if upload is None:
        return None

    data = upload.file.read(MAX_IMAGE_BYTES + 1)
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The image file is empty.")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            TOO_LARGE, "The image is larger than 5 MB. Please send a smaller photo."
        )

    content_type = detect_content_type(data)
    if content_type is None:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            "Only JPEG and PNG images are accepted.",
        )

    return {
        "content_type": content_type,
        "size_bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "data": data,
    }


def detect_content_type(data: bytes) -> str | None:
    for content_type, signature in SIGNATURES.items():
        if data.startswith(signature):
            return content_type
    return None
```

**Safe errors.** An unexpected error returns a generic 500 with an `error_id`. The same `error_id` is written to the log with the details, so support can find the cause without the client ever seeing a stack trace, SQL or configuration.

**Security headers.** Every response carries:

| Header                        | Value           | Purpose                           |
| ----------------------------- | --------------- | --------------------------------- |
| `Strict-Transport-Security` | set             | Browsers use HTTPS only           |
| `Cache-Control`             | `no-store`    | No cached copies of clinical data |
| `X-Content-Type-Options`    | `nosniff`     | No content-type guessing          |
| `X-Frame-Options`           | `DENY`        | The API cannot be framed          |
| `Referrer-Policy`           | `no-referrer` | No URLs leaked to other sites     |

**CORS.** Allowed origins come from `ALLOWED_ORIGINS`, a comma-separated list of the web app URLs. `*` is refused. Credentials are off, because the web app calls the API from the same origin through its server and sends Bearer tokens. Methods and headers are limited to those the API uses.

**State changes.** Case status moves, task status moves and observation locking follow fixed rules on the server, so a client cannot force a record into a state it should not reach.

**Secrets.** Secrets live only in Heroku config vars and local `.env` files, never in Git. A key that has been exposed is revoked in its console and replaced, not just removed from the repository.

**Secure development.** All work reaches `main` through reviewed pull requests into `develop`; merging `main` deploys to Heroku. Before a pull request, `ruff` and the full `pytest` suite must pass. The suite covers refused paths as well as allowed ones: wrong role (403), other people's records (404), invalid states (409), lockouts, the IP limit with faked `X-Forwarded-For`, 413 limits, safe 500s and the security headers.

Planned: Cloudflare as reverse proxy and WAF in front of the API, CI with dependency audit, secret scanning (Gitleaks) and static analysis, and an idempotency key for observation uploads so retries from the offline queue cannot create duplicates (G-21).

## Integrations

Every outside service is treated as untrusted. Only the backend talks to them, and the API keeps working when one is missing: its feature returns 503 or is skipped.

| Service                  | What is sent                                        | Controls                                                                                                                                         |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| SMTP email               | Invite links, login codes, reset links              | Sent over TLS (STARTTLS or port 465); if sending fails, the login code is deleted and 502 is returned                                            |
| Upstash Redis            | Hashed login codes, lockout and rate-limit counters | Accessed over HTTPS with a token; no clinical data; login returns 503 if Redis is unavailable                                                    |
| Firebase Cloud Messaging | Generic notification text and IDs                   | Google service account kept in config vars; dead device tokens are removed                                                                       |
| Open-Meteo               | Grid cell coordinates                               | Called only when an admin triggers collection; no user or clinical data is sent                                                                  |
| Google Gemini            | Case evidence for predictions and chatbot questions | API key in a header, HTTPS only, 120-second timeout, 5 MB response cap, per-user rate limit of 10 requests per minute (429 with `Retry-After`) |

**AI output is untrusted.** Every prediction is checked before it is saved: its evidence references must exist, its text must cite the data it uses, and its sources must be papers File Search actually returned. Wording about doses, certain diagnoses, treatment, invasive procedures, handling gorillas, short distances or blaming people is removed. Probabilities are capped because there is no laboratory result. Predictions are advisory and are never a diagnosis; a veterinarian decides. Details are in the [AI section](./ai).

Planned: an AI gateway that pseudonymises gorilla and staff identifiers and strips precise locations before any request leaves the platform.

## Incident Handling

**Detect.** Unexpected errors are logged with an `error_id` that matches the one the client receives. Lockouts, IP blocks and the code cap stop repeated login attempts. The audit log records who changed what, and a broken hash chain shows that the log itself was tampered with.

**Contain.**

| Situation                      | Action                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| A staff account is compromised | Admin deactivates it (`PATCH /users/{id}/status`); every request is refused at once and device tokens are deleted               |
| A password may be known        | Admin sends a new password link (`POST /users/{id}/send-password-link`); the old link and password stop working once it is used |
| A secret or key leaked         | Revoke it in its console, set a new value in Heroku config vars, redeploy                                                         |
| `SECRET_KEY` leaked          | Replace it; every existing token and link becomes invalid and everyone signs in again                                             |
| Data is lost or corrupted      | Restore from the Supabase backup                                                                                                  |

**Investigate.** Use the `error_id` to find the log entry (`heroku logs`) and the audit log to rebuild the timeline of changes.

**Recover and review.** Fix the cause in a pull request with a test that reproduces it, record the incident and its fix in the gap register, and check the audit chain is intact afterwards.

Planned: a SIEM collecting security events, alerts when audit chain verification fails, and audit entries for lockout, IP block, code cap and test-account login events.

## Environment variables

| Variable                                                 | Required                       | Purpose                               |
| -------------------------------------------------------- | ------------------------------ | ------------------------------------- |
| `SECRET_KEY`                                           | Yes, 32+ characters            | Signs tokens and hashes login codes   |
| `ALLOWED_ORIGINS`                                      | Yes for the web app            | Comma-separated web app URLs for CORS |
| `ADMIN_INVITE_KEY`                                     | Only to create the first admin | Enables `POST /auth/invite-admin`   |
| `OTP_BYPASS_EMAILS`                                    | No, keep empty                 | Test tracker accounts only            |
| `MAX_BODY_BYTES`, `MAX_UPLOAD_BYTES`                 | No                             | Override the 1 MB and 12 MB limits    |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Yes for login                  | Login codes, lockouts, rate limits    |

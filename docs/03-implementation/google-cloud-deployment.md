# Google Cloud Deployment Runbook

## Status

Executed with explicit human approval on 2026-10-26. Production runs at `https://kinraidee-512615.web.app`, rewriting `/api/**` to Cloud Run service `kinraidee-api` in `asia-southeast1`.

## API Container

The repository-root build context is required because the API uses the workspace lockfile and shared TypeScript configuration.

```sh
docker build --target runtime --file src/api/Dockerfile --tag kinraidee-api:local .
```

The runtime image:

- uses Node.js 22 on Debian;
- contains production API dependencies and compiled output only;
- generates Prisma Client during the build without connecting to a database;
- rewrites compiled ESM imports to explicit `.js` paths so Node can start the output directly;
- runs as the non-root `node` user;
- listens on Cloud Run's default port `8080`;
- does not run migrations or seed during startup;
- keeps local uploads disabled.

Run a local container with throwaway test configuration:

```sh
docker run --rm --publish 8080:8080 \
  --env NODE_ENV=production \
  --env PORT=8080 \
  --env DATABASE_URL=postgresql://test:test@host.docker.internal:5432/kinraidee \
  --env JWT_SECRET=replace-with-a-local-secret-at-least-32-characters \
  --env CORS_ALLOWED_ORIGINS=http://localhost:5173 \
  --env LOCAL_UPLOADS_ENABLED=false \
  kinraidee-api:local
```

Then verify:

```sh
curl --fail http://localhost:8080/health
```

The health endpoint does not prove database connectivity. Database, migration, seed, authentication, Gemini, and Google Places checks remain separate deployment smoke tests.

## Artifact Registry And Cloud Build

Do not run this section until production resource creation is explicitly approved.

Choose the non-secret identifiers:

```sh
GCP_PROJECT_ID=<google-cloud-project-id>
GCP_REGION=asia-southeast1
ARTIFACT_REPOSITORY=kinraidee
IMAGE_NAME=kinraidee-api
IMAGE_TAG=<full-git-commit-sha>
```

Authenticate and select the project:

```sh
gcloud auth login
gcloud config set project "$GCP_PROJECT_ID"
```

Enable the required build and registry APIs:

```sh
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com
```

Create the Docker repository once:

```sh
gcloud artifacts repositories create "$ARTIFACT_REPOSITORY" \
  --repository-format=docker \
  --location="$GCP_REGION" \
  --description="Kinraidee deployment images"
```

Build and push an immutable commit-tagged image:

```sh
gcloud builds submit . \
  --config=cloudbuild.api.yaml \
  --substitutions=_REGION="$GCP_REGION",_REPOSITORY="$ARTIFACT_REPOSITORY",_IMAGE_NAME="$IMAGE_NAME",_IMAGE_TAG="$IMAGE_TAG"
```

Expected image reference:

```txt
asia-southeast1-docker.pkg.dev/<google-cloud-project-id>/kinraidee/kinraidee-api:<full-git-commit-sha>
```

Record the immutable image digest returned by Artifact Registry before Cloud Run deployment. Do not deploy the mutable `latest` tag.

## Secrets And Database Boundary

- Cloud Run runtime receives pooled `DATABASE_URL`, not `DIRECT_DATABASE_URL`.
- The controlled migration job receives direct `DIRECT_DATABASE_URL`.
- Neither connection string is a Docker build argument or image layer.
- `JWT_SECRET`, `GEMINI_API_KEY`, and `GOOGLE_PLACES_API_KEY` enter only through Secret Manager at runtime.
- Initial administrator credentials enter only the one-time seed job.

## Firebase Hosting

The committed `firebase.json` deploys `src/web/dist`, serves immutable Vite assets with a one-year cache, keeps `index.html` uncached, and applies baseline browser security headers.

Rewrite order is part of the contract:

1. `/api/**` proxies to the Cloud Run service `kinraidee-api` in `asia-southeast1` and pins the current Cloud Run revision to the Hosting release.
2. Every other unmatched path serves `/index.html` for React Router SPA refreshes.

Static files take precedence over rewrites, so existing Vite assets continue to be served directly by Hosting.

Do not run this section until production resource creation and public deployment are explicitly approved. Set the Firebase project to the Google Cloud project selected for Kinraidee:

```sh
FIREBASE_PROJECT_ID=<firebase-project-id>
FIREBASE_HOSTING_ORIGIN="https://${FIREBASE_PROJECT_ID}.web.app"
```

If Firebase has not been added to the existing Google Cloud project, add it through the Firebase console first. This does not require creating another Google Cloud project.

Build the web against its same-origin Hosting URL:

```sh
VITE_API_BASE_URL="$FIREBASE_HOSTING_ORIGIN" pnpm --filter web build
```

Validate the Hosting configuration without deploying:

```sh
pnpm dlx firebase-tools@15.34.1 hosting:channel:deploy preview \
  --project "$FIREBASE_PROJECT_ID" \
  --expires 1d
```

The preview-channel command creates an externally accessible preview and therefore still requires explicit deployment approval. For a production release:

```sh
pnpm dlx firebase-tools@15.34.1 deploy \
  --only hosting \
  --project "$FIREBASE_PROJECT_ID"
```

After deployment, verify:

```sh
curl --fail "$FIREBASE_HOSTING_ORIGIN/"
curl --fail "$FIREBASE_HOSTING_ORIGIN/meal"
curl --fail "$FIREBASE_HOSTING_ORIGIN/api/zones"
```

The `/meal` request verifies SPA fallback. The `/api/zones` request verifies the Hosting-to-Cloud Run rewrite and database path. Verify Cloud Run's `/health` directly before Hosting deployment. Authentication smoke tests must additionally confirm that the HTTP-only cookie is accepted through the Hosting origin.

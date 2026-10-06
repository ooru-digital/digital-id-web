# Digital ID Web

A self-service web app for applying for a verifiable Digital ID. The applicant enters their details, takes a live selfie, reviews a live preview of the card, and submits. The app then sends the application to a credential issuance API and tracks it until the signed credential is ready.

## Features

- Three-step application: personal details, selfie, then review with inline editing
- Live ID card preview with an ICAO 9303 TD1 machine-readable zone (MRZ), check digits included
- Selfie background removal in the browser using a MediaPipe segmentation model
- Polls issuance status by transaction ID, with timeouts and retry handling
- Success screen with a wallet QR code for adding the credential, a PDF download, and email delivery
- Drafts auto-save in the browser, so an unfinished application resumes on the next visit
- Respects the operating system's reduced-motion setting

## Tech stack

React 18, TypeScript, Vite 5, Tailwind CSS, Framer Motion and `@mediapipe/tasks-vision`. In production the app is served by nginx and deployed to Kubernetes with Helm.

## Getting started

### Prerequisites

- Node.js 18 or later
- Access to a credential issuance API: an API token, a credential template ID, an organisation code and an issuer email

### Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The dev server runs at `http://localhost:5173`. It proxies `/api/credentials` to the issuance API and adds the `Authorization` header from `ISSUER_API_TOKEN` (see `server.proxy` in `vite.config.ts`). If `ISSUER_API_TOKEN` isn't set, the dev server refuses to start. `npm run build` doesn't need the token.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run lint` | Run ESLint |

## Configuration

| Variable | When it's read | Description |
| --- | --- | --- |
| `ISSUER_API_TOKEN` | At runtime, by the proxy | Bearer token for the issuance API. Never included in the browser bundle |
| `VITE_ISSUER_TEMPLATE_ID` | At build time | Credential template that the Digital ID is issued from |
| `VITE_ISSUER_ORG_CODE` | At build time | Issuing organisation code |
| `VITE_ISSUER_EMAIL` | At build time | Email address of the issuing account |

For local development, all four go in `.env.local`. In production:

- the `VITE_*` values are Docker build arguments
- `ISSUER_API_TOKEN` is an environment variable on the running container, which nginx uses to add the `Authorization` header to proxied issuer requests

Other settings live in code:

- **API paths and polling** (interval, timeout): `src/config/apiConfig.ts`
- **Upstream API host:** `nginx.conf` for production and `vite.config.ts` for development
- **Fixed credential fields** that are not collected from the applicant (nationality, place of birth, district, village, chief): `MOCKED_DETAILS` in `src/utils/digitalIdCredential.ts`

To see how the portal calls the issuance API, or to connect it to a different issuance engine, read the [issuance engine integration guide](docs/issuer-integration.md).

## Project structure

```text
src/
  App.tsx                    Wizard flow, step state and draft persistence
  components/                Step screens (details, selfie, review, progress, result)
  components/ui/             Shared UI: buttons, fields, ID card preview, issued card
  config/apiConfig.ts        API endpoints, URL builders and request headers
  services/                  Issuance API client
  hooks/                     Issuance status polling
  utils/                     Credential payload, MRZ generation, background removal
public/
  models/                    Self-hosted MediaPipe selfie segmentation model
  fonts/, brand/             Static assets
helm/digital-id-web/         Helm chart (Deployment, Service, Ingress, Istio Gateway and VirtualService, HPA)
nginx.conf                   SPA routing and API reverse proxy
Dockerfile                   Multi-stage build: Node build, then nginx runtime
```

## Deployment

### Docker

The image is built without the token. The token is passed to the running container instead:

```bash
docker build \
  --build-arg VITE_ISSUER_TEMPLATE_ID=... \
  --build-arg VITE_ISSUER_ORG_CODE=... \
  --build-arg VITE_ISSUER_EMAIL=... \
  -t digital-id-web .

docker run -p 8080:80 -e ISSUER_API_TOKEN=... digital-id-web
```

At startup, nginx inserts `ISSUER_API_TOKEN` into its config and adds `Authorization: Bearer <token>` to requests it forwards to the issuance API. If the variable isn't set, nginx refuses to start.

### Kubernetes (Helm)

The chart reads the token from an existing Kubernetes Secret, so it never appears in the image or in Helm values. Create the Secret first:

```bash
kubectl create secret generic digital-id-web-issuer --from-literal=api-token=<token>
```

To use a different Secret name or key, change `issuer.apiTokenSecret` in `helm/digital-id-web/values.yaml`.

Then set `image.repository`, `image.tag` and `ingress.hosts`, in `values.yaml` or on the command line, and install:

```bash
helm upgrade --install digital-id-web ./helm/digital-id-web \
  --set image.repository=<your-registry>/digital-id-web \
  --set image.tag=<tag> \
  --set ingress.hosts[0].host=<your-domain>
```

## Security and privacy

- **The API token stays on the server.** The browser never receives it: nginx in production, and the Vite dev server locally, add the `Authorization` header when forwarding requests. Both proxies forward only the three calls the portal makes (issue, issuance status and PDF presentation) and return `404` for any other `/api/credentials/` path. Even so, use a token limited to issuance for a single template, and rotate it regularly.
- **Build-time variables are public.** Vite inlines every `VITE_*` variable into the JavaScript bundle, so never put a secret in one.
- **Never commit secrets.** `.env.local` is gitignored. Only `.env.example`, with empty values, belongs in the repository.
- **Drafts are stored unencrypted.** Unfinished applications, including the selfie, are kept in the browser's `localStorage` until the application is submitted or the user starts over. Don't rely on this on shared devices.
- **Reporting a vulnerability:** use GitHub's private vulnerability reporting on this repository. Please don't open a public issue.

## License

No license is granted. All rights reserved.

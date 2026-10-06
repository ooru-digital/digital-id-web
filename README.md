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

The dev server runs at `http://localhost:5173`. It proxies `/api/credentials` to the issuance API (see `server.proxy` in `vite.config.ts`).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run lint` | Run ESLint |

## Configuration

These values are read at build time from `.env.local`, or from Docker build arguments:

| Variable | Description |
| --- | --- |
| `VITE_ISSUER_API_TOKEN` | Bearer token for the issuance API |
| `VITE_ISSUER_TEMPLATE_ID` | Credential template that the Digital ID is issued from |
| `VITE_ISSUER_ORG_CODE` | Issuing organisation code |
| `VITE_ISSUER_EMAIL` | Email address of the issuing account |

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

```bash
docker build \
  --build-arg VITE_ISSUER_API_TOKEN=... \
  --build-arg VITE_ISSUER_TEMPLATE_ID=... \
  --build-arg VITE_ISSUER_ORG_CODE=... \
  --build-arg VITE_ISSUER_EMAIL=... \
  -t digital-id-web .

docker run -p 8080:80 digital-id-web
```

### Kubernetes (Helm)

Set `image.repository`, `image.tag` and `ingress.hosts` in `helm/digital-id-web/values.yaml`, or override them on the command line, and then install:

```bash
helm upgrade --install digital-id-web ./helm/digital-id-web \
  --set image.repository=<your-registry>/digital-id-web \
  --set image.tag=<tag> \
  --set ingress.hosts[0].host=<your-domain>
```

## Security and privacy

- **Build-time variables are public.** Vite inlines every `VITE_*` variable into the JavaScript bundle, so anyone who loads the app can read the API token. Use a token restricted to issuance for a single template, rotate it regularly, and prefer adding the `Authorization` header at the reverse proxy so the token never reaches the browser.
- **Never commit secrets.** `.env.local` is gitignored. Only `.env.example`, with empty values, belongs in the repository.
- **Drafts are stored unencrypted.** Unfinished applications, including the selfie, are kept in the browser's `localStorage` until the application is submitted or the user starts over. Don't rely on this on shared devices.
- **Reporting a vulnerability:** use GitHub's private vulnerability reporting on this repository. Please don't open a public issue.

## License

No license is granted. All rights reserved.

 <div align="center">

# PulseCloud

### Monitor the signal. Catch the downtime.

A website monitoring dashboard built to track availability, response times, and incidents across public websites.

📦 [Source Code](https://github.com/kathir165/PulseCloud)

![Status](https://img.shields.io/badge/status-in%20development-brightgreen)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB?logo=react)
![Backend](https://img.shields.io/badge/backend-Node.js-339933?logo=nodedotjs)

</div>

---

## Overview

PulseCloud brings website health checks and monitoring history into one dashboard. Add a public website, run a check, inspect its response time and status, and review recorded results over time.

## Features

- **Availability monitoring**: Check public HTTP and HTTPS endpoints.
- **Response-time tracking**: Record latency and HTTP status codes.
- **Retry verification**: Retry eligible failed checks before recording the final result.
- **Monitoring dashboard**: Explore service health, check history, charts, and incidents.
- **Scheduled monitoring**: Run checks through a protected cron endpoint.
- **URL safety checks**: Restrict protocols and ports and block private or reserved network addresses.
- **Flexible storage**: Use local file storage for development or Upstash Redis for hosted environments.
- **Interactive visuals**: Explore a dashboard built with charts, motion, and Three.js-powered scenes.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | Frontend library |
| TypeScript | Type-safe application code |
| Node.js | JavaScript runtime for server-side functionality |
| Three.js + React Three Fiber | 3D visualizations |
| Drei | 3D components and helpers |
| Recharts | Charts and monitoring data |
| Motion | UI animation |
| Upstash Redis | Optional hosted storage |

## Getting Started

### Requirements

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/kathir165/PulseCloud.git
cd PulseCloud
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Environment Configuration

Create a local `.env.local` file when you need scheduled monitoring or hosted storage.

| Variable | Purpose |
|---|---|
| `CRON_SECRET` | Protects the scheduled-check endpoint |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token |

The storage layer also supports `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

Example using placeholders only:

```dotenv
CRON_SECRET=replace-with-a-long-random-secret
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=replace-with-your-token
```

Never commit real credentials. Keep `.env.local` private.

## Scheduled Checks

The `/api/cron` endpoint runs checks for saved websites and requires an authorization header containing the configured `CRON_SECRET`.

Configure your scheduler to send that secret securely. Never expose it in browser-side code or public documentation.

## Security

PulseCloud's URL checker restricts accepted protocols and ports, blocks private or reserved IP addresses, and validates redirect destinations.

Keep environment files, local monitoring data, dependencies, and build output out of version control.

## Project Status

PulseCloud is an actively developed portfolio project. Features and deployment requirements may change as development continues.

---

Built by [kathir165](https://github.com/kathir165).

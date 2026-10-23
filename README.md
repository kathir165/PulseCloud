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

### Frontend

<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

### Backend and Runtime

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Next.js_API_Routes-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js API routes" />
</p>

### 3D, Animation and Charts

<p>
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/React_Three_Fiber-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Three Fiber" />
  <img src="https://img.shields.io/badge/Drei-7C3AED?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Drei" />
  <img src="https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Recharts" />
  <img src="https://img.shields.io/badge/Motion-FFFFFF?style=for-the-badge&logo=framer&logoColor=0055FF" alt="Motion" />
</p>

### Storage

<p align="left">
  <a href="https://upstash.com/">
    <img src="https://img.shields.io/badge/Upstash_Redis-00C7B7?style=flat-square&logo=upstash&logoColor=white" alt="Upstash Redis" />
  </a>
</p>
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

## ## Project Status

PulseCloud is currently under active development for DEXATHON at Sathyabama Institute of Science and Technology. Features and implementation may evolve as the project progresses toward the hackathon.

---

Built by [kathir165](https://github.com/kathir165).

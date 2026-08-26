# LEWS — Landslide Early Warning System

> **Created by Jai Kishore G.V.**

LEWS is a responsive landslide-monitoring dashboard prototype for exploring hyperlocal warning workflows, reported-event context, transparent risk inputs, and last-mile response information.

## What this project includes

The application contains a Surveyor’s Field Console interface with a terrain map, monitored zones, compact risk traces, a Zone Intelligence panel, explainable prototype-risk contributions, scenario controls, alert history, notification demonstrations, and a data-source section.

NASA EONET is used as the primary live public-event context. The server normalizes the public event feed, caches responses for approximately five minutes, and exposes explicit live, empty-feed, and failure-fallback states. The local sensor cards remain clearly labeled as simulated sensor state because no physical sensors are connected. The LEWS risk engine is a transparent prototype and is not a certified landslide prediction or government warning system.

## Run locally

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The app uses the full-stack React, Vite, Express, tRPC, and TypeScript setup included in this project. Environment values are supplied through the project environment; do not commit `.env` files or credentials.

## Verification

Run the type-check, production build, and test suite with:

```bash
pnpm check
pnpm build
pnpm test
```

The test suite covers authentication logout behavior, NASA EONET normalization and outage fallback, risk-engine thresholds, and deterministic presentation of demo, live, empty-feed, and external-failure states.

## Project structure

| Path | Purpose |
|---|---|
| `client/src/pages/Home.tsx` | Main LEWS dashboard and interactive console |
| `client/src/index.css` | Global visual system and responsive layout styles |
| `client/src/components/ManusDialog.tsx` | Reusable evidence drawer/modal wrapper |
| `client/src/lib/dataPresentation.ts` | Deterministic live/demo/fallback presentation states |
| `server/services/eonetService.ts` | NASA EONET fetch, normalization, caching, and fallback handling |
| `server/services/riskEngine.ts` | Modular prototype risk scoring boundary |
| `server/services/historicalLandslideService.ts` | Reserved historical-data service boundary |
| `server/routers.ts` | Public tRPC procedures for live events and risk scoring |
| `server/*.test.ts` | Server-side service and behavior tests |
| `client/src/lib/*.test.ts` | Client-side state-presentation tests |

## Important limitations

NASA EONET provides publicly reported natural-event context; it does not provide readings from local rain gauges, soil-moisture probes, slope-tilt sensors, or an official warning authority. The dashboard’s simulated sensor values and prototype risk score are for demonstration and product-development purposes only.

## Attribution

This website and its current LEWS interface were created by **Jai Kishore G.V.**

# 📑 03. File-by-File Exhaustive Codebase Reference

> **The Definitive Encyclopedia of Every Single File in the Repository**  
> *Detailed explanation of every file, its purpose, key exports, algorithms, configuration settings, dependencies, and error-handling mechanisms.*

---

## 📑 Quick Navigation

1. [Root Configuration & Build Files](#1-root-configuration--build-files)
2. [Vercel Serverless Entry Point (`api/`)](#2-vercel-serverless-entry-point-api)
3. [Server Core Infrastructure (`server/_core/`)](#3-server-core-infrastructure-server_core)
4. [Server Application Core & Storage (`server/`)](#4-server-application-core--storage-server)
5. [Server Domain Services (`server/services/`)](#5-server-domain-services-serverservices)
6. [Server Automated Test Suites (`server/*.test.ts`)](#6-server-automated-test-suites)
7. [Shared Types, Constants & Diagnostics (`shared/`)](#7-shared-types-constants--diagnostics-shared)
8. [Database Schema & ORM (`drizzle/`)](#8-database-schema--orm-drizzle)
9. [Client Application Bootstrap (`client/src/`)](#9-client-application-bootstrap-clientsrc)
10. [Client Contexts & Custom Hooks (`client/src/contexts/`, `hooks/`)](#10-client-contexts--custom-hooks)
11. [Client Domain Utilities & Translation (`client/src/lib/`)](#11-client-domain-utilities--translation-clientsrclib)
12. [Client Page Routes (`client/src/pages/`)](#12-client-page-routes-clientsrcpages)
13. [Client Feature & UI Components (`client/src/components/`)](#13-client-feature--ui-components-clientsrccomponents)
14. [Edge Firmware & Hardware Schematics (`firmware/`, `landslide/`)](#14-edge-firmware--hardware-schematics)

---

## 1. Root Configuration & Build Files

### `package.json`
- **Role & Purpose**: The master manifest for the entire project. Declares project metadata, executable scripts (`dev`, `build`, `start`, `check`, `test`, `db:push`), dependencies, and devDependencies.
- **Key Dependencies**:
  - `@google/genai` (^2.20.0): Official Google Gen AI SDK for Gemini 3.5 Flash inference.
  - `@trpc/server`, `@trpc/client`, `@trpc/react-query`: End-to-end type-safe RPC network protocol.
  - `react` (^19.2.1) & `react-dom`: Modern React 19 UI library.
  - `wouter` (^3.3.5): Ultra-lightweight client-side router (with native patch support).
  - `drizzle-orm` (^0.44.5) & `drizzle-kit`: Type-safe TypeScript ORM for MySQL/Postgres.
  - `leaflet` (^1.9.4): Open-source interactive map rendering engine.
  - `framer-motion` (^12.23.22): Fluid animation library for UI transitions and risk gauge dynamics.
  - `tailwindcss` (^4.1.14): Modern CSS engine for dark surveyor basalt styling.
  - `vitest` (^2.1.4): Blazing fast unit testing framework.
- **Scripts**:
  - `pnpm dev`: Boots the TypeScript Node server in watch mode using `tsx`.
  - `pnpm build`: Runs Vite client bundle build and esbuild server bundle to `/dist`.
  - `pnpm test`: Runs Vitest across all 14 unit test suites.
  - `pnpm check`: Performs full TypeScript static type checking without emitting files.

### `tsconfig.json` & `tsconfig.node.json`
- **Role & Purpose**: Configures the TypeScript 5.9 compiler settings for client, server, and shared directories.
- **Key Settings**:
  - `"strict": true`: Enforces strict null checks, type safety, and prevents implicit any.
  - `"moduleResolution": "bundler"`: Optimizes import resolution for Vite and esbuild.
  - `"paths"`: Configures path aliases: `@/*` -> `./client/src/*` and `@shared/*` -> `./shared/*`.

### `vite.config.ts`
- **Role & Purpose**: Configures Vite 7 for bundling the React single-page application.
- **Key Features**:
  - **Path Aliases**: Maps `@`, `@shared`, and `@assets` to absolute system paths.
  - **Code Splitting (manualChunks)**: Separates heavy vendor libraries (`react`, `trpc`, `wouter`, `radix`, `icons`) into independent chunk files to optimize browser loading speed.
  - **Manus Debug Collector Plugin**: Injects a lightweight in-browser logging hook (`/__manus__/debug-collector.js`) that captures client console errors and network failures during local testing.
  - **GitHub Pages Support**: Automatically adapts base URL when `GITHUB_PAGES=true`.

### `vitest.config.ts`
- **Role & Purpose**: Configuration for Vitest test runner. Sets Node.js test environment, path aliases matching `vite.config.ts`, and test file pattern matchers (`**/*.test.ts`).

### `drizzle.config.ts`
- **Role & Purpose**: Configures Drizzle-Kit CLI for generating and applying database schema migrations. Points to `./drizzle/schema.ts` with `mysql` dialect.

### `components.json`
- **Role & Purpose**: Configuration file for shadcn/ui CLI component generator. Specifies Tailwind CSS v4 base path (`client/src/index.css`), style variant (`new-york`), and path aliases.

### `vercel.json`
- **Role & Purpose**: Serverless deployment configuration for Vercel. Directs build command to `pnpm build`, sets output directory to `dist/public`, and routes API requests to `/api` serverless handler.

### `patches/wouter@3.7.1.patch`
- **Role & Purpose**: Local patch applied by `pnpm` to Wouter router. Collects all registered routes onto `window.__WOUTER_ROUTES__` to facilitate automated link auditing and debug inspection.

### `metadata.json` & `template.json`
- **Role & Purpose**: Platform and environment metadata defining template features, capabilities, and system properties.

### `README.md`, `LICENSE`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `ideas.md`, `todo.md`
- **Role & Purpose**: Repository governance, open-source MIT license, contributor guidelines, and developmental roadmap notes.

---

## 2. Vercel Serverless Entry Point (`api/`)

### `api/index.ts`
- **Role & Purpose**: The serverless function entry point for cloud hosting on platforms like Vercel.
- **Technical Anatomy**:
  - Initializes an Express application instance.
  - Configures JSON and URL-encoded body parsers with a 50MB payload limit.
  - Registers the OAuth authentication routes (`registerOAuthRoutes`) and storage proxy (`registerStorageProxy`).
  - Exposes the REST hardware telemetry ingestion endpoint (`POST /api/telemetry/ingest`) for ESP32 and gateway posts.
  - Mounts the full tRPC API middleware at `/api/trpc` using `appRouter` and `createContext`.
  - Exports the configured Express app as the default serverless export.

---

## 3. Server Core Infrastructure (`server/_core/`)

### `server/_core/index.ts`
- **Role & Purpose**: The master Node.js backend server bootstrap.
- **Key Logic**:
  - Initializes the Express server and HTTP server.
  - Implements dynamic port searching (`findAvailablePort`) starting from port 3000 if default ports are occupied.
  - In development mode (`NODE_ENV !== "production"`), mounts Vite development middleware (`setupVite`) with Hot Module Replacement (HMR).
  - In production mode, serves optimized static assets from `dist/public` via `serveStatic`.
  - Registers the `/api/telemetry/ingest` REST endpoint and `/api/trpc` endpoint.

### `server/_core/context.ts`
- **Role & Purpose**: Constructs the tRPC execution context for every incoming HTTP request.
- **Key Logic**: Parses session cookies from `req.headers.cookie` using `sdk.verifySessionToken`. Injects authenticated `user` object, `req`, and `res` into the tRPC context.

### `server/_core/trpc.ts`
- **Role & Purpose**: Initializes the tRPC router and defines procedure access guards.
- **Key Exports**:
  - `router`: Factory function for building tRPC sub-routers.
  - `publicProcedure`: Open procedure accessible by public citizens without authentication.
  - `protectedProcedure`: Enforces valid session token authentication, throwing `UNAUTHORIZED` (10001) if absent.
  - `adminProcedure`: Enforces `user.role === 'admin'`, throwing `FORBIDDEN` (10002) if permission is insufficient.

### `server/_core/cookies.ts`
- **Role & Purpose**: Generates secure session cookie options (HttpOnly, SameSite, Secure flags, path, and maxAge).

### `server/_core/env.ts`
- **Role & Purpose**: Loads and strongly types system environment variables (e.g. `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, `PORT`).

### `server/_core/sdk.ts`
- **Role & Purpose**: Backend helper SDK for creating, signing, and verifying JWT session tokens using the `jose` library.

### `server/_core/oauth.ts`
- **Role & Purpose**: Implements OAuth authorization routes (`/api/oauth/login`, `/api/oauth/callback`) with state cookie CSRF validation.

### `server/_core/systemRouter.ts`
- **Role & Purpose**: tRPC system router exposing server heartbeat and platform status checks (`system.health`).

### `server/_core/storageProxy.ts`
- **Role & Purpose**: Implements `/manus-storage/*` proxy route for serving presigned media downloads and attachments.

### `server/_core/llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts`, `dataApi.ts`, `heartbeat.ts`, `map.ts`, `notification.ts`, `vite.ts`
- **Role & Purpose**: Internal server utilities supporting multi-modal platform capabilities, LLM invocation wrappers, and Vite development server mounting.

---

## 4. Server Application Core & Storage (`server/`)

### `server/index.ts`
- **Role & Purpose**: Root export entry point for the compiled production server.

### `server/routers.ts`
- **Role & Purpose**: The master tRPC router definition (`appRouter`) containing all API endpoints across the system.
- **Key Sub-Routers**:
  - `auth`: `me`, `googleSignIn`, `logout`.
  - `chat`: `quota`, `send` (Multi-turn conversational geotechnical AI assistant with role instructions and tool groundings).
  - `grounding`: `search` (Google Search grounding), `maps` (Google Maps terrain corridor grounding).
  - `landslides`: `list` (fetches normalized NASA EONET events), `historicalLayer` (ISRO Bhuvan geological baseline).
  - `risk`: `score` (deterministic 4-factor calculation), `assistant` (contextual Q&A), `aiAnalysis` (structured LLM assessment).
  - `iot`: `deviceHealth` (ESP32 node battery, RSSI, heap, sensor pin status).
  - `validation`: `validate` (runs the 5-stage anomaly quarantine engine).
  - `alerts`: `operatorApproval` (triggers official 1-click SMS/siren dispatch with delivery logs).
  - `translate`: `text`, `batch` (high-speed Google Translate proxy).
  - `platform`: `capabilities` (transparent service boundary status).

### `server/storage.ts`
- **Role & Purpose**: Media and object storage abstraction supporting presigned S3/Forge uploads and downloads.

### `server/db.ts`
- **Role & Purpose**: Database connector using Drizzle ORM and `mysql2`. Implements `getDb`, `upsertUser`, and `getUserByOpenId` with automatic fallback when database credentials are not present.

---

## 5. Server Domain Services (`server/services/`)

### `server/services/riskEngine.ts`
- **Role & Purpose**: The core mathematical 4-factor deterministic risk calculation algorithm.
- **Key Functions**:
  - `riskLevel(score: number)`: Classifies numeric score ($0-100$) into `LOW` (0-25), `MODERATE` (26-50), `HIGH` (51-75), or `CRITICAL` (76-100).
  - `calculatePrototypeRisk(inputs)`: Clamps inputs to $0-100$ and calculates the equal-weighted average.

### `server/services/anomalyValidationService.ts`
- **Role & Purpose**: The 5-stage deterministic sensor data validation and anomaly quarantine pipeline.
- **Key Logic**: Evaluates timestamps, physical ranges, sudden $>0.08^\circ$ tilt spikes, stuck sensor flatlines, and cross-source discrepancies. Calculates Data Confidence Score ($0-100\%$) and generates safe fallback substitutions.

### `server/services/geminiAiService.ts`
- **Role & Purpose**: Google Gemini 3.5 Flash integration supporting multi-turn chat, system instructions for 3 persona roles (`GEOTECHNICAL_SPECIALIST`, `DISASTER_COORDINATOR`, `FIELD_SURVEYOR`), and Google Search/Maps tool groundings.

### `server/services/aiRiskService.ts`
- **Role & Purpose**: Translates calculated risk scores and environmental data into structured situation assessments, contributing factors, safety recommendations, and localized warnings in 5 Indian languages.

### `server/services/eonetService.ts`
- **Role & Purpose**: NASA Earth Observatory Natural Event Tracker (EONET v3) client. Fetches active global landslide events, normalizes GeoJSON geometries, caches results for 5 minutes, and provides an 8s fail-safe timeout fallback.

### `server/services/hardwareIngestService.ts`
- **Role & Purpose**: Ingestion handler for live IoT edge hardware. Validates incoming sensor payloads, computes weighted geotechnical risk ($40\%$ Rain + $35\%$ Soil + $25\%$ Tilt), and updates the live hardware node state buffer.

### `server/services/historicalLandslideService.ts`
- **Role & Purpose**: Defines integration boundaries and geological baseline data layers for historical landslide zones.

### `server/services/platformServices.ts`
- **Role & Purpose**: Returns explicit status for all platform integration boundaries (Weather, Routing, IoT Bridge, Notification Dispatch), ensuring the system never masquerades simulated data as live external connections.

### `server/services/quotaService.ts`
- **Role & Purpose**: Manages daily AI query quotas (30 queries/day for standard users, 500 queries/day for emergency operators) with midnight UTC reset calculation.

### `server/services/reportSyncService.ts`
- **Role & Purpose**: Manages offline citizen incident report queues and validation rules.

### `server/services/googleTranslateService.ts`
- **Role & Purpose**: High-speed translation service supporting 30+ Indic and global languages with an in-memory translation LRU cache.

---

## 6. Server Automated Test Suites

- `server/riskEngine.test.ts`: Verifies mathematical risk boundaries, clamping, and risk level classifications.
- `server/anomalyValidation.test.ts`: Tests spike quarantine ($>0.08^\circ$), negative rain rejection, soil range checks, and confidence score penalties.
- `server/hardwareIngestService.test.ts`: Verifies edge payload parsing, risk computation, and live buffer state caching.
- `server/eonetService.test.ts`: Tests NASA GeoJSON normalization, caching expiration, and network failure fallback.
- `server/aiRiskService.test.ts`: Validates localized domain assessment generation, multilingual safety warnings, and insufficient-data states.
- `server/googleTranslateService.test.ts`: Tests English fast-path, Indic translations, and concurrent batch lookups.
- `server/platformServices.test.ts`: Verifies capability boundary contracts.
- `server/reportSyncService.test.ts`: Tests citizen report schema validation.
- `server/auth.logout.test.ts`: Verifies cookie clearance on logout.

---

## 7. Shared Types, Constants & Diagnostics (`shared/`)

### `shared/const.ts`
- **Role & Purpose**: Shared constants between client and server: `COOKIE_NAME` (`app_session_id`), `ONE_YEAR_MS`, `AXIOS_TIMEOUT_MS`, error message constants, and base64 OAuth state encoder/decoder helpers.

### `shared/types.ts`
- **Role & Purpose**: Unified TypeScript type exports re-exporting Drizzle schema definitions and error classes.

### `shared/debugCollector.ts`
- **Role & Purpose**: Client-side diagnostic telemetry script string embedded into HTML during development.

### `shared/_core/errors.ts`
- **Role & Purpose**: Standardized error hierarchy (`AppError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`).

---

## 8. Database Schema & ORM (`drizzle/`)

### `drizzle/schema.ts`
- **Role & Purpose**: MySQL schema definition using Drizzle ORM.
- **Key Tables**:
  - `users`: Surrogate integer `id`, unique `openId`, `name`, `email`, `loginMethod`, `role` (`user` | `admin`), `createdAt`, `updatedAt`, `lastSignedIn`.

### `drizzle/relations.ts`
- **Role & Purpose**: Entity relationship mappings between database tables.

---

## 9. Client Application Bootstrap (`client/src/`)

### `client/index.html`
- **Role & Purpose**: The Single-Page Application (SPA) HTML template with dark theme metadata, responsive viewport headers, and Google Fonts preconnects.

### `client/public/sw.js`
- **Role & Purpose**: Service Worker script enabling offline asset caching and Web Push Notification event handling.

### `client/src/main.tsx`
- **Role & Purpose**: Client entry point. Sets up React 19 root, initializes `QueryClient` (TanStack Query), configures the `trpcClient` with `httpBatchLink` and `superjson` transformer, subscribes to unauthorized API errors for automatic redirect, registers the Service Worker, and renders `<App />`.

### `client/src/App.tsx`
- **Role & Purpose**: Master client routing switcher using Wouter.
- **Configured Routes**:
  - `/`: `LandingPage` (Marketing & Problem Narrative)
  - `/dashboard`: `DashboardPage` (Surveyor's Operational Console)
  - `/ai-chatbot` & `/ai-assistant`: `AiChatbotPage` (Interactive Geotechnical Chatbot)
  - `/login`: `LoginPage` (Observer Login & 1-Click Guest Demo)
  - `/signup`: `SignupPage` (Observer Registration)
  - `/settings`: `SettingsPage` (Preferences & Language)
  - `*`: `NotFound` (404 Error Page)

### `client/src/const.ts`
- **Role & Purpose**: Client helper for initiating OAuth login redirects.

### `client/src/index.css`
- **Role & Purpose**: Master design stylesheet using Tailwind CSS v4. Defines basalt dark color variables, glassmorphism card surfaces, pulsating alert radar animations, custom scrollbars, and responsive typography tokens.

---

## 10. Client Contexts & Custom Hooks

### `client/src/contexts/CriticalRiskToastContext.tsx`
- **Role & Purpose**: Global context provider for managing high-priority critical hazard toasts, alert sounds, snooze states, and operator acknowledgment queues.

### `client/src/contexts/ThemeContext.tsx`
- **Role & Purpose**: Provides application theme switching (defaulting to dark surveyor console mode).

### `client/src/_core/hooks/useAuth.ts`
- **Role & Purpose**: React hook wrapping `trpc.auth.me.useQuery()` to provide current user state, `isAuthenticated`, `isGoogleAccount`, and logout actions.

### `client/src/hooks/useMobile.tsx`
- **Role & Purpose**: React hook returning a boolean indicating if the screen viewport is less than 768px (mobile breakpoint).

### `client/src/hooks/useComposition.ts` & `usePersistFn.ts`
- **Role & Purpose**: Utility hooks for handling IME text composition (e.g. Indic keyboard input) and persistent stable function references.

---

## 11. Client Domain Utilities & Translation (`client/src/lib/`)

### `client/src/lib/trpc.ts`
- **Role & Purpose**: Creates and exports the strongly-typed tRPC React client (`createTRPCReact<AppRouter>()`).

### `client/src/lib/utils.ts`
- **Role & Purpose**: Common UI utility function `cn(...inputs)` combining `clsx` and `tailwind-merge` for safe Tailwind class composition.

### `client/src/lib/notificationTranslations.ts`
- **Role & Purpose**: Comprehensive pre-compiled notification translation matrix providing zero-latency incident alerts across 5 languages (English, Kannada, Tamil, Telugu, Malayalam) for 6 notification categories.

### `client/src/lib/useTranslation.ts`
- **Role & Purpose**: Custom React hook for accessing instant multilingual strings and triggering dynamic Google translations.

### `client/src/lib/anomalyValidator.ts`
- **Role & Purpose**: Client-side mirror of the 5-stage validation checks for instant UI form feedback.

### `client/src/lib/reportQueue.ts`
- **Role & Purpose**: Offline-first localStorage queue manager for citizen field hazard reports.

### `client/src/lib/dataPresentation.ts`, `aiAnalysisFlow.ts`, and test files
- **Role & Purpose**: Formatting helpers for geotechnical units, timestamps, risk badges, and test validation.

---

## 12. Client Page Routes (`client/src/pages/`)

### `client/src/pages/LandingPage.tsx`
- **Role & Purpose**: The public marketing landing page. Features outcome-first hero, interactive live product telemetry preview, problem/cost comparison, 4-step workflow (Sense → Analyze → Explain → Act), feature showcase, FAQ accordion, and call-to-action buttons.

### `client/src/pages/DashboardPage.tsx`
- **Role & Purpose**: The flagship operational console. Integrates the 6-zone telemetry ribbon, interactive GIS terrain map, 4-factor risk gauges, 7-scenario storm sandbox, Gemini AI risk intelligence card, road corridor tracker, 48-hour forecast horizon, and offline citizen reporting drawer.

### `client/src/pages/AiChatbotPage.tsx`
- **Role & Purpose**: Standalone multi-turn conversational AI assistant page. Allows users to switch between 3 persona roles, test Google Search and Maps groundings, view sources/citations, and inspect daily API quota usage.

### `client/src/pages/LoginPage.tsx` & `SignupPage.tsx`
- **Role & Purpose**: User sign-in and registration pages featuring 1-click **"Guest Field Observer (Demo)"** access for instant evaluator testing.

### `client/src/pages/SettingsPage.tsx`
- **Role & Purpose**: System preferences page for selecting primary notification language, polling intervals, and purging offline cache data.

### `client/src/pages/ComponentShowcase.tsx`
- **Role & Purpose**: Design system showcase displaying all Radix UI primitives, buttons, badges, modals, and typography components.

### `client/src/pages/NotFound.tsx`
- **Role & Purpose**: Custom 404 error page with navigation links back to the landing page and dashboard.

---

## 13. Client Feature & UI Components (`client/src/components/`)

### `client/src/components/InteractiveGisMap.tsx`
- **Role & Purpose**: Interactive Leaflet GIS terrain map with custom India projection, elevation topography textures, monitored zone telemetry markers, NASA EONET event overlays, and click-to-inspect GPS coordinates.

### `client/src/components/GeminiChatbot.tsx`
- **Role & Purpose**: Feature-rich floating/embedded AI chatbot component supporting Markdown rendering, live telemetry context injection, role selection, search grounding citations, and place cards.

### `client/src/components/HardwareSimulatorModal.tsx`
- **Role & Purpose**: Interactive modal allowing testers to simulate real-time ESP32 edge sensor adjustments (Rainfall slider, Soil Moisture slider, Inclinometer Tilt slider) and observe live risk engine responses.

### `client/src/components/SlopeStabilityModal.tsx`
- **Role & Purpose**: Geotechnical engineering calculator displaying Bishop's Simplified Method, Factor of Safety (FoS) calculations, and pore pressure graphs.

### `client/src/components/SearchGroundingPanel.tsx` & `MapsGroundingPanel.tsx`
- **Role & Purpose**: Dedicated verification panels demonstrating live Google Search and Google Maps grounded queries with interactive citation badges.

### `client/src/components/GoogleAuthModal.tsx`
- **Role & Purpose**: Authentication modal prompting users to sign in to unlock live Gemini 3.5 AI decision support.

### `client/src/components/CriticalRiskToastContainer.tsx`
- **Role & Purpose**: Global emergency toast notification container rendering high-visibility alerts with sirens, multi-language message previews, and 1-click acknowledgment buttons.

### `client/src/components/LanguageSwitcher.tsx`
- **Role & Purpose**: Dropdown selector allowing instant switching between English, Kannada, Tamil, Telugu, and Malayalam across the entire console.

### `client/src/components/DashboardLayout.tsx`, `DashboardLayoutSkeleton.tsx`, `DashboardSkeletons.tsx`
- **Role & Purpose**: Shell layout wrappers providing navigation bars, sidebar links, status indicators, and shimmer loading skeletons.

### `client/src/components/ErrorBoundary.tsx` & `LoadingSpinner.tsx`
- **Role & Purpose**: Catch-all React error boundary displaying recovery options during uncaught errors, and animated SVG loading spinners.

### `client/src/components/landing/ProductPreview.tsx`
- **Role & Purpose**: Controlled marketing preview component embedded in the landing page hero section.

### `client/src/components/ui/*`
- **Role & Purpose**: 35+ accessible, reusable UI primitive components built with Radix UI and styled with Tailwind CSS (Accordion, Alert, AspectRatio, Avatar, Badge, Button, Card, Dialog, DropdownMenu, Form, Input, Progress, Select, Sheet, Skeleton, Slider, Sonner, Table, Tabs, Tooltip, etc.).

---

## 14. Edge Firmware & Hardware Schematics

### `firmware/esp32_landsora_node.ino`
- **Role & Purpose**: Arduino C++ firmware for the ESP32 field telemetry node.
- **Key Logic**: Configures GPIO 4 interrupt for tipping-bucket rain gauge, reads capacitive soil moisture on ADC1 (GPIO 34), reads MPU6050 accelerometer over I2C (GPIO 21/22), measures battery voltage divider (GPIO 35), constructs a JSON telemetry document, and transmits over Wi-Fi/MQTT every 2.5 seconds.

### `landslide/architecture/SYSTEM_ARCHITECTURE.md` & `COMMUNICATION_PROTOCOL.md`
- **Role & Purpose**: Comprehensive hardware communication specifications, MQTT topic hierarchies, LoRaWAN payload formats, and edge state-machine diagrams.

### `landslide/hardware/HARDWARE_SPECIFICATION.md`, `WIRING_DIAGRAM.md`, `CALIBRATION_GUIDE.md`
- **Role & Purpose**: Complete hardware Bill of Materials (BOM), solar power calculation spreadsheets, electrical pinout wiring diagrams, and sensor calibration procedures (2-point soil calibration, IMU gravity zeroing).

### `landslide/firmware/esp32_lews_node/config.h` & `esp32_lews_node.ino`
- **Role & Purpose**: Production-grade FreeRTOS firmware implementation supporting ESP32 deep sleep cycles, hardware timer wakeups, and dual uplink failover (Cellular/LoRa).

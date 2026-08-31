# Contributing to LEWS (Landslide Early Warning System)

Thank you for your interest in contributing to **LEWS**! This project is an open-source landslide-monitoring dashboard and early-warning decision-support prototype.

---

## Code of Conduct

All contributors and maintainers are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to project maintainers.

---

## Development Setup

### 1. Prerequisites
- **Node.js**: v20.x or v22.x LTS (v18+ supported)
- **pnpm**: v10.x recommended (`corepack enable` or `npm install -g pnpm`)
- **Git**: Installed and configured

### 2. Fork and Clone
```bash
git clone https://github.com/Saravanan-Codez/HACKATHON-LEWS.git
cd HACKATHON-LEWS
```

### 3. Install Dependencies
```bash
pnpm install
```
*(If using standard npm: `npm install --legacy-peer-deps`)*

### 4. Configure Environment
```bash
cp .env.example .env
```

### 5. Start Development Server
```bash
pnpm dev
```
Navigate to `http://localhost:3000` in your browser.

---

## Branching & Commit Guidelines

1. **Branch Naming**:
   - `feature/your-feature-name`
   - `fix/issue-description`
   - `docs/documentation-update`
2. **Commit Messages**:
   - Write clear, concise, imperative commit messages:
     - `feat: add offline queue synchronization helper`
     - `fix: correct coordinate projection formula for Eastern Himalayas`
     - `docs: update Windows setup instructions`

---

## Verification Before Submitting PR

Before opening a Pull Request, ensure that all checks pass:

```bash
# 1. Run TypeScript typecheck
pnpm check

# 2. Run unit and integration tests
pnpm test

# 3. Test production build
pnpm build
```

---

## Architectural Principles

When making contributions:
1. **Preserve Operational Clarity**: Maintain the "Surveyor's Field Console" design aesthetic (basalt surfaces, limestone typography, calm urgency).
2. **Deterministic Risk Baseline**: Keep the 4-factor deterministic risk calculation explainable and transparent.
3. **Honest System Boundaries**: Clearly delineate live public feeds (NASA EONET) from simulated sensor channels. Never pretend demo data is certified government warning telemetry.
4. **Multilingual Inclusivity**: Ensure new alert templates or system messages include regional language translations (English, Tamil, Telugu, Kannada, Malayalam).

---

## Questions or Ideas?

Open an issue on GitHub to discuss proposed features, bug fixes, or dataset integrations.

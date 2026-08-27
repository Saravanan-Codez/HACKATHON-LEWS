# LEWS Interaction Verification

This note records the verification scope for the disaster-intelligence expansion. The dashboard was checked at desktop and mobile widths after the final implementation pass.

| Module | Verified behavior | Scope |
|---|---|---|
| Report queue | Category, severity, description, attachment filename, and map or browser location are assembled into a local `lews-report-queue` payload. | Local prototype only; no remote upload or authority dispatch. |
| Geolocation | The browser permission path attaches coordinates when granted and shows a clear fallback message when denied or unavailable. | Browser capability dependent. |
| Network control | The system-health control cycles through ONLINE, LIMITED NETWORK, and OFFLINE MODE with a visible notice. | UI simulation; NASA requests are not replaced by an offline backend. |
| Language control | English, Hindi, Assamese, and Bengali choices update the selected notification language and show provider-integration status. | Translation templates are not delivered externally. |
| Road and impact modules | Road status, exposure estimate, emergency access, alternative-route recommendation, and response priority update from the selected prototype risk score. | Prototype inference; no live road-closure or routing feed. |
| Forecast module | Five horizon rows update from the selected zone’s scenario-derived rainfall and prototype risk. | Not a certified weather forecast. |
| NASA live, empty, and fallback states | NASA EONET reported events, no-event feed, and external-failure messaging remain distinct from demo and simulated sensor state. | NASA public-event context only. |

All final checks passed with `pnpm check`, `pnpm build`, and `pnpm test`. The test suite covers authentication, NASA normalization and fallback, prototype risk thresholds, capability boundaries, local report validation, local report queue storage, and data-state presentation.

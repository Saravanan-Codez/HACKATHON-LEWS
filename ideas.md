# LEWS SaaS Overhaul Design Direction

## Chosen Approach: Tectonic Signal OS

### Design Movement
A high-end climate-tech SaaS system blending Swiss information design, precision instrumentation, and restrained glassmorphism. The emotional intent is confident operational intelligence: serious enough for emergency planning, polished enough for a modern product launch.

### Core Principles
1. Make complex risk legible in seconds through strong hierarchy, concise labels, and visible system state.
2. Use depth sparingly: translucent mineral cards, thin luminous borders, and soft atmospheric gradients should clarify structure rather than decorate it.
3. Every interaction must reveal an outcome, whether that is a filtered zone set, an opened evidence drawer, an expanded answer, or a clear demo confirmation.
4. The product should feel ownable and productized, not like a generic dashboard or a template preview.

### Color Philosophy
Keep LEWS rooted in basalt and limestone, then introduce a cool signal cyan for live telemetry and a warm survey ochre for decisions. Glass surfaces use low-opacity slate with cyan or ochre edge light; critical states stay iron red. No purple gradients, generic tool badges, AI claims, or vendor watermarks appear anywhere in the UI.

### Layout Paradigm
A product-led landing page with an asymmetric split hero: editorial promise on the left and a live product preview on the right. The narrative then moves through proof metrics, filterable monitoring cards, evidence modules, FAQ, and a final operator CTA. Dashboard density is reserved for the product preview while the landing page remains breathable and conversion-oriented.

### Signature Elements
- Frosted mineral cards with hairline borders, ambient gradient halos, and small telemetry ticks.
- A live product preview that behaves like a real monitoring console: filters change cards, the selected zone opens a detail drawer, and activity counters update.
- Compact signal labels such as LIVE NETWORK, DATA LINEAGE, and RESPONSE READY paired with precise Lucide iconography.

### Interaction Philosophy
The interface should reward inspection. Filter chips immediately reduce or expand monitored zones; clicking a zone opens a rich evidence drawer; FAQ questions expand in place; demo actions provide explicit confirmations. Motion is short, compositional, and never ornamental for its own sake.

### Animation
Use 160–240ms ease-out transitions for cards, chips, drawers, and accordion panels. Let hero preview surfaces drift by a few pixels only when motion is allowed. Use opacity and transform for reveal states, preserve instant keyboard interactions, and respect reduced-motion preferences.

### Typography System
Use Space Grotesk for display headlines and UI labels, IBM Plex Mono for telemetry values, and a readable system sans for body copy. Headlines should be compact, slightly technical, and sentence-led. Mono values should look measured and tabular, never decorative.

### Brand Essence
LEWS is a transparent hyperlocal landslide-risk platform for emergency planners, researchers, and field operators; it turns fragmented slope signals into explainable action. Personality: **precise, vigilant, accountable**.

### Brand Voice
Headlines sound consequential but constructive. CTAs use direct operator verbs. Microcopy names what is simulated and what the user can inspect.

Example lines:
- “See the signal before it becomes a bulletin.”
- “Open the evidence trail.”

### Wordmark & Logo
Keep the contour-ridge mark, but pair it with a compact uppercase LEWS wordmark and a small SIGNAL OS descriptor. The lockup should read as a product identity rather than a generic institutional header.

### Signature Brand Color
Signal Cyan: `#7DE2D1`, used for live telemetry, active filters, and evidence links against basalt surfaces. Survey Ochre remains the decision accent for risk and action.

## Implementation Guardrails

Remove any “Built by AI”, “Powered by AI”, default template, or vendor watermark language from visible UI. Preserve the truthful simulation disclaimer for the prototype. Use the existing external image assets only where they reinforce the product story, and avoid changing backend or server code for this frontend-only overhaul.

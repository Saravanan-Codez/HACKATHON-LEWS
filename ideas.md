# LEWS Design Direction

## Three Initial Approaches

### Theme Name: Surveyor's Field Console
Very Brief Intro: A restrained geological-monitoring command interface with survey-map textures, serif section headings, and dense but legible operational readouts. It feels like a field instrument translated into a calm emergency-operations room.
Probability: 0.04

### Theme Name: Monsoon Archive
Very Brief Intro: A documentary editorial system using weathered paper tones, archival annotations, and a regional map narrative. It prioritizes public understanding and institutional credibility over live-operational density.
Probability: 0.07

### Theme Name: Ember Ridge
Very Brief Intro: A dark command-center interface with restrained amber and red status accents, strong telemetry typography, and subtle topographic lines. It emphasizes urgency without drifting into cyberpunk or neon aesthetics.
Probability: 0.03

## Chosen Approach: Surveyor's Field Console

### Design Movement
Contemporary Swiss information design fused with geological survey cartography and emergency-operations console conventions.

### Core Principles
1. Operational clarity before decoration: every panel answers what is happening, where, and why.
2. Measured contrast: muted mineral surfaces carry restrained status colors only where action or change matters.
3. Evidence in view: readings, formulas, timestamps, and source labels remain visible rather than hidden behind ornamental UI.
4. Calm urgency: critical states are unmistakable but never flashing, noisy, or sensationalized.

### Color Philosophy
The charcoal background and basalt panels evoke field equipment and rock strata. Warm limestone text is easier on the eye than pure white during long monitoring sessions. Moss, ochre, and iron-red are reserved for Stable, Watch, and Critical states so the meaning of color remains consistent and actionable.

### Layout Paradigm
A vertical operational narrative: a narrow sticky instrument rail frames a broad command canvas; the hero introduces the problem, the live dashboard becomes the visual anchor, and supporting sections unfold as annotated evidence rather than a marketing card grid. Dashboard columns collapse into a deliberate inspection stack on mobile.

### Signature Elements
- Fine contour-line and coordinate overlays that sit quietly behind major surfaces.
- Small uppercase field labels paired with IBM Plex Mono telemetry values.
- A vertical status rail and thin amber selection markers that make active zones feel surveyed rather than selected from a SaaS menu.

### Interaction Philosophy
Interactions should feel like operating a dependable instrument: selection is immediate, transitions are short and legible, and every action reveals state. Scenario controls visibly change the data model and event log rather than merely animating a button.

### Animation
Use 180–260ms ease-out transitions for panel state, marker emphasis, and navigation. Sensor values update with subtle numeric transitions; avoid bouncing or glowing. Scenario escalation may use a restrained progress sweep and a one-time status emphasis. Respect reduced-motion preferences.

### Typography System
Use Fraunces for large editorial headings and section titles, Inter/system sans for labels and explanatory copy, and IBM Plex Mono for readings, timestamps, scores, IDs, coordinates, and logs. Headings should be compact and slightly editorial; telemetry should be tabular, tight, and highly scannable.

### Brand Essence
LEWS is a transparent hyperlocal landslide-risk prototype for emergency planners, researchers, and hackathon reviewers; it is different because it shows the path from simulated measurement to explainable warning. Personality: **measured, vigilant, accountable**.

### Brand Voice
Headlines are direct and consequential. CTAs use operational verbs. Microcopy states limitations without hedging or hype.

Example lines:
- “Read the slope before the bulletin catches up.”
- “Run the storm scenario”

### Wordmark & Logo
A compact monogram built from two offset contour arcs forming an abstract ridge and warning notch, paired with the LEWS wordmark in a condensed uppercase treatment. The mark should work as a bold, text-free icon on its own.

### Signature Brand Color
Survey Ochre: `#D6A24E`, used as the ownable selection and active-monitoring accent against basalt surfaces.

## Implementation Reminder
Ask of each choice: “Does this reinforce or dilute the Surveyor's Field Console philosophy?”
